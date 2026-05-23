export type MachineGalleryImage = {
  id?: number;
  src: string;
  alt: string;
  span: string;
  display_order: number;
  is_active: boolean;
  machine_id?: number | null;
  machine_title?: string;
};

export type MachineGallerySection = {
  section_label: string;
  section_title: string;
  section_description: string;
  images: MachineGalleryImage[];
  selected_machine_ids?: number[];
};

export type MachineGalleryFormValues = {
  section_label: string;
  section_title: string;
  section_description: string;
};
