import { Request, Response, NextFunction } from 'express';
import * as appInsights from 'applicationinsights';

/**
 * 1DS Telemetry Middleware for Bridge API
 * Tracks copilot interactions, performance, and errors
 */

interface TelemetryConfig {
  instrumentationKey: string;
  enableAutoCollection?: boolean;
  samplingPercentage?: number;
}

let telemetryClient: appInsights.TelemetryClient | null = null;

/**
 * Initialize 1DS telemetry client
 */
export function initializeTelemetry(config: TelemetryConfig): void {
  if (!config.instrumentationKey) {
    console.warn('[Telemetry] No instrumentation key provided. Telemetry disabled.');
    return;
  }

  appInsights.setup(config.instrumentationKey)
    .setAutoCollectRequests(config.enableAutoCollection ?? true)
    .setAutoCollectPerformance(config.enableAutoCollection ?? true, config.enableAutoCollection ?? true)
    .setAutoCollectExceptions(config.enableAutoCollection ?? true)
    .setAutoCollectDependencies(config.enableAutoCollection ?? true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
    .start();

  telemetryClient = appInsights.defaultClient;
  
  if (config.samplingPercentage && telemetryClient) {
    telemetryClient.config.samplingPercentage = config.samplingPercentage;
  }

  console.log('[Telemetry] 1DS initialized successfully');
}

/**
 * Track custom copilot events
 */
export function trackEvent(
  name: string,
  properties?: Record<string, string>,
  metrics?: Record<string, number>
): void {
  if (!telemetryClient) return;
  
  telemetryClient.trackEvent({
    name,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    },
    measurements: metrics
  });
}

/**
 * Track copilot interaction metrics
 */
export function trackCopilotInteraction(data: {
  conversationId: string;
  userId?: string;
  messageCount: number;
  inputTokens?: number;
  outputTokens?: number;
  latency: number;
  modelUsed?: string;
  success: boolean;
  errorCode?: string;
}): void {
  trackEvent('copilot_interaction', {
    conversationId: data.conversationId,
    userId: data.userId || 'anonymous',
    modelUsed: data.modelUsed || 'unknown',
    success: data.success.toString(),
    errorCode: data.errorCode || 'none'
  }, {
    messageCount: data.messageCount,
    inputTokens: data.inputTokens || 0,
    outputTokens: data.outputTokens || 0,
    latency: data.latency
  });
}

/**
 * Track user satisfaction signals
 */
export function trackFeedback(data: {
  conversationId: string;
  messageId: string;
  rating: 'positive' | 'negative';
  userId?: string;
  comment?: string;
}): void {
  trackEvent('user_feedback', {
    conversationId: data.conversationId,
    messageId: data.messageId,
    rating: data.rating,
    userId: data.userId || 'anonymous',
    comment: data.comment || ''
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(feature: string, userId?: string, metadata?: Record<string, string>): void {
  trackEvent('feature_usage', {
    feature,
    userId: userId || 'anonymous',
    ...metadata
  });
}

/**
 * Track AI/LLM governance metrics for compliance (DOSA)
 * Monitors refusal rates, edits, latency, token usage, and model failures
 */
export function trackAIMetrics(data: {
  conversationId: string;
  userId?: string;
  modelDeployment: string;
  inputTokens: number;
  outputTokens: number;
  responseLatency: number; // milliseconds
  wasRefused: boolean; // Content filtered by safety guardrails
  editPercentage?: number; // % of response edited by human
  responseLength?: number; // characters
  completionStatus: 'success' | 'timeout' | 'error' | 'partial';
  errorDetails?: string;
}): void {
  if (!telemetryClient) return;

  // Log to Application Insights for real-time dashboard and alerts
  telemetryClient.trackEvent({
    name: 'ai_governance_metric',
    properties: {
      conversationId: data.conversationId,
      userId: data.userId || 'system',
      modelDeployment: data.modelDeployment,
      wasRefused: data.wasRefused.toString(),
      completionStatus: data.completionStatus,
      errorDetails: data.errorDetails || 'none',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production'
    },
    measurements: {
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      totalTokens: data.inputTokens + data.outputTokens,
      responseLatencyMs: data.responseLatency,
      editPercentage: data.editPercentage || 0,
      responseLength: data.responseLength || 0
    }
  });

  // Track refusal rate separately for compliance dashboard
  if (data.wasRefused) {
    telemetryClient.trackEvent({
      name: 'ai_content_refusal',
      properties: {
        conversationId: data.conversationId,
        userId: data.userId || 'system',
        modelDeployment: data.modelDeployment,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Alert on high latency (> 5s indicates performance degradation)
  if (data.responseLatency > 5000) {
    telemetryClient.trackEvent({
      name: 'ai_high_latency_alert',
      properties: {
        conversationId: data.conversationId,
        modelDeployment: data.modelDeployment
      },
      measurements: {
        latencyMs: data.responseLatency
      }
    });
  }

  // Track model errors for reliability dashboard
  if (data.completionStatus === 'error' || data.completionStatus === 'timeout') {
    telemetryClient.trackEvent({
      name: 'ai_model_error',
      properties: {
        conversationId: data.conversationId,
        modelDeployment: data.modelDeployment,
        errorStatus: data.completionStatus,
        errorDetails: data.errorDetails || 'unknown'
      }
    });
  }
}

/**
 * Track AI response edits for compliance (edit percentage KPI)
 * Monitors when users accept/modify AI-generated content
 */
export function trackAIEdit(data: {
  conversationId: string;
  messageId: string;
  userId?: string;
  action: 'accept' | 'edit' | 'reject';
  originalLength?: number;
  editedLength?: number;
  editPercentage?: number; // % difference between original and edited
  timeSinceGeneration: number; // ms from generation to action
}): void {
  trackEvent('ai_edit_action', {
    conversationId: data.conversationId,
    messageId: data.messageId,
    userId: data.userId || 'anonymous',
    action: data.action,
    hasSignificantEdit: ((data.editPercentage || 0) > 10).toString()
  }, {
    originalLength: data.originalLength || 0,
    editedLength: data.editedLength || 0,
    editPercentage: data.editPercentage || 0,
    timeSinceGenerationMs: data.timeSinceGeneration
  });
}

/**
 * Track rate limit exceeded events
 * Monitors API throttling for capacity planning
 */
export function trackRateLimitExceeded(data: {
  userId?: string;
  endpoint: string;
  limitType: 'authenticated' | 'anonymous';
  requestCount: number;
  limitThreshold: number;
  retryAfter?: number; // seconds
}): void {
  trackEvent('rate_limit_exceeded', {
    userId: data.userId || 'anonymous',
    endpoint: data.endpoint,
    limitType: data.limitType,
    severity: data.requestCount > data.limitThreshold * 1.5 ? 'high' : 'medium'
  }, {
    requestCount: data.requestCount,
    limitThreshold: data.limitThreshold,
    excessRequests: data.requestCount - data.limitThreshold,
    retryAfterSeconds: data.retryAfter || 0
  });
}

/**
 * Track connection/lead initiation events
 * Monitors email clicks, repo visits, contact actions
 */
export function trackConnectionInitiated(data: {
  eventId: string;
  userId?: string;
  connectionType: 'email_presenter' | 'visit_repo' | 'contact_organizer' | 'linkedin' | 'other';
  targetId?: string; // presenter/organizer ID
  metadata?: Record<string, string>;
}): void {
  trackEvent('connection_initiated', {
    eventId: data.eventId,
    userId: data.userId || 'anonymous',
    connectionType: data.connectionType,
    targetId: data.targetId || 'unknown',
    ...data.metadata
  });
}

/**
 * Track bookmark actions
 * Monitors event/session bookmarking for engagement metrics
 */
export function trackBookmarkAction(data: {
  entityId: string;
  entityType: 'event' | 'session' | 'artifact';
  userId: string;
  action: 'add' | 'remove';
}): void {
  trackEvent('bookmark_action', {
    entityId: data.entityId,
    entityType: data.entityType,
    userId: data.userId,
    action: data.action
  });
}

/**
 * Express middleware to track API requests
 */
export function telemetryMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const { method, path, ip } = req;

  // Track request start
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    trackEvent('api_request', {
      method,
      path,
      statusCode: statusCode.toString(),
      success: (statusCode >= 200 && statusCode < 400).toString(),
      userAgent: req.get('user-agent') || 'unknown',
      ipAddress: ip
    }, {
      duration
    });

    // Track errors separately
    if (statusCode >= 400) {
      telemetryClient?.trackException({
        exception: new Error(`HTTP ${statusCode}: ${method} ${path}`),
        properties: {
          method,
          path,
          statusCode: statusCode.toString(),
          duration: duration.toString()
        }
      });
    }
  });

  next();
}

/**
 * Track custom exceptions
 */
export function trackException(error: Error, properties?: Record<string, string>): void {
  if (!telemetryClient) return;

  telemetryClient.trackException({
    exception: error,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
}

/**
 * Flush telemetry before shutdown
 */
export async function flushTelemetry(): Promise<void> {
  if (!telemetryClient) return;
  
  telemetryClient.flush();
  console.log('[Telemetry] Flushed successfully');
}

export { telemetryClient };
