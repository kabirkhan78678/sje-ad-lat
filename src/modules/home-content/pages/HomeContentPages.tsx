import { CrudResourcePage } from '@/components/shared/CrudResourcePage';
import { SingletonResourcePage } from '@/components/shared/SingletonResourcePage';
import {
  clientLogosConfig,
  heroConfig,
  homeStatsConfig,
  labEquipmentConfig,
  machineryConfig,
  productionConfigurationsConfig,
  servicesConfig,
  turnkeyStepsConfig,
  whyChooseUsConfig,
} from '@/modules/home-content/config/homeContentConfigs';
import { CoreServicePillarsPage as CoreServicePillarsCustomPage } from '@/modules/home-content/pages/CoreServicePillarsPage';
import { MachineGalleryPage as MachineGalleryCustomPage } from '@/modules/home-content/pages/MachineGalleryPage';
import { MachineryPortfolioPage as MachineryPortfolioCustomPage } from '@/modules/home-content/pages/MachineryPortfolioPage';
import { NationwidePresencePage as NationwidePresenceCustomPage } from '@/modules/home-content/pages/NationwidePresencePage';
import { OurContributionPage as OurContributionCustomPage } from '@/modules/home-content/pages/OurContributionPage';
import { SuccessStoriesPage as SuccessStoriesCustomPage } from '@/modules/home-content/pages/SuccessStoriesPage';

export const HeroSectionPage = () => <SingletonResourcePage config={heroConfig} />;

export const CoreServicePillarsPage = () => <CoreServicePillarsCustomPage />;

export const HomeStatsPage = () => <CrudResourcePage config={homeStatsConfig} />;

export const ServicesPage = () => <CrudResourcePage config={servicesConfig} />;

export const WhyChooseUsPage = () => <CrudResourcePage config={whyChooseUsConfig} />;

export const MachineryPage = () => <CrudResourcePage config={machineryConfig} />;

export const MachineryPortfolioPage = () => <MachineryPortfolioCustomPage />;

export const MachineGalleryPage = () => <MachineGalleryCustomPage />;

export const NationwidePresencePage = () => <NationwidePresenceCustomPage />;

export const SuccessStoriesPage = () => <SuccessStoriesCustomPage />;

export const TurnkeyStepsPage = () => <CrudResourcePage config={turnkeyStepsConfig} />;

export const OurContributionPage = () => <OurContributionCustomPage />;

export const ProductionConfigurationsPage = () => (
  <CrudResourcePage config={productionConfigurationsConfig} />
);

export const LabEquipmentPage = () => <CrudResourcePage config={labEquipmentConfig} />;

export const ClientLogosPage = () => <CrudResourcePage config={clientLogosConfig} />;
