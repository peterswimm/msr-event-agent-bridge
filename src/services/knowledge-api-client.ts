import axios, { AxiosInstance, AxiosError } from 'axios';
import pino from 'pino';
import type { Request } from 'express';

const logger = pino();

/**
 * Service for proxying requests to MSR Event Hub backend
 */
export class KnowledgeAPIClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.KNOWLEDGE_API_URL || 'http://localhost:8000';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: parseInt(process.env.KNOWLEDGE_API_TIMEOUT || '30000', 10),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request/response logging
    this.client.interceptors.request.use(config => {
      logger.debug({ method: config.method, path: config.url }, 'Backend request');
      return config;
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        logger.error(
          {
            method: error.config?.method,
            path: error.config?.url,
            status: error.response?.status,
            error: error.message
          },
          'Backend response error'
        );
        throw error;
      }
    );
  }

  /**
   * Forward request headers and auth to backend
   */
  private forwardHeaders(req: Request): Record<string, string> {
    const headers: Record<string, string> = {};

    // Forward authorization
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // Forward custom headers
    if (req.headers['x-correlation-id']) {
      headers['x-correlation-id'] = String(req.headers['x-correlation-id']);
    }

    // Add user context from bridge auth
    if (req.auth) {
      headers['x-user-id'] = req.auth.user.id;
      headers['x-user-email'] = req.auth.user.email;
      headers['x-correlation-id'] = req.correlationId || '';
    }

    return headers;
  }

  /**
   * GET request to backend
   */
  async get<T>(path: string, req: Request): Promise<T> {
    try {
      const response = await this.client.get<T>(path, {
        headers: this.forwardHeaders(req)
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request to backend
   */
  async post<T>(path: string, req: Request, data: any = null): Promise<T> {
    try {
      const response = await this.client.post<T>(path, data || req.body, {
        headers: this.forwardHeaders(req)
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH request to backend
   */
  async patch<T>(path: string, req: Request, data: any = null): Promise<T> {
    try {
      const response = await this.client.patch<T>(path, data || req.body, {
        headers: this.forwardHeaders(req)
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request to backend
   */
  async delete<T>(path: string, req: Request): Promise<T> {
    try {
      const response = await this.client.delete<T>(path, {
        headers: this.forwardHeaders(req)
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle backend errors
   */
  private handleError(error: any) {
    if (error.response) {
      // Backend returned error response
      const backendError = new Error(
        error.response.data?.message || error.message
      ) as any;
      backendError.statusCode = error.response.status;
      backendError.code = error.response.data?.error?.code || 'BACKEND_ERROR';
      return backendError;
    } else if (error.request) {
      // No response from backend
      const networkError = new Error('Backend service unavailable') as any;
      networkError.statusCode = 503;
      networkError.code = 'SERVICE_UNAVAILABLE';
      return networkError;
    } else {
      // Request setup error
      throw error;
    }
  }

  /**
   * Health check
   */
  async health(): Promise<{ status: string }> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000
      });
      return { status: 'healthy' };
    } catch {
      throw new Error('Backend health check failed');
    }
  }
}

// Singleton instance
export const knowledgeAPI = new KnowledgeAPIClient();
