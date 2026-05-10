import { API_ENDPOINTS } from '@/constants/api';
import { http, unwrapEntity } from '@/services/http';

export type LoginPayload = {
  email: string;
  password: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
  confirm_password: string;
};

type AuthResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: Record<string, unknown>;
};

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await http.post(API_ENDPOINTS.auth.login, payload);
    return unwrapEntity<AuthResponse>(response.data);
  },
  async forgotPassword(payload: ForgotPasswordPayload) {
    const response = await http.post(API_ENDPOINTS.auth.forgotPassword, payload);
    return unwrapEntity<Record<string, unknown>>(response.data);
  },
  async resetPassword(payload: ResetPasswordPayload) {
    const response = await http.post(API_ENDPOINTS.auth.resetPassword, payload);
    return unwrapEntity<Record<string, unknown>>(response.data);
  },
};

export const extractTokenFromAuthResponse = (response: AuthResponse | null | undefined) =>
  response?.token ?? response?.accessToken ?? response?.jwt ?? null;
