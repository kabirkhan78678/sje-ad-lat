import { Navigate, createBrowserRouter } from "react-router-dom";

import { ROUTES, ADMIN_BASENAME } from "@/constants/routes";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RootRedirectPage } from "@/pages/RootRedirectPage";
import { PublicOnlyRoute, ProtectedRoute } from "@/routes/guards";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ForgotPasswordPage } from "@/modules/auth/pages/ForgotPasswordPage";
import { LoginPage } from "@/modules/auth/pages/LoginPage";
import { ResetPasswordPage } from "@/modules/auth/pages/ResetPasswordPage";
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import {
  ClientLogosPage,
  CoreServicePillarsPage,
  HeroSectionPage,
  HomeStatsPage,
  LabEquipmentPage,
  MachineGalleryPage,
  MachineryPage,
  MachineryPortfolioPage,
  NationwidePresencePage,
  OurContributionPage,
  ProductionConfigurationsPage,
  ServicesPage,
  SuccessStoriesPage,
  TurnkeyStepsPage,
  WhyChooseUsPage,
} from "@/modules/home-content/pages/HomeContentPages";
import {
  CertificationsPage,
  CompanyProfilePage,
  CompanyTimelinePage,
  LeadershipTeamPage,
  ProjectsPage,
} from "@/modules/about-content/pages/AboutContentPages";
import { CsrInitiativesPage } from "@/modules/social/pages/CsrInitiativesPage";
import { CategoriesPage } from "@/modules/catalog/pages/CategoriesPage";
import { CertificationCompliancePage } from "@/modules/catalog/pages/CertificationCompliancePage";
import { IndustrialMachineryPage } from "@/modules/catalog/pages/IndustrialMachineryPage";
import { LaboratoryInfrastructurePage } from "@/modules/catalog/pages/LaboratoryInfrastructurePage";
import { AboutPageCmsPage } from "@/modules/catalog/pages/AboutPageCmsPage";
import { ContactPageCmsPage } from "@/modules/catalog/pages/ContactPageCmsPage";
import { ProjectsCmsPage } from "@/modules/catalog/pages/ProjectsCmsPage";
import { ProductsPage } from "@/modules/catalog/pages/ProductsPage";
import {
  CallToActionPage,
  ContactInfoPage,
} from "@/modules/company/pages/CompanyPages";
import { InquiriesPage } from "@/modules/leads/pages/InquiriesPage";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootRedirectPage />,
    },
    {
      element: <PublicOnlyRoute />,
      children: [
        {
          element: <AuthLayout />,
          children: [
            {
              path: ROUTES.auth.login,
              element: <LoginPage />,
              handle: {
                title: "Login",
                breadcrumb: "Login",
              },
            },
            {
              path: ROUTES.auth.forgotPassword,
              element: <ForgotPasswordPage />,
              handle: {
                title: "Forgot Password",
                breadcrumb: "Forgot Password",
              },
            },
            {
              path: ROUTES.auth.resetPassword,
              element: <ResetPasswordPage />,
              handle: {
                title: "Reset Password",
                breadcrumb: "Reset Password",
              },
            },
          ],
        },
      ],
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <DashboardLayout />,
          children: [
            {
              path: ROUTES.dashboard,
              element: <DashboardPage />,
              handle: {
                title: "Dashboard",
                breadcrumb: "Dashboard",
              },
            },
            {
              path: "/content",
              handle: {
                breadcrumb: "Content",
              },
              children: [
                {
                  index: true,
                  element: <Navigate replace to={ROUTES.content.home.hero} />,
                },
                {
                  path: "home",
                  handle: {
                    breadcrumb: "Home Content",
                  },
                  children: [
                    {
                      index: true,
                      element: <Navigate replace to={ROUTES.content.home.hero} />,
                    },
                    {
                      path: "hero",
                      element: <HeroSectionPage />,
                      handle: {
                        title: "Hero Section",
                        breadcrumb: "Hero Section",
                      },
                    },
                    {
                      path: "core-service-pillars",
                      element: <CoreServicePillarsPage />,
                      handle: {
                        title: "Core Service Pillars",
                        breadcrumb: "Core Service Pillars",
                      },
                    },
                    {
                      path: "nationwide-presence",
                      element: <NationwidePresencePage />,
                      handle: {
                        title: "Nationwide Presence",
                        breadcrumb: "Nationwide Presence",
                      },
                    },
                    {
                      path: "stats",
                      element: <HomeStatsPage />,
                      handle: {
                        title: "Home Stats",
                        breadcrumb: "Stats",
                      },
                    },
                    {
                      path: "services",
                      element: <ServicesPage />,
                      handle: {
                        title: "Services",
                        breadcrumb: "Services",
                      },
                    },
                    {
                      path: "why-choose-us",
                      element: <WhyChooseUsPage />,
                      handle: {
                        title: "Why Choose Us",
                        breadcrumb: "Why Choose Us",
                      },
                    },
                    {
                      path: "machinery",
                      element: <MachineryPage />,
                      handle: {
                        title: "Machinery",
                        breadcrumb: "Machinery",
                      },
                    },
                    {
                      path: "machinery-portfolio",
                      element: <MachineryPortfolioPage />,
                      handle: {
                        title: "Machinery Portfolio",
                        breadcrumb: "Machinery Portfolio",
                      },
                    },
                    {
                      path: "machinery-gallery",
                      element: <MachineGalleryPage />,
                      handle: {
                        title: "Machine Gallery",
                        breadcrumb: "Machine Gallery",
                      },
                    },
                    {
                      path: "success-stories",
                      element: <SuccessStoriesPage />,
                      handle: {
                        title: "Success Stories",
                        breadcrumb: "Success Stories",
                      },
                    },
                    {
                      path: "our-contribution",
                      element: <OurContributionPage />,
                      handle: {
                        title: "Our Contribution",
                        breadcrumb: "Our Contribution",
                      },
                    },
                    {
                      path: "turnkey-steps",
                      element: <TurnkeyStepsPage />,
                      handle: {
                        title: "Turnkey Steps",
                        breadcrumb: "Turnkey Steps",
                      },
                    },
                    {
                      path: "production-configurations",
                      element: <ProductionConfigurationsPage />,
                      handle: {
                        title: "Production Configurations",
                        breadcrumb: "Production Configurations",
                      },
                    },
                    {
                      path: "lab-equipment",
                      element: <LabEquipmentPage />,
                      handle: {
                        title: "Lab Equipment",
                        breadcrumb: "Lab Equipment",
                      },
                    },
                    {
                      path: "client-logos",
                      element: <ClientLogosPage />,
                      handle: {
                        title: "Client Logos",
                        breadcrumb: "Client Logos",
                      },
                    },
                  ],
                },
                {
                  path: "about",
                  handle: {
                    breadcrumb: "About Content",
                  },
                  children: [
                    {
                      index: true,
                      element: (
                        <Navigate replace to={ROUTES.content.about.companyProfile} />
                      ),
                    },
                    {
                      path: "company-profile",
                      element: <CompanyProfilePage />,
                      handle: {
                        title: "Company Profile",
                        breadcrumb: "Company Profile",
                      },
                    },
                    {
                      path: "projects",
                      element: <ProjectsPage />,
                      handle: {
                        title: "Projects",
                        breadcrumb: "Projects",
                      },
                    },
                    {
                      path: "certifications",
                      element: <CertificationsPage />,
                      handle: {
                        title: "Certifications",
                        breadcrumb: "Certifications",
                      },
                    },
                    {
                      path: "leadership-team",
                      element: <LeadershipTeamPage />,
                      handle: {
                        title: "Leadership Team",
                        breadcrumb: "Leadership Team",
                      },
                    },
                    {
                      path: "company-timeline",
                      element: <CompanyTimelinePage />,
                      handle: {
                        title: "Company Timeline",
                        breadcrumb: "Company Timeline",
                      },
                    },
                  ],
                },
                {
                  path: "catalog",
                  handle: {
                    breadcrumb: "Catalog",
                  },
                  children: [
                    {
                      path: "about-page",
                      element: <AboutPageCmsPage />,
                      handle: {
                        title: "About Page",
                        breadcrumb: "About Page",
                      },
                    },
                    {
                      path: "contact-page",
                      element: <ContactPageCmsPage />,
                      handle: {
                        title: "Contact Page",
                        breadcrumb: "Contact Page",
                      },
                    },
                  ],
                },
                {
                  path: "social",
                  handle: {
                    breadcrumb: "Social / CSR",
                  },
                  children: [
                    {
                      index: true,
                      element: (
                        <Navigate
                          replace
                          to={ROUTES.content.social.csrInitiatives}
                        />
                      ),
                    },
                    {
                      path: "csr-initiatives",
                      element: <CsrInitiativesPage />,
                      handle: {
                        title: "CSR Initiatives",
                        breadcrumb: "CSR Initiatives",
                      },
                    },
                  ],
                },
              ],
            },
            {
              path: "/catalog",
              handle: {
                breadcrumb: "Catalog",
              },
              children: [
                {
                  index: true,
                  element: <Navigate replace to={ROUTES.catalog.categories} />,
                },
                {
                  path: "categories",
                  element: <CategoriesPage />,
                  handle: {
                    title: "Catalog Categories",
                    breadcrumb: "Categories",
                  },
                },
                {
                  path: "products",
                  element: <ProductsPage />,
                  handle: {
                    title: "Catalog Products",
                    breadcrumb: "Products",
                  },
                },
                {
                  path: "laboratory-infrastructure",
                  element: <LaboratoryInfrastructurePage />,
                  handle: {
                    title: "Laboratory Infrastructure",
                    breadcrumb: "Laboratory Infrastructure",
                  },
                },
                {
                  path: "certification-compliance",
                  element: <CertificationCompliancePage />,
                  handle: {
                    title: "Certification & Compliance",
                    breadcrumb: "Certification & Compliance",
                  },
                },
                {
                  path: "industrial-machinery",
                  element: <IndustrialMachineryPage />,
                  handle: {
                    title: "Industrial Machinery",
                    breadcrumb: "Industrial Machinery",
                  },
                },
                {
                  path: "projects",
                  element: <ProjectsCmsPage />,
                  handle: {
                    title: "Projects",
                    breadcrumb: "Projects",
                  },
                },
              ],
            },
            {
              path: "/company",
              handle: {
                breadcrumb: "Company",
              },
              children: [
                {
                  index: true,
                  element: <Navigate replace to={ROUTES.company.contactInfo} />,
                },
                {
                  path: "contact-info",
                  element: <ContactInfoPage />,
                  handle: {
                    title: "Contact Info",
                    breadcrumb: "Contact Info",
                  },
                },
                {
                  path: "call-to-action",
                  element: <CallToActionPage />,
                  handle: {
                    title: "Call To Action",
                    breadcrumb: "Call To Action",
                  },
                },
              ],
            },
            {
              path: "/leads",
              handle: {
                breadcrumb: "Leads",
              },
              children: [
                {
                  index: true,
                  element: <Navigate replace to={ROUTES.leads.inquiries} />,
                },
                {
                  path: "inquiries",
                  element: <InquiriesPage />,
                  handle: {
                    title: "Inquiries",
                    breadcrumb: "Inquiries",
                  },
                },
              ],
            },
            {
              path: "*",
              element: <NotFoundPage />,
              handle: {
                title: "Not Found",
                breadcrumb: "Not Found",
              },
            },
          ],
        },
      ],
    },
  ],
  {
    basename: ADMIN_BASENAME,
  },
);
