export type CertificationComplianceContentResponse = {
  hero?: {
    badge_text?: string;
    badge_icon?: string;
    title?: string;
    subtitle?: string;
    primary_cta_text?: string;
    primary_cta_link?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
  };
  services_section?: {
    title?: string;
    subtitle?: string;
  };
  process_section?: {
    title?: string;
    subtitle?: string;
    bottom_cta_text?: string;
    bottom_cta_link?: string;
  };
  training_section?: {
    title?: string;
    subtitle?: string;
  };
  testing_section?: {
    title?: string;
    subtitle?: string;
    service_title?: string;
    service_icon?: string;
    turnaround_time?: string;
    cta_text?: string;
    cta_link?: string;
  };
  why_choose_us_section?: {
    title?: string;
    subtitle?: string;
  };
  cta_section?: {
    title?: string;
    subtitle?: string;
    primary_cta_text?: string;
    primary_cta_link?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
    secondary_cta_icon?: string;
  };
  is_active?: boolean | number | string;
};

export type CertificationComplianceContentFormValues = {
  hero_badge_text: string;
  hero_badge_icon: string;
  hero_title: string;
  hero_subtitle: string;
  hero_primary_cta_text: string;
  hero_primary_cta_link: string;
  hero_secondary_cta_text: string;
  hero_secondary_cta_link: string;
  services_section_title: string;
  services_section_subtitle: string;
  process_section_title: string;
  process_section_subtitle: string;
  process_bottom_cta_text: string;
  process_bottom_cta_link: string;
  training_section_title: string;
  training_section_subtitle: string;
  testing_section_title: string;
  testing_section_subtitle: string;
  testing_service_title: string;
  testing_service_icon: string;
  testing_turnaround_time: string;
  testing_cta_text: string;
  testing_cta_link: string;
  why_choose_us_section_title: string;
  why_choose_us_section_subtitle: string;
  cta_section_title: string;
  cta_section_subtitle: string;
  cta_primary_cta_text: string;
  cta_primary_cta_link: string;
  cta_secondary_cta_text: string;
  cta_secondary_cta_link: string;
  cta_secondary_cta_icon: string;
  is_active: boolean;
};

export type CertificationComplianceCollectionItemBase = {
  id: number;
  display_order: number;
  is_active: boolean;
};

export type CertificationService = CertificationComplianceCollectionItemBase & {
  title: string;
  description: string;
  icon: string;
  cta_text: string;
  cta_link: string;
  items: string[];
};

export type CertificationServiceFormValues = Omit<CertificationService, 'id'>;

export type CertificationProcessStep = CertificationComplianceCollectionItemBase & {
  step_number: string;
  title: string;
  duration: string;
  description: string;
  deliverables: string[];
};

export type CertificationProcessStepFormValues = Omit<CertificationProcessStep, 'id'>;

export type CertificationTrainingProgram = CertificationComplianceCollectionItemBase & {
  title: string;
  icon: string;
  duration: string;
  level: string;
  certificate_text: string;
  cta_text: string;
  cta_link: string;
  topics: string[];
};

export type CertificationTrainingProgramFormValues = Omit<CertificationTrainingProgram, 'id'>;

export type CertificationTestingGroup = CertificationComplianceCollectionItemBase & {
  title: string;
  items: string[];
};

export type CertificationTestingGroupFormValues = Omit<CertificationTestingGroup, 'id'>;

export type CertificationWhyChooseUsItem = CertificationComplianceCollectionItemBase & {
  title: string;
  description: string;
  icon: string;
};

export type CertificationWhyChooseUsItemFormValues = Omit<CertificationWhyChooseUsItem, 'id'>;
