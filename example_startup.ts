/**
 * Example: Express server with Key Vault integration.
 *
 * Shows how to load configuration from Key Vault on startup
 * and use it throughout the application.
 */

import express, { Express } from "express";
import { Logger } from "pino";
import { loadConfig, validateConfig, AppConfig } from "./config/config";
import { getLogger } from "./services/logger"; // Your existing logger

const app: Express = express();

// Extend Express app to include config
declare global {
  namespace Express {
    interface Application {
      config?: AppConfig;
    }
  }
}

/**
 * Initialize application with Key Vault configuration.
 *
 * This function:
 * 1. Loads environment variables from .env
 * 2. Initializes Key Vault client
 * 3. Retrieves all required secrets
 * 4. Validates configuration
 * 5. Sets up middleware
 */
async function initializeApp(): Promise<void> {
  const logger: Logger = getLogger();

  try {
    logger.info("=" + "=".repeat(59));
    logger.info("🔑 INITIALIZING APPLICATION");
    logger.info("=" + "=".repeat(59));

    // Load configuration from Key Vault
    const config = await loadConfig(logger);

    // Validate configuration
    validateConfig(config);

    // Store config in app for use in routes
    app.config = config;

    logger.info("✅ Configuration loaded and validated");
    logger.info("=" + "=".repeat(59));

    // ========================================
    // MIDDLEWARE SETUP
    // ========================================

    // Request logging
    app.use((req, res, next) => {
      logger.info({
        method: req.method,
        path: req.path,
        ip: req.ip,
      });
      next();
    });

    // JSON parser
    app.use(express.json({ limit: "10mb" }));

    // ========================================
    // AUTHENTICATION MIDDLEWARE
    // ========================================
    // Example: Use JWT signing key from Key Vault
    app.use((req, res, next) => {
      // Verify JWT using signing key from Key Vault
      const jwtSigningKey = config.jwtSigningKey;

      // Your JWT validation logic here...
      // const token = req.headers.authorization?.split(" ")[1];
      // const decoded = jwt.verify(token, jwtSigningKey);

      next();
    });

    // ========================================
    // ROUTES
    // ========================================

    // Health check
    app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        environment: config.environment,
        version: "1.0.0",
      });
    });

    // Example route using config
    app.post("/api/events", (req, res) => {
      // Your route logic here
      // Secrets are already loaded in config:
      // - config.jwtSigningKey
      // - config.openaiApiKey
      // - config.databaseConnectionString

      res.json({
        message: "Event created",
        environment: config.environment,
      });
    });

    // ========================================
    // ERROR HANDLING
    // ========================================
    app.use((err: any, req: any, res: any, next: any) => {
      logger.error({ error: err }, "Unhandled error");
      res.status(500).json({
        error: "Internal server error",
        message:
          config.environment === "development"
            ? err.message
            : "An error occurred",
      });
    });

    // ========================================
    // START SERVER
    // ========================================
    const port = config.port;

    app.listen(port, () => {
      logger.info("=" + "=".repeat(59));
      logger.info(`✅ Server listening on port ${port}`);
      logger.info(`Environment: ${config.environment}`);
      logger.info(`Log Level: ${config.logLevel}`);
      logger.info("=" + "=".repeat(59));
    });
  } catch (error) {
    const logger: Logger = getLogger();
    logger.error({ error }, "❌ Failed to initialize application");
    process.exit(1);
  }
}

// Start the app
if (require.main === module) {
  initializeApp();
}

export default app;
