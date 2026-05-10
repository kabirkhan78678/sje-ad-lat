export type CoreServicePillarCard = {
  id: number;
  image?: string | null;
  title: string;
  description: string;
  bullet_items: string[];
  learn_more_label: string;
  learn_more_url: string;
  get_quote_label: string;
  get_quote_url: string;
  sort_order: number;
  is_active: boolean;
};

export type CoreServicePillarsSection = {
  section_title: string;
  section_subtitle: string;
  service_cards: CoreServicePillarCard[];
};

export type CoreServicePillarsSectionPayload = {
  section_title: string;
  section_subtitle: string;
};

export type CoreServicePillarCardFormValues = {
  image: File | string | null;
  title: string;
  description: string;
  bullet_items: string[];
  learn_more_label: string;
  learn_more_url: string;
  get_quote_label: string;
  get_quote_url: string;
  sort_order: number | '';
  is_active: boolean;
};
