const API_URL = typeof window !== 'undefined' ? '/api/v1' : (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1');

interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
}

interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly phone: string | null;
  readonly role: string;
  readonly emailVerified: boolean;
  readonly twoFactorEnabled: boolean;
  readonly createdAt?: string;
}

interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: string | null;
  readonly timestamp: string;
}

type AuthData = { user: AuthUser; tokens: AuthTokens };
type AuthResponse = ApiResponse<AuthData>;

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

class AuthClient {
  private accessToken: string | null = null;

  setToken(token: string): void {
    this.accessToken = token;
    getStorage()?.setItem('access_token', token);
  }

  getToken(): string | null {
    if (this.accessToken) return this.accessToken;
    return getStorage()?.getItem('access_token') ?? null;
  }

  clearToken(): void {
    this.accessToken = null;
    const storage = getStorage();
    storage?.removeItem('access_token');
    storage?.removeItem('refresh_token');
  }

  private async request<T>(
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
      return { success: false, data: null as T, error: 'Cannot connect to server', timestamp: new Date().toISOString() };
    }

    try {
      const json: unknown = await response.json();
      return json as ApiResponse<T>;
    } catch {
      return { success: false, data: null as T, error: `Request failed (${String(response.status)})`, timestamp: new Date().toISOString() };
    }
  }

  async signUp(data: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const res = await this.request<AuthData>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      this.setToken(res.data.tokens.accessToken);
      getStorage()?.setItem('refresh_token', res.data.tokens.refreshToken);
    }

    return res;
  }

  async signIn(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const res = await this.request<AuthData>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      this.setToken(res.data.tokens.accessToken);
      getStorage()?.setItem('refresh_token', res.data.tokens.refreshToken);
    }

    return res;
  }

  async signOut(): Promise<void> {
    await this.request('/auth/signout', { method: 'POST' });
    this.clearToken();
  }

  async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; error: string | null }> {
    const res = await this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return { success: res.success, error: res.error };
  }

  async resetPassword(data: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<AuthResponse> {
    return this.request<AuthData>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>('/users/me');
  }
}

export const authClient = new AuthClient();
export type { AuthUser, AuthTokens, AuthResponse, ApiResponse };
