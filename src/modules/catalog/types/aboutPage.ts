export type AboutPageSectionRecord = Record<string, unknown>;

export type AboutPageCollectionItem = {
  id: number;
  display_order: number;
  is_active: boolean;
  [key: string]: unknown;
};

export type AboutPageContentResponse = {
  hero_section?: AboutPageSectionRecord | null;
  hero_stats?: AboutPageCollectionItem[] | null;
  intro_section?: AboutPageSectionRecord | null;
  intro_gallery_images?: AboutPageCollectionItem[] | null;
  mission_section?: AboutPageSectionRecord | null;
  vision_section?: AboutPageSectionRecord | null;
  core_values_section?: AboutPageSectionRecord | null;
  core_values?: AboutPageCollectionItem[] | null;
  journey_section?: AboutPageSectionRecord | null;
  journey_timeline?: AboutPageCollectionItem[] | null;
  certifications_section?: AboutPageSectionRecord | null;
  certifications?: AboutPageCollectionItem[] | null;
  leadership_section?: AboutPageSectionRecord | null;
  leadership_members?: AboutPageCollectionItem[] | null;
  why_choose_section?: AboutPageSectionRecord | null;
  why_choose_items?: AboutPageCollectionItem[] | null;
  cta_section?: AboutPageSectionRecord | null;
};
