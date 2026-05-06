export interface BetterAuthConfig {
  readonly jwtSecret: string;
  readonly baseUrl: string;
  readonly frontendUrl?: string;
  readonly google?: {
    readonly clientId: string;
    readonly clientSecret: string;
  };
  readonly github?: {
    readonly clientId: string;
    readonly clientSecret: string;
  };
}
