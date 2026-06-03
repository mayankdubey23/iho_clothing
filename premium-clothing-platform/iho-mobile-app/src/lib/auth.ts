import { api } from './api';
import type { ApiErrorResponse, AuthResponse } from '@/types/platform';

export function getToken(data?: AuthResponse | null) {
  return data?.token || data?.data?.token || null;
}

export function getUser(data?: AuthResponse | null) {
  return data?.user || data?.data?.user || null;
}

export function isOtpChallenge(data?: AuthResponse | ApiErrorResponse | null) {
  const message = data?.message?.toLowerCase() ?? '';
  return data?.requires_otp === true || message.includes('otp verification required');
}

export async function loginWithPassword(email: string, password: string) {
  const response = await api.post<AuthResponse>('/auth/login', {
    email,
    password,
  });
  return response.data;
}

export async function registerAccount(params: {
  name: string;
  email: string;
  password: string;
  adminSecret?: string;
}) {
  const response = await api.post<AuthResponse>('/auth/register', {
    name: params.name,
    email: params.email,
    password: params.password,
    admin_secret: params.adminSecret || undefined,
  });
  return response.data;
}

export async function verifyLoginOtp(challengeId: string, otp: string) {
  const response = await api.post<AuthResponse>('/auth/verify-otp', {
    challenge_id: challengeId,
    otp,
  });
  return response.data;
}
