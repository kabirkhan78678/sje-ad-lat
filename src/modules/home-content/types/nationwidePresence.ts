export type NationwidePresenceSection = {
  id?: number;
  section_label: string;
  section_title: string;
  section_subtitle: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type NationwidePresenceStateService = {
  id: number;
  state_id?: number;
  service_title: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type NationwidePresenceState = {
  id: number;
  state_name: string;
  project_count: string;
  display_order: number;
  is_active: boolean;
  services: NationwidePresenceStateService[];
  created_at?: string;
  updated_at?: string;
};

export type NationwidePresenceLocation = {
  id: number;
  city_name: string;
  short_code: string;
  subtitle: string;
  state_id: number;
  state_name?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type NationwidePresenceStat = {
  id: number;
  stat_key: string;
  stat_value: string;
  stat_label: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type NationwidePresenceResponse = {
  section: NationwidePresenceSection;
  states: NationwidePresenceState[];
  locations: NationwidePresenceLocation[];
  stats: NationwidePresenceStat[];
};

export type NationwidePresenceSectionPayload = {
  section_label: string;
  section_title: string;
  section_subtitle: string;
  is_active: boolean | number;
};

export type NationwidePresenceStatePayload = {
  state_name: string;
  project_count: string;
  display_order: number;
  is_active: boolean | number;
};

export type NationwidePresenceStateServicePayload = {
  service_title: string;
  display_order: number;
  is_active: boolean | number;
};

export type NationwidePresenceLocationPayload = {
  city_name: string;
  short_code: string;
  subtitle: string;
  state_id: number;
  display_order: number;
  is_active: boolean | number;
};

export type NationwidePresenceStatPayload = {
  stat_key: string;
  stat_value: string;
  stat_label: string;
  display_order: number;
  is_active: boolean | number;
};
