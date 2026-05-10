import { API_ENDPOINTS } from '@/constants/api';
import { createSingletonResourceApi } from '@/services/api/resource';

export const contactInfoApi = createSingletonResourceApi(API_ENDPOINTS.company.contactInfo);
export const callToActionApi = createSingletonResourceApi(API_ENDPOINTS.company.callToAction);
