export type SuccessStorySection = {
  id?: number;
  section_label: string;
  section_title: string;
  section_subtitle: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type SuccessStoryService = {
  id: number;
  state_id?: number;
  service_name: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
};

export type SuccessStoryState = {
  id: number;
  state_name: string;
  project_count: string;
  display_order: number;
  is_active: boolean;
  services: SuccessStoryService[];
  created_at?: string;
  updated_at?: string;
};

export type SuccessStoryStat = {
  id: number;
  stat_key: string;
  stat_value: string;
  stat_label: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type SuccessStoriesResponse = {
  section: SuccessStorySection;
  states: SuccessStoryState[];
  stats: SuccessStoryStat[];
};

export type SuccessStorySectionPayload = {
  section_label: string;
  section_title: string;
  section_subtitle: string;
  is_active: boolean | number;
};

export type SuccessStoryStatePayload = {
  state_name: string;
  project_count: string;
  display_order: number;
  is_active: boolean | number;
};

export type SuccessStoryServicePayload = {
  service_name: string;
  display_order: number;
};

export type SuccessStoryStatPayload = {
  stat_key: string;
  stat_value: string;
  stat_label: string;
  display_order: number;
  is_active: boolean | number;
};
