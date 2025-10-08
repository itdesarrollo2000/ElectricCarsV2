import api from './api';
import type { AdditionalEquipment, AdditionalEquipmentRequest } from '../types';

export const equipmentService = {
  // Get additional equipments
  getAdditionalEquipments: async (): Promise<AdditionalEquipment[]> => {
    const response = await api.get<AdditionalEquipment[]>('/AdditionalEquipments');
    return response.data;
  },

  // Get equipments by vehicle version ID
  getAdditionalEquipmentsByVersionId: async (versionId: number): Promise<AdditionalEquipment[]> => {
    const response = await api.get<AdditionalEquipment[]>(`/AdditionalEquipments/ByVersion/${versionId}`);
    return response.data;
  },

  // Get equipment by ID
  getAdditionalEquipmentById: async (id: number): Promise<AdditionalEquipment> => {
    const response = await api.get<AdditionalEquipment>(`/AdditionalEquipments/${id}`);
    return response.data;
  },

  // Add new equipment
  addAdditionalEquipment: async (equipment: AdditionalEquipmentRequest): Promise<AdditionalEquipment> => {
    const response = await api.post<AdditionalEquipment>('/AdditionalEquipments', equipment);
    return response.data;
  },

  // Update equipment
  updateAdditionalEquipment: async (
    id: number,
    equipment: Partial<AdditionalEquipmentRequest>
  ): Promise<AdditionalEquipment> => {
    const response = await api.put<AdditionalEquipment>(`/AdditionalEquipments?id=${id}`, equipment);
    return response.data;
  },

  // Delete equipment
  deleteAdditionalEquipment: async (id: number): Promise<void> => {
    await api.delete(`/AdditionalEquipments/${id}`);
  },
};

export default equipmentService;
