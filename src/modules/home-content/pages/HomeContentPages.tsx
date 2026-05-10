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

export const HeroSectionPage = () => <SingletonResourcePage config={heroConfig} />;

export const CoreServicePillarsPage = () => <CoreServicePillarsCustomPage />;

export const HomeStatsPage = () => <CrudResourcePage config={homeStatsConfig} />;

export const ServicesPage = () => <CrudResourcePage config={servicesConfig} />;

export const WhyChooseUsPage = () => <CrudResourcePage config={whyChooseUsConfig} />;

export const MachineryPage = () => <CrudResourcePage config={machineryConfig} />;

export const TurnkeyStepsPage = () => <CrudResourcePage config={turnkeyStepsConfig} />;

export const ProductionConfigurationsPage = () => (
  <CrudResourcePage config={productionConfigurationsConfig} />
);

export const LabEquipmentPage = () => <CrudResourcePage config={labEquipmentConfig} />;

export const ClientLogosPage = () => <CrudResourcePage config={clientLogosConfig} />;
