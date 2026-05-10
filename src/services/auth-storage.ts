import { AUTH_TOKEN_STORAGE_KEY } from '@/constants/storage';
import { safeStorage } from '@/utils/storage';

export const authStorage = {
  getToken() {
    return safeStorage.get(AUTH_TOKEN_STORAGE_KEY);
  },
  setToken(token: string) {
    safeStorage.set(AUTH_TOKEN_STORAGE_KEY, token);
  },
  clearToken() {
    safeStorage.remove(AUTH_TOKEN_STORAGE_KEY);
  },
};
