import api from './api';
import type { ApiResponse, AuthResponse, User } from '@/types';

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>(
    '/api/auth/register',
    { name, email, password },
  );
  return data.data!;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>(
    '/api/auth/login',
    { email, password },
  );
  return data.data!;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<ApiResponse<User>>('/api/auth/me');
  return data.data!;
}

export async function getFamilyMembers(): Promise<User[]> {
  const { data } = await api.get<ApiResponse<User[]>>('/api/auth/family');
  return data.data!;
}
