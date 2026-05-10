import { SingletonResourcePage } from '@/components/shared/SingletonResourcePage';
import { callToActionConfig, contactInfoConfig } from '@/modules/company/config/companyConfigs';

export const ContactInfoPage = () => <SingletonResourcePage config={contactInfoConfig} />;

export const CallToActionPage = () => <SingletonResourcePage config={callToActionConfig} />;

