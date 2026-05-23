export type ContactPageSectionRecord = Record<string, unknown>;

export type ContactPageCollectionItem = {
  id: number;
  display_order: number;
  is_active: boolean;
  [key: string]: unknown;
};

export type ContactPageContentResponse = {
  hero_section?: ContactPageSectionRecord | null;
  contact_cards_section?: ContactPageSectionRecord | null;
  contact_cards?: ContactPageCollectionItem[] | null;
  departments_section?: ContactPageSectionRecord | null;
  departments?: ContactPageCollectionItem[] | null;
  form_section?: ContactPageSectionRecord | null;
  service_options?: ContactPageCollectionItem[] | null;
  trust_highlights?: ContactPageCollectionItem[] | null;
  office_section?: ContactPageSectionRecord | null;
  office_map?: ContactPageSectionRecord | null;
  office_info_cards?: ContactPageCollectionItem[] | null;
};

export type ContactInquiryPayload = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  message?: string;
};
