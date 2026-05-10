import { API_ENDPOINTS } from '@/constants/api';
import { http, unwrapCollection, unwrapEntity } from '@/services/http';

export type DashboardOverview = Record<string, unknown>;
export type DashboardSummary = Record<string, unknown>;
export type VisitorsPayload = Record<string, unknown> | unknown[];

export const dashboardApi = {
  async getOverview() {
    const response = await http.get(API_ENDPOINTS.dashboard.overview);
    return unwrapEntity<DashboardOverview>(response.data);
  },
  async getInquirySummary() {
    const response = await http.get(API_ENDPOINTS.dashboard.inquiriesSummary);
    return unwrapEntity<DashboardSummary>(response.data);
  },
  async getVisitors() {
    const response = await http.get(API_ENDPOINTS.dashboard.visitors);
    const collection = unwrapCollection<Record<string, unknown>>(response.data);

    if (collection.items.length > 0) {
      return collection.items;
    }

    return unwrapEntity<VisitorsPayload>(response.data);
  },
};
