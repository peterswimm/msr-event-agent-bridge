/**
 * Shared Zod schemas for request validation
 */

import { z } from 'zod';

export const bookmarkCreateSchema = z.object({
  entityId: z.string().min(1),
  entityType: z.enum(['event', 'session', 'project']),
  eventId: z.string().min(1).optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().min(1)).max(20).optional()
});

export const userProfileUpdateSchema = z.object({
  displayName: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(2000).optional()
}).refine((data: Record<string, unknown>) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

export const createProjectSchema = z.object({
  eventId: z.string().min(1),
  title: z.string().min(1),
  abstract: z.string().min(1),
  description: z.string().optional(),
  theme: z.string().optional(),
  team: z.array(z.object({
    name: z.string().min(1),
    title: z.string().optional(),
    affiliation: z.string().optional(),
    email: z.string().email().optional()
  })).default([]),
  primaryContact: z.object({
    name: z.string().min(1),
    title: z.string().optional(),
    email: z.string().email().optional()
  }).optional(),
  image: z.string().url().optional(),
  poster: z.string().url().optional(),
  video: z.string().url().optional(),
  relatedLinks: z.array(z.object({
    title: z.string().min(1),
    url: z.string().url(),
    type: z.string().min(1)
  })).optional(),
  status: z.enum(['draft', 'submitted', 'approved', 'published']).optional()
});

export const updateProjectSchema = createProjectSchema.partial();

export const createEventSchema = z.object({
  displayName: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string().min(1)).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional()
});

export const updateEventSchema = createEventSchema.partial();

export const createSessionSchema = z.object({
  eventId: z.string().min(1),
  title: z.string().min(1),
  abstract: z.string().optional(),
  type: z.enum(['talk', 'keynote', 'workshop', 'panel', 'lightning-talk']),
  speakers: z.array(z.object({
    name: z.string().min(1),
    title: z.string().optional(),
    affiliation: z.string().optional(),
    email: z.string().email().optional()
  })).default([]),
  date: z.string().min(1),
  time: z.string().min(1),
  duration: z.number().min(1),
  location: z.string().optional(),
  track: z.string().optional(),
  recordingUrl: z.string().url().optional(),
  slides: z.array(z.string().url()).optional(),
  relatedPapers: z.array(z.string().url()).optional(),
  relatedRepos: z.array(z.string().url()).optional()
});

export const updateSessionSchema = createSessionSchema.partial();

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional()
});

export const bookmarksQuerySchema = paginationQuerySchema.extend({
  entityType: z.enum(['event', 'session', 'project']).optional()
});

export const projectListQuerySchema = paginationQuerySchema.extend({
  eventId: z.string().optional()
});

export const eventListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['draft', 'published', 'archived']).optional()
});
