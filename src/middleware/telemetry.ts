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
