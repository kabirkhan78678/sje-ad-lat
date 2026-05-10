import { CrudResourcePage } from '@/components/shared/CrudResourcePage';
import { SingletonResourcePage } from '@/components/shared/SingletonResourcePage';
import {
  certificationsConfig,
  companyProfileConfig,
  companyTimelineConfig,
  leadershipTeamConfig,
  projectsConfig,
} from '@/modules/about-content/config/aboutContentConfigs';

export const CompanyProfilePage = () => <SingletonResourcePage config={companyProfileConfig} />;

export const ProjectsPage = () => <CrudResourcePage config={projectsConfig} />;

export const CertificationsPage = () => <CrudResourcePage config={certificationsConfig} />;

export const LeadershipTeamPage = () => <CrudResourcePage config={leadershipTeamConfig} />;

export const CompanyTimelinePage = () => <CrudResourcePage config={companyTimelineConfig} />;

