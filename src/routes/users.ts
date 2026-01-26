/**
 * Users Router
 * API endpoints for user profiles and bookmarks
 */

import { Router, Request, Response } from 'express';
import pino from 'pino';
import { usersService, UpdateUserProfileInput, BookmarkInput } from '../services/users-service.js';
import { requireAuth } from '../middleware/auth.js';

const logger = pino();
const router = Router();

/**
 * GET /api/v1/users/{userId}
 * Get user profile by ID
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const profile = await usersService.getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: `User ${userId} not found`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: profile,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error({ error }, 'GET /users/:userId failed');
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * PUT /api/v1/users/{userId}
 * Update user profile
 * Requires authentication as the user being updated or as admin
 */
router.put('/:userId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { displayName, department, avatar, bio } = req.body as UpdateUserProfileInput;

    // Check authorization
    const currentUserId = (req as any).user?.id;
    const currentUserRole = (req as any).user?.role;

    if (currentUserId !== userId && currentUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user',
        timestamp: new Date().toISOString()
      });
    }

    // Validate input
    if (!displayName && !department && !avatar && !bio) {
      return res.status(400).json({
        success: false,
        error: 'At least one field must be provided for update',
        timestamp: new Date().toISOString()
      });
    }

    const updated = await usersService.upsertUserProfile(userId, {
      displayName,
      department,
      avatar,
      bio
    });

    res.json({
      success: true,
      data: updated,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error({ error }, 'PUT /users/:userId failed');
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/users/{userId}/bookmarks
 * Get user bookmarks with optional filtering and pagination
 * Query params:
 *   - entityType: 'event' | 'session' | 'project'
 *   - limit: number (default 50)
 *   - offset: number (default 0)
 */
router.get('/:userId/bookmarks', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { entityType, limit = 50, offset = 0 } = req.query;

    const limitNum = Math.min(parseInt(String(limit)) || 50, 100);
    const offsetNum = parseInt(String(offset)) || 0;

    const { bookmarks, total } = await usersService.getUserBookmarks(userId, {
      entityType: entityType ? String(entityType) : undefined,
      limit: limitNum,
      offset: offsetNum
    });

    res.json({
      success: true,
      data: bookmarks,
      meta: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error({ error }, 'GET /users/:userId/bookmarks failed');
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/v1/users/{userId}/bookmarks
 * Add a new bookmark
 * Requires authentication as the user or as admin
 */
router.post('/:userId/bookmarks', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { entityId, entityType, eventId, notes, tags } = req.body as BookmarkInput;

    // Check authorization
    const currentUserId = (req as any).user?.id;
    const currentUserRole = (req as any).user?.role;

    if (currentUserId !== userId && currentUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to bookmark for this user',
        timestamp: new Date().toISOString()
      });
    }

    // Validate required fields
    if (!entityId || !entityType) {
      return res.status(400).json({
        success: false,
        error: 'entityId and entityType are required',
        timestamp: new Date().toISOString()
      });
    }

    if (!['event', 'session', 'project'].includes(entityType)) {
      return res.status(400).json({
        success: false,
        error: 'entityType must be one of: event, session, project',
        timestamp: new Date().toISOString()
      });
    }

    const bookmark = await usersService.addBookmark(userId, {
      entityId,
      entityType: entityType as 'event' | 'session' | 'project',
      eventId,
      notes,
      tags
    });

    res.status(201).json({
      success: true,
      data: bookmark,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error({ error }, 'POST /users/:userId/bookmarks failed');
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * DELETE /api/v1/users/{userId}/bookmarks/{bookmarkId}
 * Remove a bookmark
 * Requires authentication as the user or as admin
 */
router.delete('/:userId/bookmarks/:bookmarkId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId, bookmarkId } = req.params;

    // Check authorization
    const currentUserId = (req as any).user?.id;
    const currentUserRole = (req as any).user?.role;

    if (currentUserId !== userId && currentUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to remove bookmarks for this user',
        timestamp: new Date().toISOString()
      });
    }

    const removed = await usersService.removeBookmark(userId, bookmarkId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: `Bookmark ${bookmarkId} not found`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: { removed: true },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error({ error }, 'DELETE /users/:userId/bookmarks/:bookmarkId failed');
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * DELETE /api/v1/users/{userId}/bookmarks
 * Remove bookmark by entity ID
 * Requires authentication as the user or as admin
 * Query params:
 *   - entityId: string (required)
 *   - entityType: 'event' | 'session' | 'project' (required)
 */
router.delete('/:userId/bookmarks', requireAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { entityId, entityType } = req.query;

    // Check authorization
    const currentUserId = (req as any).user?.id;
    const currentUserRole = (req as any).user?.role;

    if (currentUserId !== userId && currentUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to remove bookmarks for this user',
        timestamp: new Date().toISOString()
      });
    }

    if (!entityId || !entityType) {
      return res.status(400).json({
        success: false,
        error: 'entityId and entityType are required',
        timestamp: new Date().toISOString()
      });
    }

    const removed = await usersService.removeBookmarkByEntity(userId, String(entityId), String(entityType));

    res.json({
      success: true,
      data: { removed },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error({ error }, 'DELETE /users/:userId/bookmarks failed');
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/users/{userId}/bookmarks/{entityType}/{entityId}/status
 * Check if entity is bookmarked
 */
router.get('/:userId/bookmarks/:entityType/:entityId/status', async (req: Request, res: Response) => {
  try {
    const { userId, entityType, entityId } = req.params;

    if (!['event', 'session', 'project'].includes(entityType)) {
      return res.status(400).json({
        success: false,
        error: 'entityType must be one of: event, session, project',
        timestamp: new Date().toISOString()
      });
    }

    const isBookmarked = await usersService.isEntityBookmarked(userId, entityId, entityType);

    res.json({
      success: true,
      data: {
        userId,
        entityId,
        entityType,
        isBookmarked
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error({ error }, 'GET /users/:userId/bookmarks/:entityType/:entityId/status failed');
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
