export type IndustrialMachineryPageResponse = {
  hero?: {
    badge_text?: string;
    badge_icon?: string;
    title?: string;
    subtitle?: string;
    primary_cta_text?: string;
    primary_cta_link?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
    background_image_url?: string;
    is_active?: boolean | number | string;
  };
  features_section?: {
    title?: string;
    subtitle?: string;
    is_active?: boolean | number | string;
  };
  features?: IndustrialMachineryFeature[];
  catalog_section?: {
    title?: string;
    subtitle?: string;
    is_active?: boolean | number | string;
  };
  categories?: IndustrialMachineryCategory[];
  machines?: IndustrialMachineryMachine[];
  why_choose_us_section?: {
    title?: string;
    subtitle?: string;
    is_active?: boolean | number | string;
  };
  why_choose_us_items?: IndustrialMachineryWhyChooseUsItem[];
  cta_section?: {
    title?: string;
    subtitle?: string;
    primary_cta_text?: string;
    primary_cta_link?: string;
    is_active?: boolean | number | string;
  };
};

export type IndustrialMachineryContentFormValues = {
  hero_badge_text: string;
  hero_badge_icon: string;
  hero_title: string;
  hero_subtitle: string;
  hero_primary_cta_text: string;
  hero_primary_cta_link: string;
  hero_secondary_cta_text: string;
  hero_secondary_cta_link: string;
  background_image: File | string | null;
  features_section_title: string;
  features_section_subtitle: string;
  catalog_section_title: string;
  catalog_section_subtitle: string;
  why_choose_us_section_title: string;
  why_choose_us_section_subtitle: string;
  cta_section_title: string;
  cta_section_subtitle: string;
  cta_primary_cta_text: string;
  cta_primary_cta_link: string;
  is_active: boolean;
};

export type IndustrialMachineryCollectionItemBase = {
  id: number;
  display_order: number;
  is_active: boolean;
};

export type IndustrialMachineryFeature = IndustrialMachineryCollectionItemBase & {
  title: string;
  description: string;
  icon: string;
};

export type IndustrialMachineryFeatureFormValues = Omit<IndustrialMachineryFeature, 'id'>;

export type IndustrialMachineryCategory = IndustrialMachineryCollectionItemBase & {
  source_category_id?: number | null;
  name: string;
  slug: string;
};

export type IndustrialMachineryCategoryFormValues = {
  source_category_id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
};

export type IndustrialMachineryMachine = IndustrialMachineryCollectionItemBase & {
  product_id?: number | null;
  category_id: number;
  title: string;
  description: string;
  image_url: string;
  tag_text: string;
  capacity: string;
  automation: string;
  view_details_text: string;
  view_details_link: string;
  quote_text: string;
  quote_link: string;
  product?: Record<string, unknown> | null;
  category?: Record<string, unknown> | null;
};

export type IndustrialMachineryMachineFormValues = {
  product_id: string;
  category_id: string;
  title: string;
  description: string;
  image: File | null;
  image_url: string;
  tag_text: string;
  capacity: string;
  automation: string;
  view_details_text: string;
  view_details_link: string;
  quote_text: string;
  quote_link: string;
  display_order: number;
  is_active: boolean;
};

export type IndustrialMachineryWhyChooseUsItem = IndustrialMachineryCollectionItemBase & {
  title: string;
  description: string;
  icon: string;
};

export type IndustrialMachineryWhyChooseUsItemFormValues = Omit<
  IndustrialMachineryWhyChooseUsItem,
  'id'
>;

export type AdminCatalogReference = {
  id: number;
  name: string;
  slug: string;
};

export type AdminProductReference = {
  id: number;
  name: string;
  slug: string;
  category_id?: number | null;
  image_url?: string | null;
  image?: string | null;
};
