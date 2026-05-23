export type MachineryPortfolioMachine = {
  id: number;
  name: string;
  category: string;
  badge: string;
  image: string;
  description: string;
  display_order: number;
  is_active: boolean;
  source_machine_id?: number | null;
  category_id?: number | null;
  product_id?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type MachineryPortfolioSection = {
  id?: number;
  section_title: string;
  section_subtitle: string;
  section_label: string;
  is_active: boolean;
  machines: MachineryPortfolioMachine[];
  selected_machine_ids?: number[];
};

export type MachineryPortfolioFormValues = {
  section_title: string;
  section_subtitle: string;
  section_label: string;
  is_active: boolean;
};

export type MachineryPortfolioSectionPayload = MachineryPortfolioFormValues & {
  selected_machine_ids: number[];
  machines: Array<{
    source_machine_id: number;
    product_id?: number | null;
    category_id?: number | null;
    name: string;
    category: string;
    badge: string;
    image: string;
    description: string;
    display_order: number;
    is_active: boolean;
  }>;
};
