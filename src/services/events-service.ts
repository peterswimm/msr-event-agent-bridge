/**
 * Events Service
 * Handles events data operations (CRUD, search, filtering)
 */

import pino from 'pino';
import { Event } from '../types/models.js';
import { cosmosDB } from './cosmos-db-client.js';
import { MOCK_EVENTS, MOCK_SESSIONS } from './mock-data.js';

const logger = pino();

export interface ListEventsOptions {
  limit?: number;
  offset?: number;
  status?: 'draft' | 'published' | 'archived';
}

export interface CreateEventInput {
  displayName: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}

export class EventsService {
  private containerName = 'events';
  private useMockData = !cosmosDB.isAvailable();

  /**
   * List all events with filtering and pagination
   */
  async listEvents(options: ListEventsOptions): Promise<{ events: Event[]; total: number }> {
    const { limit = 20, offset = 0, status } = options;

    try {
      if (this.useMockData) {
        logger.debug('Using mock data for events');
        let filtered = [...MOCK_EVENTS];
        
        if (status) {
          filtered = filtered.filter(e => e.status === status);
        }

        const total = filtered.length;
        const events = filtered.slice(offset, offset + limit);

        return { events, total };
      }

      const container = await cosmosDB.getContainer(this.containerName);
      
      let query = 'SELECT * FROM c';
      const params = [];

      if (status) {
        query += ' WHERE c.status = @status';
        params.push({ name: '@status', value: status });
      }

      query += ' ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit';
      params.push(
        { name: '@offset', value: offset },
        { name: '@limit', value: limit }
      );

      const { resources } = await container.items.query<Event>(query, { parameters: params }).fetchAll();

      // Get total count
      const countQuery = status ? 'SELECT VALUE COUNT(1) FROM c WHERE c.status = @status' : 'SELECT VALUE COUNT(1) FROM c';
      const countParams = status ? [{ name: '@status', value: status }] : [];
      const { resources: countResult } = await container.items.query<number>(countQuery, { parameters: countParams }).fetchAll();
      const total = countResult[0] || 0;

      return { events: resources, total };
    } catch (error) {
      logger.error({ error }, 'Failed to list events');
      throw error;
    }
  }

  /**
   * Get single event by ID
   */
  async getEvent(eventId: string): Promise<Event | null> {
    try {
      if (this.useMockData) {
        logger.debug({ eventId }, 'Getting mock event');
        return MOCK_EVENTS.find(e => e.id === eventId) || null;
      }

      const container = await cosmosDB.getContainer(this.containerName);
      const { resource } = await container.item(eventId, eventId).read<Event>();
      return resource || null;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      logger.error({ error, eventId }, 'Failed to get event');
      throw error;
    }
  }

  /**
   * Create new event
   */
  async createEvent(input: CreateEventInput): Promise<Event> {
    try {
      const event: Event = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        displayName: input.displayName,
        description: input.description,
        location: input.location,
        startDate: input.startDate,
        endDate: input.endDate,
        imageUrl: input.imageUrl,
        tags: input.tags || [],
        status: input.status || 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (this.useMockData) {
        logger.debug({ eventId: event.id }, 'Created mock event');
        MOCK_EVENTS.push(event);
        return event;
      }

      const container = await cosmosDB.getContainer(this.containerName);
      const { resource } = await container.items.create<Event>(event);
      
      logger.info({ eventId: event.id }, 'Event created');
      return resource!;
    } catch (error) {
      logger.error({ error, input }, 'Failed to create event');
      throw error;
    }
  }

  /**
   * Update event
   */
  async updateEvent(eventId: string, updates: Partial<CreateEventInput>): Promise<Event> {
    try {
      const event = await this.getEvent(eventId);
      if (!event) {
        throw new Error(`Event ${eventId} not found`);
      }

      const updated: Event = {
        ...event,
        ...updates,
        id: event.id,
        createdAt: event.createdAt,
        updatedAt: new Date().toISOString()
      };

      if (this.useMockData) {
        logger.debug({ eventId }, 'Updated mock event');
        const index = MOCK_EVENTS.findIndex(e => e.id === eventId);
        if (index >= 0) {
          MOCK_EVENTS[index] = updated;
        }
        return updated;
      }

      const container = await cosmosDB.getContainer(this.containerName);
      const { resource } = await container.item(eventId, eventId).replace<Event>(updated);
      
      logger.info({ eventId }, 'Event updated');
      return resource!;
    } catch (error) {
      logger.error({ error, eventId }, 'Failed to update event');
      throw error;
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      if (this.useMockData) {
        logger.debug({ eventId }, 'Deleted mock event');
        const index = MOCK_EVENTS.findIndex(e => e.id === eventId);
        if (index >= 0) {
          MOCK_EVENTS.splice(index, 1);
          return true;
        }
        return false;
      }

      const container = await cosmosDB.getContainer(this.containerName);
      await container.item(eventId, eventId).delete();
      
      logger.info({ eventId }, 'Event deleted');
      return true;
    } catch (error: any) {
      if (error.code === 404) {
        return false;
      }
      logger.error({ error, eventId }, 'Failed to delete event');
      throw error;
    }
  }

  /**
   * Get sessions for an event
   */
  async getEventSessions(eventId: string, options?: { limit?: number; offset?: number; track?: string; sessionType?: string }): Promise<{ sessions: any[]; total: number }> {
    try {
      const { limit = 20, offset = 0, track, sessionType } = options || {};

      if (this.useMockData) {
        let filtered = MOCK_SESSIONS.filter(s => s.eventId === eventId);
        
        if (track) {
          filtered = filtered.filter(s => s.track === track);
        }
        if (sessionType) {
          filtered = filtered.filter(s => s.type === sessionType);
        }

        const total = filtered.length;
        const sessions = filtered.slice(offset, offset + limit);
        return { sessions, total };
      }

      // Query from backend/Cosmos DB
      const container = await cosmosDB.getContainer('sessions');
      let query = 'SELECT * FROM c WHERE c.eventId = @eventId';
      const params = [{ name: '@eventId', value: eventId }];

      if (track) {
        query += ' AND c.track = @track';
        params.push({ name: '@track', value: track });
      }
      if (sessionType) {
        query += ' AND c.type = @sessionType';
        params.push({ name: '@sessionType', value: sessionType });
      }

      query += ' ORDER BY c.date ASC, c.time ASC OFFSET @offset LIMIT @limit';
      params.push(
        { name: '@offset', value: offset },
        { name: '@limit', value: limit }
      );

      const { resources } = await container.items.query(query, { parameters: params }).fetchAll();

      const countQuery = query.replace('SELECT *', 'SELECT VALUE COUNT(1)').split('OFFSET')[0];
      const { resources: countResult } = await container.items.query<number>(countQuery, { parameters: params.slice(0, -2) }).fetchAll();
      const total = countResult[0] || 0;

      return { sessions: resources, total };
    } catch (error) {
      logger.error({ error, eventId }, 'Failed to get event sessions');
      throw error;
    }
  }
}

export const eventsService = new EventsService();
