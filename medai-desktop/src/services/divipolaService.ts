import { api } from './api';

export interface DivipolaItem {
  code: string;
  name: string;
}

export const divipolaService = {
  getDepartments: async (): Promise<DivipolaItem[]> => {
    const res = await api.get<DivipolaItem[]>('/divipola/departments');
    return res.data;
  },
  getMunicipalities: async (deptCode: string): Promise<DivipolaItem[]> => {
    const res = await api.get<DivipolaItem[]>(`/divipola/municipalities/${deptCode}`);
    return res.data;
  },
};