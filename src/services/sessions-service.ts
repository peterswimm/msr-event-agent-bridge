/**
 * Sessions Service
 * Handles sessions data operations
 */

import pino from 'pino';
import { Session } from '../types/models.js';
import { cosmosDB } from './cosmos-db-client.js';
import { MOCK_SESSIONS } from './mock-data.js';

const logger = pino();

export interface CreateSessionInput {
  eventId: string;
  title: string;
  abstract?: string;
  type: 'talk' | 'keynote' | 'workshop' | 'panel' | 'lightning-talk';
  speakers: Array<{ name: string; title?: string; affiliation?: string; email?: string }>;
  date: string;
  time: string;
  duration: number;
  location?: string;
  track?: string;
  recordingUrl?: string;
  slides?: string[];
  relatedPapers?: string[];
  relatedRepos?: string[];
}

export class SessionsService {
  private containerName = 'sessions';
  private useMockData = !cosmosDB.isAvailable();

  /**
   * Get session by ID
   */
  async getSession(eventId: string, sessionId: string): Promise<Session | null> {
    try {
      if (this.useMockData) {
        logger.debug({ sessionId, eventId }, 'Getting mock session');
        return MOCK_SESSIONS.find(s => s.id === sessionId && s.eventId === eventId) || null;
      }

      const container = await cosmosDB.getContainer(this.containerName);
      const { resource } = await container.item(sessionId, eventId).read<Session>();
      return resource || null;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      logger.error({ error, sessionId, eventId }, 'Failed to get session');
      throw error;
    }
  }

  /**
   * Create new session
   */
  async createSession(input: CreateSessionInput): Promise<Session> {
    try {
      const session: Session = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        eventId: input.eventId,
        title: input.title,
        abstract: input.abstract,
        type: input.type,
        speakers: input.speakers,
        date: input.date,
        time: input.time,
        duration: input.duration,
        location: input.location,
        track: input.track,
        recordingUrl: input.recordingUrl,
        slides: input.slides || [],
        relatedPapers: input.relatedPapers || [],
        relatedRepos: input.relatedRepos || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (this.useMockData) {
        logger.debug({ sessionId: session.id }, 'Created mock session');
        MOCK_SESSIONS.push(session);
        return session;
      }

      const container = await cosmosDB.getContainer(this.containerName);
      const { resource } = await container.items.create<Session>(session);
      
      logger.info({ sessionId: session.id }, 'Session created');
      return resource!;
    } catch (error) {
      logger.error({ error, input }, 'Failed to create session');
      throw error;
    }
  }

  /**
   * Update session
   */
  async updateSession(eventId: string, sessionId: string, updates: Partial<CreateSessionInput>): Promise<Session> {
    try {
      const session = await this.getSession(eventId, sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const updated: Session = {
        ...session,
        ...updates,
        id: session.id,
        eventId: session.eventId,
        createdAt: session.createdAt,
        updatedAt: new Date().toISOString()
      };

      if (this.useMockData) {
        logger.debug({ sessionId }, 'Updated mock session');
        const index = MOCK_SESSIONS.findIndex(s => s.id === sessionId && s.eventId === eventId);
        if (index >= 0) {
          MOCK_SESSIONS[index] = updated;
        }
        return updated;
      }

      const container = await cosmosDB.getContainer(this.containerName);
      const { resource } = await container.item(sessionId, eventId).replace<Session>(updated);
      
      logger.info({ sessionId }, 'Session updated');
      return resource!;
    } catch (error) {
      logger.error({ error, sessionId }, 'Failed to update session');
      throw error;
    }
  }

  /**
   * Delete session
   */
  async deleteSession(eventId: string, sessionId: string): Promise<boolean> {
    try {
      if (this.useMockData) {
        logger.debug({ sessionId }, 'Deleted mock session');
        const index = MOCK_SESSIONS.findIndex(s => s.id === sessionId && s.eventId === eventId);
        if (index >= 0) {
          MOCK_SESSIONS.splice(index, 1);
          return true;
        }
        return false;
      }

      const container = await cosmosDB.getContainer(this.containerName);
      await container.item(sessionId, eventId).delete();
      
      logger.info({ sessionId }, 'Session deleted');
      return true;
    } catch (error: any) {
      if (error.code === 404) {
        return false;
      }
      logger.error({ error, sessionId }, 'Failed to delete session');
      throw error;
    }
  }

  /**
   * Search sessions
   */
  async searchSessions(eventId: string, query: string, options?: { limit?: number; offset?: number; semantic?: boolean }): Promise<{ sessions: Session[]; total: number }> {
    try {
      const { limit = 20, offset = 0, semantic = false } = options || {};

      if (this.useMockData) {
        const queryLower = query.toLowerCase();
        let filtered = MOCK_SESSIONS.filter(s => 
          s.eventId === eventId && (
            s.title.toLowerCase().includes(queryLower) ||
            s.abstract?.toLowerCase().includes(queryLower) ||
            s.track?.toLowerCase().includes(queryLower) ||
            s.speakers.some(speaker => speaker.name.toLowerCase().includes(queryLower))
          )
        );

        const total = filtered.length;
        const sessions = filtered.slice(offset, offset + limit);
        return { sessions, total };
      }

      // For real Cosmos DB, implement semantic search using embeddings
      const container = await cosmosDB.getContainer(this.containerName);
      
      let filterQuery = 'SELECT * FROM c WHERE c.eventId = @eventId';
      const params = [{ name: '@eventId', value: eventId }];

      if (!semantic) {
        // Full-text search
        filterQuery += ` AND (CONTAINS(LOWER(c.title), @query) OR CONTAINS(LOWER(c.abstract), @query) OR CONTAINS(LOWER(c.track), @query))`;
        params.push({ name: '@query', value: query.toLowerCase() });
      } else {
        // Semantic search would use embeddings/vector search
        logger.warn('Semantic search not yet implemented');
        filterQuery += ` AND (CONTAINS(LOWER(c.title), @query) OR CONTAINS(LOWER(c.abstract), @query))`;
        params.push({ name: '@query', value: query.toLowerCase() });
      }

      filterQuery += ' ORDER BY c.date ASC OFFSET @offset LIMIT @limit';
      params.push(
        { name: '@offset', value: offset },
        { name: '@limit', value: limit }
      );

      const { resources } = await container.items.query<Session>(filterQuery, { parameters: params }).fetchAll();

      const countQuery = filterQuery.replace('SELECT *', 'SELECT VALUE COUNT(1)').split('OFFSET')[0];
      const { resources: countResult } = await container.items.query<number>(countQuery, { parameters: params.slice(0, -2) }).fetchAll();
      const total = countResult[0] || 0;

      return { sessions: resources, total };
    } catch (error) {
      logger.error({ error, eventId, query }, 'Failed to search sessions');
      throw error;
    }
  }
}

export const sessionsService = new SessionsService();
