import { API_ENDPOINTS } from '@/constants/api';
import { createCrudResourceApi, createSingletonResourceApi } from '@/services/api/resource';

export const heroContentApi = createSingletonResourceApi(API_ENDPOINTS.home.hero);
export const homeStatsApi = createCrudResourceApi(API_ENDPOINTS.home.stats);
export const servicesApi = createCrudResourceApi(API_ENDPOINTS.home.services);
export const whyChooseUsApi = createCrudResourceApi(API_ENDPOINTS.home.whyChooseUs);
export const machineryApi = createCrudResourceApi(API_ENDPOINTS.home.machinery);
export const turnkeyStepsApi = createCrudResourceApi(API_ENDPOINTS.home.turnkeySteps);
export const productionConfigurationsApi = createCrudResourceApi(
  API_ENDPOINTS.home.productionConfigurations,
);
export const labEquipmentApi = createCrudResourceApi(API_ENDPOINTS.home.labEquipment);
export const clientLogosApi = createCrudResourceApi(API_ENDPOINTS.home.clientLogos);

export const companyProfileApi = createSingletonResourceApi(API_ENDPOINTS.about.companyProfile);
export const projectsApi = createCrudResourceApi(API_ENDPOINTS.about.projects);
export const certificationsApi = createCrudResourceApi(API_ENDPOINTS.about.certifications);
export const leadershipTeamApi = createCrudResourceApi(API_ENDPOINTS.about.leadershipTeam);
export const companyTimelineApi = createCrudResourceApi(API_ENDPOINTS.about.companyTimeline);

export const csrInitiativesApi = createCrudResourceApi(API_ENDPOINTS.social.csrInitiatives);
