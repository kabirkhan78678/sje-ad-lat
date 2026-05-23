import { API_ENDPOINTS } from '@/constants/api';
import { http, unwrapEntity } from '@/services/http';
import type { MachineGallerySection } from '@/modules/home-content/types/machineGallery';

export const getMachineGallery = async () => {
  const response = await http.get(API_ENDPOINTS.home.machineGallery);
  return unwrapEntity<MachineGallerySection>(response.data);
};

export const saveMachineGallery = async (payload: MachineGallerySection) => {
  const response = await http.post(API_ENDPOINTS.home.machineGallery, payload);
  return unwrapEntity<MachineGallerySection>(response.data);
};

export const uploadMachineGalleryImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await http.post(API_ENDPOINTS.uploads.galleryImage, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return unwrapEntity<{ src: string }>(response.data);
};
