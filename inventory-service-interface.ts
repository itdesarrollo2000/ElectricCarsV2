// Auto-generated TypeScript service interface from Swagger API specification
// API: https://movilidadelectrico.azurewebsites.net/swagger/v1/swagger.json

import {
  InventoryItemRequest,
  InventoryItemUpdateRequest,
  InventoryMovementRequest,
  ChangeLocationRequest,
  ChangeStatusRequest,
  UpdateMileageRequest,
  GetInventoryItemsParams,
  GetMovementsParams,
  InventoryItemDto,
  InventoryMovementDto,
  InventoryItemImageDto,
  PaginatedResponse
} from './inventory-types';

/**
 * Inventory Management Service Interface
 * All methods require authentication
 */
export interface IInventoryService {
  // ==================== INVENTORY ITEM OPERATIONS ====================

  /**
   * Get inventory items with filtering and pagination
   * @param params Query parameters for filtering
   * @returns Promise with paginated inventory items
   */
  getInventoryItems(params?: GetInventoryItemsParams): Promise<PaginatedResponse<InventoryItemDto>>;

  /**
   * Get a specific inventory item by ID
   * @param id Inventory item ID
   * @returns Promise with inventory item details
   */
  getById(id: number): Promise<InventoryItemDto>;

  /**
   * Get a specific inventory item by VIN
   * @param vin Vehicle Identification Number
   * @returns Promise with inventory item details
   */
  getByVIN(vin: string): Promise<InventoryItemDto>;

  /**
   * Create a new inventory item
   * @param request Inventory item creation request
   * @returns Promise with created inventory item
   */
  createInventoryItem(request: InventoryItemRequest): Promise<InventoryItemDto>;

  /**
   * Update an existing inventory item
   * @param request Inventory item update request
   * @returns Promise with updated inventory item
   */
  updateInventoryItem(request: InventoryItemUpdateRequest): Promise<InventoryItemDto>;

  /**
   * Delete an inventory item
   * @param id Inventory item ID to delete
   * @returns Promise with success status
   */
  deleteInventoryItem(id: number): Promise<void>;

  // ==================== IMAGE OPERATIONS ====================

  /**
   * Add images to an inventory item
   * @param inventoryItemId Inventory item ID
   * @param images Array of image files
   * @param imageType Type/category of images
   * @returns Promise with uploaded image details
   */
  addImages(
    inventoryItemId: number,
    images: File[],
    imageType?: string
  ): Promise<InventoryItemImageDto[]>;

  /**
   * Delete an image from inventory
   * @param imageId Image ID to delete
   * @returns Promise with success status
   */
  deleteImage(imageId: number): Promise<void>;

  // ==================== MOVEMENT OPERATIONS ====================

  /**
   * Get inventory movements with filtering and pagination
   * @param params Query parameters for filtering
   * @returns Promise with paginated inventory movements
   */
  getMovements(params?: GetMovementsParams): Promise<PaginatedResponse<InventoryMovementDto>>;

  /**
   * Get all movements for a specific inventory item
   * @param inventoryItemId Inventory item ID
   * @returns Promise with list of movements
   */
  getMovementsByItem(inventoryItemId: number): Promise<InventoryMovementDto[]>;

  /**
   * Create a new inventory movement record
   * @param request Inventory movement request
   * @returns Promise with created movement
   */
  createMovement(request: InventoryMovementRequest): Promise<InventoryMovementDto>;

  // ==================== QUICK ACTION OPERATIONS ====================

  /**
   * Change the location of an inventory item
   * @param request Location change request
   * @returns Promise with success status
   */
  changeLocation(request: ChangeLocationRequest): Promise<void>;

  /**
   * Change the status of an inventory item
   * @param request Status change request
   * @returns Promise with success status
   */
  changeStatus(request: ChangeStatusRequest): Promise<void>;

  /**
   * Update the mileage of an inventory item
   * @param request Mileage update request
   * @returns Promise with success status
   */
  updateMileage(request: UpdateMileageRequest): Promise<void>;
}

/**
 * Base API configuration interface
 */
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: string[];
}
