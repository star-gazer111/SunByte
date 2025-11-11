import { API_BASE_URL, DEFAULT_HEADERS } from '../config';

type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  body?: any;
};

class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = API_BASE_URL, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultHeaders = { ...DEFAULT_HEADERS, ...defaultHeaders };
  }

  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'API request failed');
      }

      // Handle empty responses
      const text = await response.text();
      return text ? JSON.parse(text) : {} as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private buildQueryString(params: Record<string, any>): string {
    const query = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    return query ? `?${query}` : '';
  }

  async get<T>(endpoint: string, options: Omit<RequestOptions, 'body'> = {}): Promise<T> {
    const { params = {}, headers = {} } = options;
    const queryString = this.buildQueryString(params);
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
      headers,
    });
  }

  async post<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, headers = {}, params = {} } = options;
    const queryString = this.buildQueryString(params);
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, headers = {}, params = {} } = options;
    const queryString = this.buildQueryString(params);
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { headers = {}, params = {} } = options;
    const queryString = this.buildQueryString(params);
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'DELETE',
      headers,
    });
  }
}

export const httpClient = new HttpClient();
