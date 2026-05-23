export type LaboratoryInfrastructureContentResponse = {
  hero?: {
    title?: string;
    subtitle?: string;
    background_image_url?: string;
    primary_cta_text?: string;
    primary_cta_link?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
  };
  intro?: {
    title?: string;
    description?: string;
  };
  is_active?: boolean | number;
  features?: LaboratoryInfrastructureFeature[];
  featured_products?: LaboratoryInfrastructureFeaturedProductItem[];
};

export type LaboratoryInfrastructureContentFormValues = {
  hero_title: string;
  hero_subtitle: string;
  background_image: File | string | null;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  intro_title: string;
  intro_description: string;
  is_active: boolean;
};

export type LaboratoryInfrastructureFeature = {
  id: number;
  title: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
};

export type LaboratoryInfrastructureFeatureFormValues = {
  title: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
};

export type LaboratoryInfrastructureFeaturedProductItem = {
  id?: number;
  product_id: number;
  display_order: number;
  is_active: boolean | number;
  product?: Record<string, unknown>;
};

export type LaboratoryInfrastructureFeaturedProductsPayload = {
  items: Array<{
    product_id: number;
    display_order: number;
    is_active: 0 | 1;
  }>;
};

export type CatalogProductPreview = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  categoryId: number | null;
  categoryName: string;
};
