export const ADMIN_BASENAME = '/admin';

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
      nationwidePresence: '/content/home/nationwide-presence',
      successStories: '/content/home/success-stories',
      stats: '/content/home/stats',
      services: '/content/home/services',
      whyChooseUs: '/content/home/why-choose-us',
      machinery: '/content/home/machinery',
      machineryPortfolio: '/content/home/machinery-portfolio',
      machineGallery: '/content/home/machinery-gallery',
      ourContribution: '/content/home/our-contribution',
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
    catalog: {
      aboutPage: '/content/catalog/about-page',
      contactPage: '/content/catalog/contact-page',
    },
    social: {
      csrInitiatives: '/content/social/csr-initiatives',
    },
  },
  catalog: {
    categories: '/catalog/categories',
    products: '/catalog/products',
    laboratoryInfrastructure: '/catalog/laboratory-infrastructure',
    certificationCompliance: '/catalog/certification-compliance',
    industrialMachinery: '/catalog/industrial-machinery',
    projects: '/catalog/projects',
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

export const stripAdminBase = (pathname: string) => {
  if (pathname === ADMIN_BASENAME) {
    return ROUTES.root;
  }

  if (pathname.startsWith(`${ADMIN_BASENAME}/`)) {
    return pathname.slice(ADMIN_BASENAME.length);
  }

  return pathname;
};

export const withAdminBase = (pathname: string) => {
  if (pathname === ROUTES.root) {
    return ADMIN_BASENAME;
  }

  return `${ADMIN_BASENAME}${pathname}`;
};
