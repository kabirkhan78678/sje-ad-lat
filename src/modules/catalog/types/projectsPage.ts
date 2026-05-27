export type ProjectsToggleable = {
  id: number;
  display_order: number;
  is_active: boolean;
};

export type ProjectsHeroSection = {
  section_label: string;
  title: string;
  subtitle: string;
  primary_cta_label: string;
  primary_cta_link: string;
  secondary_cta_label: string;
  secondary_cta_link: string;
  is_active: boolean;
};

export type ProjectsTopStat = ProjectsToggleable & {
  stat_key: string;
  stat_value: string;
  stat_label: string;
};

export type ProjectsFeaturedSection = {
  section_label: string;
  section_title: string;
  section_subtitle: string;
  is_active: boolean;
};

export type FeaturedProjectEquipment = ProjectsToggleable & {
  equipment_title: string;
};

export type FeaturedProject = ProjectsToggleable & {
  title: string;
  year: string;
  location: string;
  industry: string;
  capacity: string;
  image_url: string;
  details_link: string;
  equipment: FeaturedProjectEquipment[];
};

export type ProjectsCalculatorSection = {
  section_title: string;
  section_subtitle: string;
  min_value: number;
  max_value: number;
  step_value: number;
  default_value: number;
  unit_label: string;
  button_label: string;
  button_link: string;
  action_key: string;
  formula_type: string;
  formula_config_json: string;
  is_active: boolean;
};

export type ProjectsTestimonialsSection = {
  section_label: string;
  section_title: string;
  section_subtitle: string;
  is_active: boolean;
};

export type ProjectTestimonial = ProjectsToggleable & {
  client_name: string;
  client_role: string;
  quote: string;
  initials: string;
  avatar_url: string;
  rating: number;
};

export type ProjectsCtaSection = {
  title: string;
  subtitle: string;
  primary_cta_label: string;
  primary_cta_link: string;
  secondary_cta_label: string;
  secondary_cta_link: string;
  is_active: boolean;
};

export type ProjectsPageContent = {
  hero: ProjectsHeroSection;
  stats: ProjectsTopStat[];
  featured_section: ProjectsFeaturedSection;
  featured_projects: FeaturedProject[];
  calculator: ProjectsCalculatorSection;
  testimonials_section: ProjectsTestimonialsSection;
  testimonials: ProjectTestimonial[];
  cta: ProjectsCtaSection;
};

export type ProjectsHeroFormValues = ProjectsHeroSection;
export type ProjectsTopStatFormValues = Omit<ProjectsTopStat, 'id'>;
export type ProjectsFeaturedSectionFormValues = ProjectsFeaturedSection;
export type FeaturedProjectFormValues = Omit<FeaturedProject, 'id' | 'equipment'> & {
  image: File | string | null;
};
export type FeaturedProjectEquipmentFormValues = Omit<FeaturedProjectEquipment, 'id'>;
export type ProjectsCalculatorFormValues = ProjectsCalculatorSection;
export type ProjectsTestimonialsSectionFormValues = ProjectsTestimonialsSection;
export type ProjectTestimonialFormValues = Omit<ProjectTestimonial, 'id'> & {
  avatar: File | string | null;
};
export type ProjectsCtaFormValues = ProjectsCtaSection;
