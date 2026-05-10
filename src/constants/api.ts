export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export const API_ENDPOINTS = {
  auth: {
    login: '/admin/auth/login',
    forgotPassword: '/admin/auth/forgot-password',
    resetPassword: '/admin/auth/reset-password',
  },
  dashboard: {
    overview: '/admin/dashboard/overview',
    inquiriesSummary: '/admin/dashboard/inquiries/summary',
    visitors: '/admin/dashboard/visitors',
  },
  home: {
    hero: '/admin/content/home/hero',
    coreServicePillars: '/admin/content/home/core-service-pillars',
    stats: '/admin/content/home/stats',
    services: '/admin/content/home/services',
    whyChooseUs: '/admin/content/home/why-choose-us',
    machinery: '/admin/content/home/machinery',
    turnkeySteps: '/admin/content/home/turnkey-steps',
    productionConfigurations: '/admin/content/home/production-configurations',
    labEquipment: '/admin/content/home/lab-equipment',
    clientLogos: '/admin/content/home/client-logos',
  },
  about: {
    companyProfile: '/admin/content/about/company-profile',
    projects: '/admin/content/about/projects',
    certifications: '/admin/content/about/certifications',
    leadershipTeam: '/admin/content/about/leadership-team',
    companyTimeline: '/admin/content/about/company-timeline',
  },
  social: {
    csrInitiatives: '/admin/content/social/csr-initiatives',
  },
  catalog: {
    categories: '/admin/catalog/categories',
    products: '/admin/catalog/products',
  },
  company: {
    contactInfo: '/admin/company/contact-info',
    callToAction: '/admin/company/call-to-action',
  },
  leads: {
    inquiries: '/admin/leads/inquiries',
    inquiryStatus: (id: string | number) => `/admin/leads/inquiries/${id}/status`,
    bulkStatus: '/admin/leads/inquiries/bulk-status',
  },
} as const;
