export const ROUTES = {
  root: '/',
  auth: {
    login: '/login',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
  },
  dashboard: '/dashboard',
  content: {
    home: {
      hero: '/content/home/hero',
      coreServicePillars: '/content/home/core-service-pillars',
      stats: '/content/home/stats',
      services: '/content/home/services',
      whyChooseUs: '/content/home/why-choose-us',
      machinery: '/content/home/machinery',
      turnkeySteps: '/content/home/turnkey-steps',
      productionConfigurations: '/content/home/production-configurations',
      labEquipment: '/content/home/lab-equipment',
      clientLogos: '/content/home/client-logos',
    },
    about: {
      companyProfile: '/content/about/company-profile',
      projects: '/content/about/projects',
      certifications: '/content/about/certifications',
      leadershipTeam: '/content/about/leadership-team',
      companyTimeline: '/content/about/company-timeline',
    },
    social: {
      csrInitiatives: '/content/social/csr-initiatives',
    },
  },
  catalog: {
    categories: '/catalog/categories',
    products: '/catalog/products',
  },
  company: {
    contactInfo: '/company/contact-info',
    callToAction: '/company/call-to-action',
  },
  leads: {
    inquiries: '/leads/inquiries',
  },
} as const;

export const AUTH_ROUTES = Object.values(ROUTES.auth);
