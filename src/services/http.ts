import axios from 'axios';

import { API_BASE_URL } from '@/constants/api';
import { AUTH_ROUTES, stripAdminBase, withAdminBase, ROUTES } from '@/constants/routes';
import { authStorage } from '@/services/auth-storage';

const emitUnauthorized = () => {
  if (typeof window === 'undefined') {
    return;
  }

  authStorage.clearToken();
  window.dispatchEvent(new CustomEvent('auth:unauthorized'));

  const currentPath = stripAdminBase(window.location.pathname);

  if (!AUTH_ROUTES.includes(currentPath as (typeof AUTH_ROUTES)[number])) {
    window.location.href = withAdminBase(ROUTES.auth.login);
  }
};

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

http.interceptors.request.use((config) => {
  const token = authStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      emitUnauthorized();
    }

    return Promise.reject(error);
  },
);

export const unwrapResponse = <TValue>(payload: unknown): TValue => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: TValue }).data;
  }

  return payload as TValue;
};

export const unwrapEntity = <TValue>(payload: unknown): TValue => {
  const unwrapped = unwrapResponse<TValue | { item?: TValue; record?: TValue }>(payload);

  if (unwrapped && typeof unwrapped === 'object' && !Array.isArray(unwrapped)) {
    if ('item' in unwrapped && unwrapped.item) {
      return unwrapped.item;
    }

    if ('record' in unwrapped && unwrapped.record) {
      return unwrapped.record;
    }
  }

  return unwrapped as TValue;
};

export const unwrapCollection = <TValue>(payload: unknown) => {
  const unwrapped = unwrapResponse<
    TValue[] | { items?: TValue[]; results?: TValue[]; records?: TValue[]; total?: number }
  >(payload);

  if (Array.isArray(unwrapped)) {
    return {
      items: unwrapped,
      total: unwrapped.length,
      raw: payload,
    };
  }

  if (unwrapped && typeof unwrapped === 'object') {
    const items =
      unwrapped.items ?? unwrapped.results ?? unwrapped.records ?? ([] as TValue[]);

    return {
      items,
      total: unwrapped.total ?? items.length,
      raw: payload,
    };
  }

  return {
    items: [] as TValue[],
    total: 0,
    raw: payload,
  };
};
