import { apiRequest } from "./queryClient";
import type { User, LoginCredentials, InsertUser } from "@shared/schema";

interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'auth_user';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    const data: AuthResponse = await response.json();
    
    if (data.token && data.user) {
      this.setToken(data.token);
      this.setUser(data.user);
    }
    
    return data;
  }

  static async register(userData: InsertUser): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/register', userData);
    return await response.json();
  }

  static async logout(): Promise<void> {
    this.removeToken();
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.removeToken();
        return null;
      }

      const data = await response.json();
      if (data.user) {
        this.setUser(data.user);
        return data.user;
      }
      return null;
    } catch (error) {
      this.removeToken();
      return null;
    }
  }
}
