import api from "./api";
import type { VehicleColor, VehicleColorRequest } from "../types";

export const colorService = {
  // Get colors with filters
  getColors: async (filters?: any): Promise<VehicleColor[]> => {
    const params = new URLSearchParams();
    if (filters?.brandId) params.append("BrandId", filters.brandId.toString());
    if (filters?.colorCode) params.append("ColorCode", filters.colorCode);
    if (filters?.colorName) params.append("ColorName", filters.colorName);
    if (filters?.minYear) params.append("MinYear", filters.minYear.toString());

    const response = await api.get<VehicleColor[]>(
      `/VehicleColor/GetColors?${params}`
    );
    return response.data;
  },

  // Add new color
  addColor: async (color: VehicleColorRequest): Promise<VehicleColor> => {
    const response = await api.post<VehicleColor>(
      "/VehicleColor/AddColor",
      color
    );
    return response.data;
  },

  // Associate color to vehicle version
  associateColorToVehicle: async (
    versionId: number,
    colorId: number
  ): Promise<void> => {
    await api.post("/VehicleColor/AssociateColorToVehicle", {
      versionId,
      colorId,
    });
  },

  // Remove color association from vehicle version
  removeColorFromVehicle: async (
    versionId: number,
    colorId: number
  ): Promise<void> => {
    await api.delete(
      `/VehicleColor/RemoveColorFromVehicle?versionId=${versionId}&colorId=${colorId}`
    );
  },

  // Update color
  updateColor: async (
    id: number,
    color: Partial<VehicleColorRequest>
  ): Promise<VehicleColor> => {
    const response = await api.put<VehicleColor>("/VehicleColor/UpdateColor", {
      colorId: id,
      colorCode: color.colorCode,
      colorName: color.colorName,
      minYear: color.minYear,
      maxYear: color.maxYear,
      manufacturer: color.manufacturer,
      mainColorGroup: color.mainColorGroup,
      mainColorGroupHexCode: color.mainColorGroupHexCode,
      colorType: color.colorType,
    });
    return response.data;
  },

  // Delete color
  deleteColor: async (id: number): Promise<void> => {
    await api.delete(`/VehicleColor/DeleteColor?id=${id}`);
  },
};

export default colorService;
