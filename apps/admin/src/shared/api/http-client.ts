const API_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:4000/api/v1';

interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly error: string | null;
  readonly timestamp: string;
}

class HttpClient {
  private getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  setToken(token: string): void {
    localStorage.setItem('admin_token', token);
  }

  clearToken(): void {
    localStorage.removeItem('admin_token');
  }

  hasToken(): boolean {
    return this.getToken() !== null;
  }

  async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${API_URL}${path}`, { ...options, headers });
    } catch {
      return {
        success: false,
        data: null as T,
        error: 'Cannot connect to server',
        timestamp: new Date().toISOString(),
      };
    }

    if (response.status === 401) {
      this.clearToken();
      if (!path.includes('/users/me') && !path.includes('/auth/')) {
        window.location.href = '/login';
      }
      return { success: false, data: null as T, error: 'Unauthorized', timestamp: new Date().toISOString() };
    }

    try {
      const json: unknown = await response.json();
      return json as ApiResponse<T>;
    } catch {
      return {
        success: false,
        data: null as T,
        error: `Request failed with status ${String(response.status)}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
export type { ApiResponse };
