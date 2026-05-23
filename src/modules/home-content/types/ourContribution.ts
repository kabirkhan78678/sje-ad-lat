export type CsrSectionSettings = {
  id?: number;
  section_label: string;
  section_title: string;
  section_subtitle: string;
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
  cta_button_link: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CsrInitiative = {
  id: number;
  badge: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CsrSectionResponse = {
  section: CsrSectionSettings;
  initiatives: CsrInitiative[];
};

export type CsrSectionPayload = {
  section_label: string;
  section_title: string;
  section_subtitle: string;
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
  cta_button_link: string;
  is_active: boolean | number;
};

export type CsrInitiativeFormValues = {
  badge: string;
  title: string;
  description: string;
  image: File | string | null;
  display_order: number | '';
  is_active: boolean;
};
