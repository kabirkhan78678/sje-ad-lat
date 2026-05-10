import { API_ENDPOINTS } from '@/constants/api';
import { http, unwrapCollection, unwrapEntity } from '@/services/http';

export type InquiryRecord = {
  id: string | number;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  category?: string;
  message?: string;
  status?: string;
  source?: string;
  estimated_value?: number | string;
  notes?: string;
  state?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type InquiryStatusPayload = {
  status: string;
};

export type BulkInquiryStatusPayload = {
  ids: Array<string | number>;
  status: string;
};

export type InquiryUpdatePayload = Partial<
  Pick<
    InquiryRecord,
    'name' | 'email' | 'phone' | 'subject' | 'category' | 'message' | 'status' | 'source' | 'notes'
  >
> & {
  estimated_value?: number;
};

export const leadsApi = {
  async list() {
    const response = await http.get(API_ENDPOINTS.leads.inquiries);
    return unwrapCollection<InquiryRecord>(response.data);
  },
  async getById(id: string | number) {
    const response = await http.get(`${API_ENDPOINTS.leads.inquiries}/${id}`);
    return unwrapEntity<InquiryRecord>(response.data);
  },
  async update(id: string | number, payload: InquiryUpdatePayload) {
    const response = await http.put(`${API_ENDPOINTS.leads.inquiries}/${id}`, payload);
    return unwrapEntity<InquiryRecord>(response.data);
  },
  async updateStatus(id: string | number, payload: InquiryStatusPayload) {
    const response = await http.patch(API_ENDPOINTS.leads.inquiryStatus(id), payload);
    return unwrapEntity<InquiryRecord>(response.data);
  },
  async bulkUpdateStatus(payload: BulkInquiryStatusPayload) {
    const response = await http.post(API_ENDPOINTS.leads.bulkStatus, payload);
    return unwrapEntity<Record<string, unknown>>(response.data);
  },
  async delete(id: string | number) {
    await http.delete(`${API_ENDPOINTS.leads.inquiries}/${id}`);
  },
};
