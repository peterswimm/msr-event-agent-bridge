/**
 * Cosmos DB Client Service
 * Handles connection and basic CRUD operations for Cosmos DB
 */

import { CosmosClient, Container, Database } from '@azure/cosmos';
import pino from 'pino';

const logger = pino();

export class CosmosDBClient {
  private client: CosmosClient;
  private database: Database | null = null;

  constructor() {
    const connectionString = process.env.COSMOS_CONNECTION_STRING;
    
    if (!connectionString) {
      logger.warn('COSMOS_CONNECTION_STRING not configured - using mock data mode');
      this.client = null as any;
    } else {
      this.client = new CosmosClient({ connectionString });
    }
  }

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    if (!this.client) {
      logger.info('Cosmos DB client not initialized - mock mode');
      return;
    }

    try {
      const databaseId = process.env.COSMOS_DB_NAME || 'msr-event-hub';
      const { database } = await this.client.databases.createIfNotExists({ id: databaseId });
      this.database = database;
      logger.info({ database: databaseId }, 'Cosmos DB connected');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize Cosmos DB');
      throw error;
    }
  }

  /**
   * Get container reference
   */
  async getContainer(containerId: string): Promise<Container> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const { container } = await this.database.containers.createIfNotExists({ id: containerId });
    return container;
  }

  /**
   * Check if Cosmos DB is available
   */
  isAvailable(): boolean {
    return !!this.client && !!this.database;
  }
}

export const cosmosDB = new CosmosDBClient();
