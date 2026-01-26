/**
 * Projects Service
 * Handles projects data operations
 */

import pino from 'pino';
import { ProjectDefinition } from '../types/models.js';
import { cosmosDB } from './cosmos-db-client.js';
import { MOCK_PROJECTS } from './mock-data.js';

const logger = pino();

export interface CreateProjectInput {
  eventId: string;
  title: string;
  abstract: string;
  description?: string;
  theme?: string;
  team: Array<{ name: string; title?: string; affiliation?: string; email?: string }>;
  primaryContact?: { name: string; title?: string; email?: string };
  image?: string;
  poster?: string;
  video?: string;
  relatedLinks?: Array<{ title: string; url: string; type: string }>;
  status?: 'draft' | 'submitted' | 'approved' | 'published';
}

export class ProjectsService {
  private containerName = 'projects';
  private useMockData = !cosmosDB.isAvailable();

  /**
   * List projects
   */
  async listProjects(options?: { eventId?: string; limit?: number; offset?: number }): Promise<{ projects: ProjectDefinition[]; total: number }> {
    try {
      const { eventId, limit = 20, offset = 0 } = options || {};

      if (this.useMockData) {
        let filtered = [...MOCK_PROJECTS];
        if (eventId) {
          filtered = filtered.filter(p => p.eventId === eventId);
        }

        const total = filtered.length;
        const projects = filtered.slice(offset, offset + limit);
        return { projects, total };
      }

      const container = await cosmosDB.getContainer(this.containerName);
      let query = 'SELECT * FROM c';
      const params: any[] = [];

      if (eventId) {
        query += ' WHERE c.eventId = @eventId';
        params.push({ name: '@eventId', value: eventId });
      }

      query += ' ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit';
      params.push(
        { name: '@offset', value: offset },
        { name: '@limit', value: limit }
      );

      const { resources } = await container.items.query<ProjectDefinition>(query, { parameters: params }).fetchAll();

      const countQuery = eventId ? 'SELECT VALUE COUNT(1) FROM c WHERE c.eventId = @eventId' : 'SELECT VALUE COUNT(1) FROM c';
      const countParams = eventId ? [{ name: '@eventId', value: eventId }] : [];
      const { resources: countResult } = await container.items.query<number>(countQuery, { parameters: countParams }).fetchAll();
      const total = countResult[0] || 0;

      return { projects: resources, total };
    } catch (error) {
      logger.error({ error }, 'Failed to list projects');
      throw error;
    }
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<ProjectDefinition | null> {
    try {
      if (this.useMockData) {
        logger.debug({ projectId }, 'Getting mock project');
        return MOCK_PROJECTS.find(p => p.id === projectId) || null;
      }

      const container = await cosmosDB.getContainer(this.containerName);
      const { resource } = await container.item(projectId, projectId).read<ProjectDefinition>();
      return resource || null;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      logger.error({ error, projectId }, 'Failed to get project');
      throw error;
    }
  }

  /**
   * Create new project
   */
  async createProject(input: CreateProjectInput): Promise<ProjectDefinition> {
    try {
      const project: ProjectDefinition = {
        id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        eventId: input.eventId,
        title: input.title,
        abstract: input.abstract,
        description: input.description,
        theme: input.theme,
        team: input.team,
        primaryContact: input.primaryContact,
        image: input.image,
        poster: input.poster,
        video: input.video,
        relatedLinks: input.relatedLinks || [],
        maturitySignal: 'exploratory',
        status: input.status || 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (this.useMockData) {
        logger.debug({ projectId: project.id }, 'Created mock project');
        MOCK_PROJECTS.push(project);
        return project;
      }

      const container = await cosmosDB.getContainer(this.containerName);
      const { resource } = await container.items.create<ProjectDefinition>(project);
      
      logger.info({ projectId: project.id }, 'Project created');
      return resource!;
    } catch (error) {
      logger.error({ error, input }, 'Failed to create project');
      throw error;
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, updates: Partial<CreateProjectInput>): Promise<ProjectDefinition> {
    try {
      const project = await this.getProject(projectId);
      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      const updated: ProjectDefinition = {
        ...project,
        ...updates,
        id: project.id,
        eventId: project.eventId,
        createdAt: project.createdAt,
        updatedAt: new Date().toISOString()
      };

      if (this.useMockData) {
        logger.debug({ projectId }, 'Updated mock project');
        const index = MOCK_PROJECTS.findIndex(p => p.id === projectId);
        if (index >= 0) {
          MOCK_PROJECTS[index] = updated;
        }
        return updated;
      }

      const container = await cosmosDB.getContainer(this.containerName);
      const { resource } = await container.item(projectId, projectId).replace<ProjectDefinition>(updated);
      
      logger.info({ projectId }, 'Project updated');
      return resource!;
    } catch (error) {
      logger.error({ error, projectId }, 'Failed to update project');
      throw error;
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      if (this.useMockData) {
        logger.debug({ projectId }, 'Deleted mock project');
        const index = MOCK_PROJECTS.findIndex(p => p.id === projectId);
        if (index >= 0) {
          MOCK_PROJECTS.splice(index, 1);
          return true;
        }
        return false;
      }

      const container = await cosmosDB.getContainer(this.containerName);
      await container.item(projectId, projectId).delete();
      
      logger.info({ projectId }, 'Project deleted');
      return true;
    } catch (error: any) {
      if (error.code === 404) {
        return false;
      }
      logger.error({ error, projectId }, 'Failed to delete project');
      throw error;
    }
  }
}

export const projectsService = new ProjectsService();
