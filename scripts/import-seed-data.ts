#!/usr/bin/env node

/**
 * Seed Data Import Script
 * 
 * Imports Redmond seed data from ShowcaseApp into Bridge Cosmos DB containers
 * 
 * Usage:
 *   npm run import-seed-data
 *   npm run import-seed-data -- --event-only
 *   npm run import-seed-data -- --dry-run
 * 
 * Environment Variables:
 *   COSMOS_ENDPOINT - Azure Cosmos DB endpoint
 *   COSMOS_KEY - Primary key
 *   COSMOS_DATABASE - Database name
 */

import { CosmosClient } from "@azure/cosmos";
import * as fs from "fs";
import * as path from "path";

interface SeedImportOptions {
  dryRun: boolean;
  eventOnly: boolean;
  deleteExisting: boolean;
}

class SeedDataImporter {
  private client: CosmosClient;
  private database: any;
  private eventContainer: any;
  private sessionContainer: any;
  private speakerContainer: any;

  constructor() {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;

    if (!endpoint || !key) {
      throw new Error(
        "Missing COSMOS_ENDPOINT or COSMOS_KEY environment variables"
      );
    }

    this.client = new CosmosClient({ endpoint, key });
  }

  async initialize() {
    const dbName = process.env.COSMOS_DATABASE || "EventHub";
    this.database = this.client.database(dbName);

    // Create or get containers
    try {
      // Event container with partition key /id
      const { container: eventContainer } = await this.database.containers.createIfNotExists({
        id: "Event",
        partitionKey: { paths: ["/id"] },
      });
      this.eventContainer = eventContainer;

      // Session container with partition key /eventId
      const { container: sessionContainer } = await this.database.containers.createIfNotExists({
        id: "Session",
        partitionKey: { paths: ["/eventId"] },
      });
      this.sessionContainer = sessionContainer;

      // Speaker container with partition key /id
      const { container: speakerContainer } = await this.database.containers.createIfNotExists({
        id: "Speaker",
        partitionKey: { paths: ["/id"] },
      });
      this.speakerContainer = speakerContainer;

      console.log("✓ Initialized Cosmos DB containers");
    } catch (error) {
      console.error("Failed to initialize containers:", error);
      throw error;
    }
  }

  private loadSeedData(filename: string): any {
    // Try multiple paths where seed data might be located
    const possiblePaths = [
      path.join(process.cwd(), "data", filename),
      path.join(process.cwd(), "../ShowcaseApp/showcaseapp/data", filename),
      path.join(process.cwd(), "../../ShowcaseApp/showcaseapp/data", filename),
      path.join(__dirname, "../data", filename),
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        console.log(`Loading seed data from: ${filePath}`);
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data);
      }
    }

    throw new Error(`Could not find seed data file: ${filename}`);
  }

  async importEvents(options: SeedImportOptions) {
    console.log("\n📥 Importing Events...");

    try {
      const eventData = this.loadSeedData("redmond-event.json");
      const eventDoc = {
        ...eventData,
        docType: "Event",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (options.dryRun) {
        console.log("  [DRY RUN] Would import event:", eventDoc.id);
        return;
      }

      // Delete existing if requested
      if (options.deleteExisting) {
        try {
          await this.eventContainer.item(eventData.id, eventData.id).delete();
          console.log(`  ✓ Deleted existing event: ${eventData.id}`);
        } catch (error: any) {
          if (error.code !== 404) throw error;
        }
      }

      // Import event
      const { resource } = await this.eventContainer.items.create(eventDoc);
      console.log(`  ✓ Imported event: ${resource.id}`);
    } catch (error) {
      console.error("  ✗ Failed to import events:", error);
      throw error;
    }
  }

  async importSessions(options: SeedImportOptions) {
    console.log("\n📥 Importing Sessions...");

    try {
      const sessionsData = this.loadSeedData("redmond-sessions.json");
      const eventId = "redmond-2025";

      let imported = 0;
      for (const session of sessionsData) {
        const sessionDoc = {
          ...session,
          eventId,
          docType: "Session",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (options.dryRun) {
          console.log(`  [DRY RUN] Would import session: ${sessionDoc.id}`);
          imported++;
          continue;
        }

        // Delete existing if requested
        if (options.deleteExisting) {
          try {
            await this.sessionContainer.item(session.id, eventId).delete();
            console.log(`  ✓ Deleted existing session: ${session.id}`);
          } catch (error: any) {
            if (error.code !== 404) throw error;
          }
        }

        // Import session
        const { resource } = await this.sessionContainer.items.create(sessionDoc);
        console.log(`  ✓ Imported session: ${resource.id}`);
        imported++;
      }

      console.log(`  Total imported: ${imported} sessions`);
    } catch (error) {
      console.error("  ✗ Failed to import sessions:", error);
      throw error;
    }
  }

  async importSpeakers(options: SeedImportOptions) {
    console.log("\n📥 Importing Speakers...");

    try {
      const sessionsData = this.loadSeedData("redmond-sessions.json");
      const speakers = new Map<string, any>();

      // Extract unique speakers from sessions
      for (const session of sessionsData) {
        for (const speaker of session.speakers || []) {
          if (!speakers.has(speaker.alias || speaker.email)) {
            speakers.set(speaker.alias || speaker.email, {
              ...speaker,
              id: speaker.alias || `speaker-${speaker.email}`,
              docType: "Speaker",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }

        if (session.moderator) {
          speakers.set(session.moderator.alias || session.moderator.email, {
            ...session.moderator,
            id: session.moderator.alias || `speaker-${session.moderator.email}`,
            docType: "Speaker",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      let imported = 0;
      for (const [key, speakerDoc] of speakers) {
        if (options.dryRun) {
          console.log(`  [DRY RUN] Would import speaker: ${speakerDoc.id}`);
          imported++;
          continue;
        }

        // Delete existing if requested
        if (options.deleteExisting) {
          try {
            await this.speakerContainer.item(speakerDoc.id, speakerDoc.id).delete();
            console.log(`  ✓ Deleted existing speaker: ${speakerDoc.id}`);
          } catch (error: any) {
            if (error.code !== 404) throw error;
          }
        }

        // Import speaker
        const { resource } = await this.speakerContainer.items.create(speakerDoc);
        console.log(`  ✓ Imported speaker: ${resource.id}`);
        imported++;
      }

      console.log(`  Total imported: ${imported} speakers`);
    } catch (error) {
      console.error("  ✗ Failed to import speakers:", error);
      throw error;
    }
  }

  async run(options: SeedImportOptions) {
    try {
      console.log("🚀 Starting Seed Data Import\n");

      if (options.dryRun) {
        console.log("⚠️  DRY RUN MODE - No data will be written\n");
      }

      await this.initialize();

      // Import events
      await this.importEvents(options);

      // Import sessions (unless event-only mode)
      if (!options.eventOnly) {
        await this.importSessions(options);
        await this.importSpeakers(options);
      }

      console.log("\n✅ Seed data import completed successfully!");

      if (options.dryRun) {
        console.log("\n💡 Run again without --dry-run to actually import the data");
      }
    } catch (error) {
      console.error("\n❌ Seed data import failed:", error);
      process.exit(1);
    }
  }
}

// Parse command line arguments
const options: SeedImportOptions = {
  dryRun: process.argv.includes("--dry-run"),
  eventOnly: process.argv.includes("--event-only"),
  deleteExisting: process.argv.includes("--delete-existing"),
};

// Run import
const importer = new SeedDataImporter();
importer.run(options);
