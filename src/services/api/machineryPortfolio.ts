import { API_ENDPOINTS } from '@/constants/api';
import { http, unwrapEntity } from '@/services/http';
import type {
  MachineryPortfolioMachine,
  MachineryPortfolioSection,
  MachineryPortfolioSectionPayload,
} from '@/modules/home-content/types/machineryPortfolio';

const sectionEndpoint = API_ENDPOINTS.home.machineryPortfolio;
const machinesEndpoint = `${sectionEndpoint}/machines`;

export const getMachineryPortfolio = async () => {
  const response = await http.get(sectionEndpoint);
  return unwrapEntity<MachineryPortfolioSection>(response.data);
};

export const updateMachineryPortfolioSection = async (
  data: MachineryPortfolioSectionPayload,
) => {
  const response = await http.put(sectionEndpoint, data);
  return unwrapEntity<MachineryPortfolioSection>(response.data);
};

export const createMachineryPortfolioMachine = async (formData: FormData) => {
  const response = await http.post(machinesEndpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return unwrapEntity<MachineryPortfolioMachine>(response.data);
};

export const updateMachineryPortfolioMachine = async (
  id: string | number,
  formData: FormData,
) => {
  const response = await http.put(`${machinesEndpoint}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return unwrapEntity<MachineryPortfolioMachine>(response.data);
};

export const deleteMachineryPortfolioMachine = async (id: string | number) => {
  await http.delete(`${machinesEndpoint}/${id}`);
};

export const reorderMachineryPortfolioMachines = async (items: Array<{ id: number }>) => {
  const response = await http.put(`${machinesEndpoint}/reorder`, items);
  return unwrapEntity<MachineryPortfolioSection>(response.data);
};

export const toggleMachineryPortfolioMachine = async (
  id: string | number,
  is_active: boolean,
) => {
  const response = await http.patch(`${machinesEndpoint}/${id}/toggle`, { is_active });
  return unwrapEntity<MachineryPortfolioMachine>(response.data);
};
