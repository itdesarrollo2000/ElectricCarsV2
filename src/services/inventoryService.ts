import api from './api';
import type {
  InventoryItem,
  InventoryItemRequest,
  InventoryItemUpdateRequest,
  InventoryMovement,
  InventoryMovementRequest,
  ChangeLocationRequest,
  ChangeStatusRequest,
  UpdateMileageRequest,
  InventoryItemImage,
  InventoryFilters,
  MovementFilters,
  PaginatedResponse,
} from '../types';

export const inventoryService = {
  // ==================== INVENTORY ITEMS ====================

  /**
   * Get paginated list of inventory items with optional filters
   */
  getInventoryItems: async (filters?: InventoryFilters): Promise<PaginatedResponse<InventoryItem>> => {
    const params = new URLSearchParams();

    if (filters?.VIN) params.append('VIN', filters.VIN);
    if (filters?.SerialNumber) params.append('SerialNumber', filters.SerialNumber);
    if (filters?.VehicleVersionId) params.append('VehicleVersionId', filters.VehicleVersionId.toString());
    if (filters?.VehicleColorId) params.append('VehicleColorId', filters.VehicleColorId.toString());
    if (filters?.Location) params.append('Location', filters.Location);
    if (filters?.Status) params.append('Status', filters.Status);
    if (filters?.MinMileage !== undefined) params.append('MinMileage', filters.MinMileage.toString());
    if (filters?.MaxMileage !== undefined) params.append('MaxMileage', filters.MaxMileage.toString());
    if (filters?.ModelYear) params.append('ModelYear', filters.ModelYear.toString());
    if (filters?.EntryDateFrom) params.append('EntryDateFrom', filters.EntryDateFrom);
    if (filters?.EntryDateTo) params.append('EntryDateTo', filters.EntryDateTo);
    if (filters?.SupplierName) params.append('SupplierName', filters.SupplierName);
    if (filters?.HasExited !== undefined) params.append('HasExited', filters.HasExited.toString());
    if (filters?.PageSize) params.append('PageSize', filters.PageSize.toString());
    if (filters?.PageNumber) params.append('PageNumber', filters.PageNumber.toString());

    const response = await api.get<PaginatedResponse<InventoryItem>>(
      `/Inventory/GetInventoryItems?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get a single inventory item by ID
   */
  getInventoryItemById: async (id: number): Promise<InventoryItem> => {
    const response = await api.get<any>(`/Inventory/GetById?id=${id}`);
    // El API devuelve {data: {...}, meta: null, success: true}
    return response.data.data || response.data;
  },

  /**
   * Get a single inventory item by VIN
   */
  getInventoryItemByVIN: async (vin: string): Promise<InventoryItem> => {
    const response = await api.get<InventoryItem>(`/Inventory/GetByVIN?vin=${encodeURIComponent(vin)}`);
    return response.data;
  },

  /**
   * Create a new inventory item
   */
  createInventoryItem: async (item: InventoryItemRequest): Promise<InventoryItem> => {
    const response = await api.post<InventoryItem>('/Inventory/CreateInventoryItem', item);
    return response.data;
  },

  /**
   * Update an existing inventory item
   */
  updateInventoryItem: async (item: InventoryItemUpdateRequest): Promise<InventoryItem> => {
    const response = await api.put<InventoryItem>('/Inventory/UpdateInventoryItem', item);
    return response.data;
  },

  /**
   * Delete an inventory item (soft delete)
   */
  deleteInventoryItem: async (id: number): Promise<void> => {
    await api.delete(`/Inventory/DeleteInventoryItem?id=${id}`);
  },

  // ==================== INVENTORY MOVEMENTS ====================

  /**
   * Get paginated list of inventory movements with optional filters
   */
  getMovements: async (filters?: MovementFilters): Promise<PaginatedResponse<InventoryMovement>> => {
    const params = new URLSearchParams();

    if (filters?.InventoryItemId) params.append('InventoryItemId', filters.InventoryItemId.toString());
    if (filters?.MovementType) params.append('MovementType', filters.MovementType);
    if (filters?.MovementDateFrom) params.append('MovementDateFrom', filters.MovementDateFrom);
    if (filters?.MovementDateTo) params.append('MovementDateTo', filters.MovementDateTo);
    if (filters?.Location) params.append('Location', filters.Location);
    if (filters?.PerformedBy) params.append('PerformedBy', filters.PerformedBy);
    if (filters?.PageSize) params.append('PageSize', filters.PageSize.toString());
    if (filters?.PageNumber) params.append('PageNumber', filters.PageNumber.toString());

    const response = await api.get<PaginatedResponse<InventoryMovement>>(
      `/Inventory/GetMovements?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get all movements for a specific inventory item
   */
  getMovementsByItem: async (inventoryItemId: number): Promise<InventoryMovement[]> => {
    const response = await api.get<InventoryMovement[]>(
      `/Inventory/GetMovementsByItem?inventoryItemId=${inventoryItemId}`
    );
    return response.data;
  },

  /**
   * Create a new movement record manually
   */
  createMovement: async (movement: InventoryMovementRequest): Promise<InventoryMovement> => {
    const response = await api.post<InventoryMovement>('/Inventory/CreateMovement', movement);
    return response.data;
  },

  // ==================== SPECIAL OPERATIONS ====================

  /**
   * Change the location of an inventory item (creates Transfer movement log)
   */
  changeLocation: async (request: ChangeLocationRequest): Promise<void> => {
    await api.post('/Inventory/ChangeLocation', request);
  },

  /**
   * Change the status of an inventory item (creates StatusChange movement log)
   */
  changeStatus: async (request: ChangeStatusRequest): Promise<void> => {
    await api.post('/Inventory/ChangeStatus', request);
  },

  /**
   * Update the mileage of an inventory item (creates movement log with mileage change)
   */
  updateMileage: async (request: UpdateMileageRequest): Promise<void> => {
    await api.post('/Inventory/UpdateMileage', request);
  },

  // ==================== IMAGE MANAGEMENT ====================

  /**
   * Add images to an inventory item
   */
  addImages: async (
    inventoryItemId: number,
    images: any[],
    imageType?: string
  ): Promise<InventoryItemImage[]> => {
    const formData = new FormData();

    images.forEach((uploadFile) => {
      const file = uploadFile.originFileObj || uploadFile;
      formData.append('images', file);
    });

    if (imageType) {
      formData.append('imageType', imageType);
    }

    const response = await api.post<InventoryItemImage[]>(
      `/Inventory/AddImages?inventoryItemId=${inventoryItemId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * Get images by inventory item ID
   */
  getImagesByItem: async (inventoryItemId: number): Promise<InventoryItemImage[]> => {
    const response = await api.get<InventoryItemImage[]>(
      `/Inventory/GetImages?inventoryItemId=${inventoryItemId}`
    );
    return response.data;
  },

  /**
   * Delete an image from an inventory item (soft delete)
   */
  deleteImage: async (imageId: number): Promise<void> => {
    await api.delete(`/Inventory/DeleteImage?imageId=${imageId}`);
  },
};

export default inventoryService;
