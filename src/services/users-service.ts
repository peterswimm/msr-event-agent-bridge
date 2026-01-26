/**
 * Users Service
 * Handles user profiles and bookmark management
 */

import pino from 'pino';
import { cosmosDB } from './cosmos-db-client.js';
import { MOCK_USERS, MOCK_BOOKMARKS } from './mock-data.js';

const logger = pino();

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  department?: string;
  role?: 'user' | 'curator' | 'admin';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  entityId: string;
  entityType: 'event' | 'session' | 'project';
  eventId?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  savedAt?: string;
}

export interface BookmarkInput {
  entityId: string;
  entityType: 'event' | 'session' | 'project';
  eventId?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateUserProfileInput {
  displayName?: string;
  department?: string;
  avatar?: string;
  bio?: string;
}

export class UsersService {
  private usersContainerName = 'users';
  private bookmarksContainerName = 'bookmarks';
  private useMockData = !cosmosDB.isAvailable();

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (this.useMockData) {
        logger.debug({ userId }, 'Getting mock user profile');
        return MOCK_USERS.find(u => u.id === userId) || null;
      }

      const container = await cosmosDB.getContainer(this.usersContainerName);
      const { resource } = await container.item(userId, userId).read<UserProfile>();
      return resource || null;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      logger.error({ error, userId }, 'Failed to get user profile');
      throw error;
    }
  }

  /**
   * Create or update user profile
   */
  async upsertUserProfile(userId: string, updates: UpdateUserProfileInput): Promise<UserProfile> {
    try {
      const existing = await this.getUserProfile(userId);

      const profile: UserProfile = {
        id: userId,
        email: existing?.email || `user${userId}@microsoft.com`,
        displayName: updates.displayName || existing?.displayName || userId,
        department: updates.department || existing?.department,
        role: existing?.role || 'user',
        avatar: updates.avatar || existing?.avatar,
        bio: updates.bio || existing?.bio,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (this.useMockData) {
        logger.debug({ userId }, 'Upserting mock user profile');
        const idx = MOCK_USERS.findIndex(u => u.id === userId);
        if (idx >= 0) {
          MOCK_USERS[idx] = profile;
        } else {
          MOCK_USERS.push(profile);
        }
        return profile;
      }

      const container = await cosmosDB.getContainer(this.usersContainerName);
      const { resource } = await container.items.upsert<UserProfile>(profile);

      logger.info({ userId }, 'User profile upserted');
      return resource!;
    } catch (error) {
      logger.error({ error, userId }, 'Failed to upsert user profile');
      throw error;
    }
  }

  /**
   * Add bookmark
   */
  async addBookmark(userId: string, input: BookmarkInput): Promise<Bookmark> {
    try {
      const bookmark: Bookmark = {
        id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        entityId: input.entityId,
        entityType: input.entityType,
        eventId: input.eventId,
        notes: input.notes,
        tags: input.tags || [],
        createdAt: new Date().toISOString(),
        savedAt: new Date().toISOString()
      };

      if (this.useMockData) {
        logger.debug({ bookmarkId: bookmark.id, userId }, 'Added mock bookmark');
        // Check for duplicate
        const existing = MOCK_BOOKMARKS.find(
          b => b.userId === userId && b.entityId === input.entityId && b.entityType === input.entityType
        );
        if (existing) {
          return existing;
        }
        MOCK_BOOKMARKS.push(bookmark);
        return bookmark;
      }

      const container = await cosmosDB.getContainer(this.bookmarksContainerName);

      // Check for duplicate
      try {
        const { resources: existing } = await container.items.query<Bookmark>(
          'SELECT * FROM c WHERE c.userId = @userId AND c.entityId = @entityId AND c.entityType = @entityType',
          {
            parameters: [
              { name: '@userId', value: userId },
              { name: '@entityId', value: input.entityId },
              { name: '@entityType', value: input.entityType }
            ]
          }
        ).fetchAll();

        if (existing.length > 0) {
          return existing[0];
        }
      } catch (error) {
        // Continue if query fails
      }

      const { resource } = await container.items.create<Bookmark>(bookmark);

      logger.info({ bookmarkId: bookmark.id, userId }, 'Bookmark created');
      return resource!;
    } catch (error) {
      logger.error({ error, userId, input }, 'Failed to add bookmark');
      throw error;
    }
  }

  /**
   * Remove bookmark
   */
  async removeBookmark(userId: string, bookmarkId: string): Promise<boolean> {
    try {
      if (this.useMockData) {
        logger.debug({ bookmarkId, userId }, 'Removed mock bookmark');
        const idx = MOCK_BOOKMARKS.findIndex(b => b.id === bookmarkId && b.userId === userId);
        if (idx >= 0) {
          MOCK_BOOKMARKS.splice(idx, 1);
          return true;
        }
        return false;
      }

      const container = await cosmosDB.getContainer(this.bookmarksContainerName);
      await container.item(bookmarkId, userId).delete();

      logger.info({ bookmarkId, userId }, 'Bookmark removed');
      return true;
    } catch (error: any) {
      if (error.code === 404) {
        return false;
      }
      logger.error({ error, bookmarkId, userId }, 'Failed to remove bookmark');
      throw error;
    }
  }

  /**
   * Remove bookmark by entity
   */
  async removeBookmarkByEntity(userId: string, entityId: string, entityType: string): Promise<boolean> {
    try {
      if (this.useMockData) {
        logger.debug({ entityId, entityType, userId }, 'Removed mock bookmark by entity');
        const idx = MOCK_BOOKMARKS.findIndex(
          b => b.userId === userId && b.entityId === entityId && b.entityType === entityType
        );
        if (idx >= 0) {
          MOCK_BOOKMARKS.splice(idx, 1);
          return true;
        }
        return false;
      }

      const container = await cosmosDB.getContainer(this.bookmarksContainerName);

      const { resources } = await container.items.query<Bookmark>(
        'SELECT * FROM c WHERE c.userId = @userId AND c.entityId = @entityId AND c.entityType = @entityType',
        {
          parameters: [
            { name: '@userId', value: userId },
            { name: '@entityId', value: entityId },
            { name: '@entityType', value: entityType }
          ]
        }
      ).fetchAll();

      if (resources.length === 0) {
        return false;
      }

      for (const bookmark of resources) {
        await container.item(bookmark.id, userId).delete();
      }

      logger.info({ entityId, entityType, userId }, 'Bookmark(s) removed by entity');
      return true;
    } catch (error) {
      logger.error({ error, entityId, entityType, userId }, 'Failed to remove bookmark by entity');
      throw error;
    }
  }

  /**
   * Get user bookmarks
   */
  async getUserBookmarks(
    userId: string,
    options?: { entityType?: string; limit?: number; offset?: number }
  ): Promise<{ bookmarks: Bookmark[]; total: number }> {
    try {
      const { entityType, limit = 50, offset = 0 } = options || {};

      if (this.useMockData) {
        logger.debug({ userId, entityType }, 'Getting mock user bookmarks');
        let filtered = MOCK_BOOKMARKS.filter(b => b.userId === userId);

        if (entityType) {
          filtered = filtered.filter(b => b.entityType === entityType);
        }

        const total = filtered.length;
        const bookmarks = filtered
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(offset, offset + limit);

        return { bookmarks, total };
      }

      const container = await cosmosDB.getContainer(this.bookmarksContainerName);

      let query = 'SELECT * FROM c WHERE c.userId = @userId';
      const params = [{ name: '@userId', value: userId }];

      if (entityType) {
        query += ' AND c.entityType = @entityType';
        params.push({ name: '@entityType', value: entityType });
      }

      query += ' ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit';
      params.push(
        { name: '@offset', value: offset },
        { name: '@limit', value: limit }
      );

      const { resources } = await container.items.query<Bookmark>(query, { parameters: params }).fetchAll();

      // Get total count
      const countQuery = entityType
        ? 'SELECT VALUE COUNT(1) FROM c WHERE c.userId = @userId AND c.entityType = @entityType'
        : 'SELECT VALUE COUNT(1) FROM c WHERE c.userId = @userId';
      const countParams = entityType
        ? [
            { name: '@userId', value: userId },
            { name: '@entityType', value: entityType }
          ]
        : [{ name: '@userId', value: userId }];

      const { resources: countResult } = await container.items.query<number>(countQuery, { parameters: countParams }).fetchAll();
      const total = countResult[0] || 0;

      return { bookmarks: resources, total };
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user bookmarks');
      throw error;
    }
  }

  /**
   * Check if entity is bookmarked
   */
  async isEntityBookmarked(userId: string, entityId: string, entityType: string): Promise<boolean> {
    try {
      if (this.useMockData) {
        return MOCK_BOOKMARKS.some(
          b => b.userId === userId && b.entityId === entityId && b.entityType === entityType
        );
      }

      const container = await cosmosDB.getContainer(this.bookmarksContainerName);
      const { resources } = await container.items.query<Bookmark>(
        'SELECT * FROM c WHERE c.userId = @userId AND c.entityId = @entityId AND c.entityType = @entityType',
        {
          parameters: [
            { name: '@userId', value: userId },
            { name: '@entityId', value: entityId },
            { name: '@entityType', value: entityType }
          ]
        }
      ).fetchAll();

      return resources.length > 0;
    } catch (error) {
      logger.error({ error, userId, entityId, entityType }, 'Failed to check if entity is bookmarked');
      throw error;
    }
  }

  /**
   * Update bookmark
   */
  async updateBookmark(userId: string, bookmarkId: string, updates: Partial<BookmarkInput>): Promise<Bookmark> {
    try {
      const existing = await this.getBookmark(userId, bookmarkId);
      if (!existing) {
        throw new Error(`Bookmark ${bookmarkId} not found`);
      }

      const updated: Bookmark = {
        ...existing,
        ...updates,
        id: existing.id,
        userId: existing.userId,
        entityId: updates.entityId || existing.entityId,
        entityType: (updates.entityType || existing.entityType) as 'event' | 'session' | 'project',
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString()
      };

      if (this.useMockData) {
        logger.debug({ bookmarkId, userId }, 'Updated mock bookmark');
        const idx = MOCK_BOOKMARKS.findIndex(b => b.id === bookmarkId && b.userId === userId);
        if (idx >= 0) {
          MOCK_BOOKMARKS[idx] = updated;
        }
        return updated;
      }

      const container = await cosmosDB.getContainer(this.bookmarksContainerName);
      const { resource } = await container.item(bookmarkId, userId).replace<Bookmark>(updated);

      logger.info({ bookmarkId, userId }, 'Bookmark updated');
      return resource!;
    } catch (error) {
      logger.error({ error, bookmarkId, userId }, 'Failed to update bookmark');
      throw error;
    }
  }

  /**
   * Get single bookmark
   */
  private async getBookmark(userId: string, bookmarkId: string): Promise<Bookmark | null> {
    try {
      if (this.useMockData) {
        return MOCK_BOOKMARKS.find(b => b.id === bookmarkId && b.userId === userId) || null;
      }

      const container = await cosmosDB.getContainer(this.bookmarksContainerName);
      const { resource } = await container.item(bookmarkId, userId).read<Bookmark>();
      return resource || null;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }
}

export const usersService = new UsersService();
