import type { CollectionResult, CrudApi, SingletonApi } from '@/types/resources';

import { http, unwrapCollection, unwrapEntity } from '@/services/http';

export const createCrudResourceApi = <TItem extends Record<string, unknown>, TPayload = unknown>(
  endpoint: string,
): CrudApi<TItem, TPayload> => ({
  async list(): Promise<CollectionResult<TItem>> {
    const response = await http.get(endpoint);
    return unwrapCollection<TItem>(response.data);
  },
  async getById(id: string | number) {
    const response = await http.get(`${endpoint}/${id}`);
    return unwrapEntity<TItem>(response.data);
  },
  async create(payload: TPayload) {
    const response = await http.post(endpoint, payload);
    return unwrapEntity<TItem>(response.data);
  },
  async update(id: string | number, payload: TPayload) {
    const response = await http.put(`${endpoint}/${id}`, payload);
    return unwrapEntity<TItem>(response.data);
  },
  async delete(id: string | number) {
    await http.delete(`${endpoint}/${id}`);
  },
});

export const createSingletonResourceApi = <
  TItem extends Record<string, unknown>,
  TPayload = unknown,
>(
  endpoint: string,
): SingletonApi<TItem, TPayload> => ({
  async get() {
    const response = await http.get(endpoint);
    return unwrapEntity<TItem>(response.data);
  },
  async update(payload: TPayload) {
    const response = await http.put(endpoint, payload);
    return unwrapEntity<TItem>(response.data);
  },
});
