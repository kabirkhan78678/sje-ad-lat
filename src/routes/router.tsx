import { Navigate, createBrowserRouter } from 'react-router-dom';

import { NotFoundPage } from '@/pages/NotFoundPage';
import { RootRedirectPage } from '@/pages/RootRedirectPage';
import { PublicOnlyRoute, ProtectedRoute } from '@/routes/guards';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ForgotPasswordPage } from '@/modules/auth/pages/ForgotPasswordPage';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { ResetPasswordPage } from '@/modules/auth/pages/ResetPasswordPage';
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage';
import {
  ClientLogosPage,
  CoreServicePillarsPage,
  HeroSectionPage,
  HomeStatsPage,
  LabEquipmentPage,
  MachineryPage,
  ProductionConfigurationsPage,
  ServicesPage,
  TurnkeyStepsPage,
  WhyChooseUsPage,
} from '@/modules/home-content/pages/HomeContentPages';
import {
  CertificationsPage,
  CompanyProfilePage,
  CompanyTimelinePage,
  LeadershipTeamPage,
  ProjectsPage,
} from '@/modules/about-content/pages/AboutContentPages';
import { CsrInitiativesPage } from '@/modules/social/pages/CsrInitiativesPage';
import { CategoriesPage } from '@/modules/catalog/pages/CategoriesPage';
import { ProductsPage } from '@/modules/catalog/pages/ProductsPage';
import { CallToActionPage, ContactInfoPage } from '@/modules/company/pages/CompanyPages';
import { InquiriesPage } from '@/modules/leads/pages/InquiriesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirectPage />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/login',
            element: <LoginPage />,
            handle: {
              title: 'Login',
              breadcrumb: 'Login',
            },
          },
          {
            path: '/forgot-password',
            element: <ForgotPasswordPage />,
            handle: {
              title: 'Forgot Password',
              breadcrumb: 'Forgot Password',
            },
          },
          {
            path: '/reset-password',
            element: <ResetPasswordPage />,
            handle: {
              title: 'Reset Password',
              breadcrumb: 'Reset Password',
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
            path: '/dashboard',
            element: <DashboardPage />,
            handle: {
              title: 'Dashboard',
              breadcrumb: 'Dashboard',
            },
          },
          {
            path: '/content',
            handle: {
              breadcrumb: 'Content',
            },
            children: [
              {
                index: true,
                element: <Navigate replace to="/content/home/hero" />,
              },
              {
                path: 'home',
                handle: {
                  breadcrumb: 'Home Content',
                },
                children: [
                  {
                    index: true,
                    element: <Navigate replace to="/content/home/hero" />,
                  },
                  {
                    path: 'hero',
                    element: <HeroSectionPage />,
                    handle: {
                      title: 'Hero Section',
                      breadcrumb: 'Hero Section',
                    },
                  },
                  {
                    path: 'core-service-pillars',
                    element: <CoreServicePillarsPage />,
                    handle: {
                      title: 'Core Service Pillars',
                      breadcrumb: 'Core Service Pillars',
                    },
                  },
                  {
                    path: 'stats',
                    element: <HomeStatsPage />,
                    handle: {
                      title: 'Home Stats',
                      breadcrumb: 'Stats',
                    },
                  },
                  {
                    path: 'services',
                    element: <ServicesPage />,
                    handle: {
                      title: 'Services',
                      breadcrumb: 'Services',
                    },
                  },
                  {
                    path: 'why-choose-us',
                    element: <WhyChooseUsPage />,
                    handle: {
                      title: 'Why Choose Us',
                      breadcrumb: 'Why Choose Us',
                    },
                  },
                  {
                    path: 'machinery',
                    element: <MachineryPage />,
                    handle: {
                      title: 'Machinery',
                      breadcrumb: 'Machinery',
                    },
                  },
                  {
                    path: 'turnkey-steps',
                    element: <TurnkeyStepsPage />,
                    handle: {
                      title: 'Turnkey Steps',
                      breadcrumb: 'Turnkey Steps',
                    },
                  },
                  {
                    path: 'production-configurations',
                    element: <ProductionConfigurationsPage />,
                    handle: {
                      title: 'Production Configurations',
                      breadcrumb: 'Production Configurations',
                    },
                  },
                  {
                    path: 'lab-equipment',
                    element: <LabEquipmentPage />,
                    handle: {
                      title: 'Lab Equipment',
                      breadcrumb: 'Lab Equipment',
                    },
                  },
                  {
                    path: 'client-logos',
                    element: <ClientLogosPage />,
                    handle: {
                      title: 'Client Logos',
                      breadcrumb: 'Client Logos',
                    },
                  },
                ],
              },
              {
                path: 'about',
                handle: {
                  breadcrumb: 'About Content',
                },
                children: [
                  {
                    index: true,
                    element: <Navigate replace to="/content/about/company-profile" />,
                  },
                  {
                    path: 'company-profile',
                    element: <CompanyProfilePage />,
                    handle: {
                      title: 'Company Profile',
                      breadcrumb: 'Company Profile',
                    },
                  },
                  {
                    path: 'projects',
                    element: <ProjectsPage />,
                    handle: {
                      title: 'Projects',
                      breadcrumb: 'Projects',
                    },
                  },
                  {
                    path: 'certifications',
                    element: <CertificationsPage />,
                    handle: {
                      title: 'Certifications',
                      breadcrumb: 'Certifications',
                    },
                  },
                  {
                    path: 'leadership-team',
                    element: <LeadershipTeamPage />,
                    handle: {
                      title: 'Leadership Team',
                      breadcrumb: 'Leadership Team',
                    },
                  },
                  {
                    path: 'company-timeline',
                    element: <CompanyTimelinePage />,
                    handle: {
                      title: 'Company Timeline',
                      breadcrumb: 'Company Timeline',
                    },
                  },
                ],
              },
              {
                path: 'social',
                handle: {
                  breadcrumb: 'Social / CSR',
                },
                children: [
                  {
                    index: true,
                    element: <Navigate replace to="/content/social/csr-initiatives" />,
                  },
                  {
                    path: 'csr-initiatives',
                    element: <CsrInitiativesPage />,
                    handle: {
                      title: 'CSR Initiatives',
                      breadcrumb: 'CSR Initiatives',
                    },
                  },
                ],
              },
            ],
          },
          {
            path: '/catalog',
            handle: {
              breadcrumb: 'Catalog',
            },
            children: [
              {
                index: true,
                element: <Navigate replace to="/catalog/categories" />,
              },
              {
                path: 'categories',
                element: <CategoriesPage />,
                handle: {
                  title: 'Catalog Categories',
                  breadcrumb: 'Categories',
                },
              },
              {
                path: 'products',
                element: <ProductsPage />,
                handle: {
                  title: 'Catalog Products',
                  breadcrumb: 'Products',
                },
              },
            ],
          },
          {
            path: '/company',
            handle: {
              breadcrumb: 'Company',
            },
            children: [
              {
                index: true,
                element: <Navigate replace to="/company/contact-info" />,
              },
              {
                path: 'contact-info',
                element: <ContactInfoPage />,
                handle: {
                  title: 'Contact Info',
                  breadcrumb: 'Contact Info',
                },
              },
              {
                path: 'call-to-action',
                element: <CallToActionPage />,
                handle: {
                  title: 'Call To Action',
                  breadcrumb: 'Call To Action',
                },
              },
            ],
          },
          {
            path: '/leads',
            handle: {
              breadcrumb: 'Leads',
            },
            children: [
              {
                index: true,
                element: <Navigate replace to="/leads/inquiries" />,
              },
              {
                path: 'inquiries',
                element: <InquiriesPage />,
                handle: {
                  title: 'Inquiries',
                  breadcrumb: 'Inquiries',
                },
              },
            ],
          },
          {
            path: '*',
            element: <NotFoundPage />,
            handle: {
              title: 'Not Found',
              breadcrumb: 'Not Found',
            },
          },
        ],
      },
    ],
  },
]);
