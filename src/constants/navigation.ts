import {
  Activity,
  BriefcaseBusiness,
  Building2,
  ChartBar,
  Factory,
  FileText,
  FlaskConical,
  FolderTree,
  Images,
  Info,
  LayoutDashboard,
  Map,
  MessageSquareShare,
  Package,
  Phone,
  ShieldCheck,
  Users,
  Waypoints,
  Wrench,
} from 'lucide-react';

import { ROUTES } from '@/constants/routes';

export const navigationGroups = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: ROUTES.dashboard,
      },
    ],
  },
  {
    title: 'Home Content',
    items: [
      { label: 'Hero Section', icon: Images, path: ROUTES.content.home.hero },
      { label: 'Core Service Pillars', icon: BriefcaseBusiness, path: ROUTES.content.home.coreServicePillars },
      { label: 'Nationwide Presence', icon: Map, path: ROUTES.content.home.nationwidePresence },
      { label: 'Stats', icon: ChartBar, path: ROUTES.content.home.stats },
      { label: 'Services', icon: BriefcaseBusiness, path: ROUTES.content.home.services },
      { label: 'Why Choose Us', icon: ShieldCheck, path: ROUTES.content.home.whyChooseUs },
      { label: 'Machinery', icon: Factory, path: ROUTES.content.home.machinery },
      {
        label: 'Machinery Portfolio',
        icon: Wrench,
        path: ROUTES.content.home.machineryPortfolio,
      },
      { label: 'Machine Gallery', icon: Images, path: ROUTES.content.home.machineGallery },
      { label: 'Success Stories', icon: Map, path: ROUTES.content.home.successStories },
      { label: 'Our Contribution', icon: Info, path: ROUTES.content.home.ourContribution },
      { label: 'Turnkey Steps', icon: Waypoints, path: ROUTES.content.home.turnkeySteps },
      {
        label: 'Production Configurations',
        icon: Activity,
        path: ROUTES.content.home.productionConfigurations,
      },
      { label: 'Lab Equipment', icon: FlaskConical, path: ROUTES.content.home.labEquipment },
      { label: 'Client Logos', icon: Users, path: ROUTES.content.home.clientLogos },
    ],
  },
  {
    title: 'About Content',
    items: [
      { label: 'Company Profile', icon: Building2, path: ROUTES.content.about.companyProfile },
      { label: 'Projects', icon: FolderTree, path: ROUTES.content.about.projects },
      { label: 'Certifications', icon: ShieldCheck, path: ROUTES.content.about.certifications },
      { label: 'Leadership Team', icon: Users, path: ROUTES.content.about.leadershipTeam },
      { label: 'Company Timeline', icon: Waypoints, path: ROUTES.content.about.companyTimeline },
    ],
  },
  {
    title: 'Social / CSR',
    items: [
      { label: 'CSR Initiatives', icon: Info, path: ROUTES.content.social.csrInitiatives },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Categories', icon: FolderTree, path: ROUTES.catalog.categories },
      { label: 'Products', icon: Package, path: ROUTES.catalog.products },
      { label: 'Laboratory Infrastructure', icon: FlaskConical, path: ROUTES.catalog.laboratoryInfrastructure },
      { label: 'Certification & Compliance', icon: ShieldCheck, path: ROUTES.catalog.certificationCompliance },
      { label: 'Industrial Machinery', icon: Factory, path: ROUTES.catalog.industrialMachinery },
      { label: 'Projects', icon: FolderTree, path: ROUTES.catalog.projects },
      { label: 'About Page', icon: Info, path: ROUTES.content.catalog.aboutPage },
      { label: 'Contact Page', icon: Phone, path: ROUTES.content.catalog.contactPage },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Contact Info', icon: Building2, path: ROUTES.company.contactInfo },
      { label: 'Call To Action', icon: FileText, path: ROUTES.company.callToAction },
    ],
  },
  {
    title: 'Leads',
    items: [
      { label: 'Inquiries', icon: MessageSquareShare, path: ROUTES.leads.inquiries },
    ],
  },
] as const;

export const quickActionLinks = [
  {
    title: 'Manage inquiries',
    description: 'Review new leads, change status, and update notes.',
    path: ROUTES.leads.inquiries,
    icon: MessageSquareShare,
  },
  {
    title: 'Update homepage hero',
    description: 'Adjust headline messaging and CTA links.',
    path: ROUTES.content.home.hero,
    icon: Images,
  },
  {
    title: 'Maintain products',
    description: 'Refresh catalog content and specifications.',
    path: ROUTES.catalog.products,
    icon: Package,
  },
  {
    title: 'Edit company profile',
    description: 'Keep company information and highlights accurate.',
    path: ROUTES.content.about.companyProfile,
    icon: Building2,
  },
  {
    title: 'Review machinery',
    description: 'Update machinery ranges, sections, and capabilities.',
    path: ROUTES.content.home.machinery,
    icon: Wrench,
  },
];
