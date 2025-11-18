import { apiRequest } from '@/lib/api-client';
import type { AppUser } from '@/lib/types';

export interface AuthResponse {
  user: AppUser;
  token: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function signIn(payload: SignInPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentUser(token: string): Promise<AppUser> {
  const response = await apiRequest<{ user: AppUser }>('/api/auth/me', {
    method: 'GET',
    token,
  });

  return response.user;
}

