// Auto-generated TypeScript types from Swagger API specification
// API: https://movilidadelectrico.azurewebsites.net/swagger/v1/swagger.json

// ==================== ENUMS ====================

/**
 * Inventory status enum
 */
export enum InventoryStatus {
  Available = 'Available',
  Reserved = 'Reserved',
  InTransit = 'InTransit',
  InMaintenance = 'InMaintenance',
  Sold = 'Sold',
  Damaged = 'Damaged',
  OnHold = 'OnHold',
  Delivered = 'Delivered'
}

/**
 * Movement type enum
 */
export enum MovementType {
  Entry = 'Entry',
  Exit = 'Exit',
  Transfer = 'Transfer',
  StatusChange = 'StatusChange',
  MaintenanceIn = 'MaintenanceIn',
  MaintenanceOut = 'MaintenanceOut',
  Adjustment = 'Adjustment'
}

/**
 * Currency enum
 */
export enum Currency {
  MXN = 'MXN',
  USD = 'USD',
  CNY = 'CNY',
  JPY = 'JPY',
  EUR = 'EUR',
  CAD = 'CAD',
  RUB = 'RUB'
}

// ==================== REQUEST TYPES ====================

/**
 * Request type for creating a new inventory item
 */
export interface InventoryItemRequest {
  vin?: string | null;
  serialNumber?: string | null;
  vehicleVersionId: number;
  vehicleColorId: number;
  location?: string | null;
  status: InventoryStatus;
  mileage?: number | null;
  modelYear: number;
  entryDate?: string | null; // ISO 8601 date-time format
  entryNotes?: string | null;
  purchasePrice?: number | null;
  purchaseCurrency?: Currency | null;
  supplierName?: string | null;
  exitDate?: string | null; // ISO 8601 date-time format
  exitNotes?: string | null;
}

/**
 * Request type for updating an existing inventory item
 */
export interface InventoryItemUpdateRequest {
  inventoryItemId: number;
  vin?: string | null;
  serialNumber?: string | null;
  vehicleVersionId?: number | null;
  vehicleColorId?: number | null;
  location?: string | null;
  status?: InventoryStatus | null;
  mileage?: number | null;
  modelYear?: number | null;
  entryDate?: string | null; // ISO 8601 date-time format
  entryNotes?: string | null;
  purchasePrice?: number | null;
  purchaseCurrency?: Currency | null;
  supplierName?: string | null;
  exitDate?: string | null; // ISO 8601 date-time format
  exitNotes?: string | null;
}

/**
 * Request type for creating an inventory movement
 */
export interface InventoryMovementRequest {
  inventoryItemId: number;
  movementType: MovementType;
  movementDate?: string | null; // ISO 8601 date-time format
  fromLocation?: string | null;
  toLocation?: string | null;
  reason?: string | null;
  notes?: string | null;
  documentReference?: string | null;
  performedBy?: string | null;
  previousMileage?: number | null;
  newMileage?: number | null;
}

/**
 * Request type for changing inventory item location
 */
export interface ChangeLocationRequest {
  inventoryItemId: number;
  newLocation?: string | null;
  reason?: string | null;
  performedBy?: string | null;
}

/**
 * Request type for changing inventory item status
 */
export interface ChangeStatusRequest {
  inventoryItemId: number;
  newStatus?: string | null;
  reason?: string | null;
  performedBy?: string | null;
}

/**
 * Request type for updating inventory item mileage
 */
export interface UpdateMileageRequest {
  inventoryItemId: number;
  newMileage: number;
  notes?: string | null;
  performedBy?: string | null;
}

// ==================== QUERY PARAMETER TYPES ====================

/**
 * Query parameters for GetInventoryItems endpoint
 */
export interface GetInventoryItemsParams {
  VIN?: string;
  SerialNumber?: string;
  VehicleVersionId?: number;
  VehicleColorId?: number;
  Location?: string;
  Status?: InventoryStatus;
  MinMileage?: number;
  MaxMileage?: number;
  ModelYear?: number;
  EntryDateFrom?: string; // ISO 8601 date-time format
  EntryDateTo?: string; // ISO 8601 date-time format
  SupplierName?: string;
  HasExited?: boolean;
  PageSize?: number;
  PageNumber?: number;
}

/**
 * Query parameters for GetMovements endpoint
 */
export interface GetMovementsParams {
  InventoryItemId?: number;
  MovementType?: MovementType;
  MovementDateFrom?: string; // ISO 8601 date-time format
  MovementDateTo?: string; // ISO 8601 date-time format
  Location?: string;
  PerformedBy?: string;
  PageSize?: number;
  PageNumber?: number;
}

// ==================== RESPONSE TYPES (INFERRED) ====================

/**
 * Inferred DTO for inventory item responses
 * Note: This schema is not defined in the Swagger spec, but inferred from request types
 */
export interface InventoryItemDto {
  inventoryItemId: number;
  vin?: string | null;
  serialNumber?: string | null;
  vehicleVersionId: number;
  vehicleColorId: number;
  location?: string | null;
  status: InventoryStatus;
  mileage?: number | null;
  modelYear: number;
  entryDate?: string | null;
  entryNotes?: string | null;
  purchasePrice?: number | null;
  purchaseCurrency?: Currency | null;
  supplierName?: string | null;
  exitDate?: string | null;
  exitNotes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/**
 * Inferred DTO for inventory movement responses
 * Note: This schema is not defined in the Swagger spec, but inferred from request types
 */
export interface InventoryMovementDto {
  movementId: number;
  inventoryItemId: number;
  movementType: MovementType;
  movementDate: string;
  fromLocation?: string | null;
  toLocation?: string | null;
  reason?: string | null;
  notes?: string | null;
  documentReference?: string | null;
  performedBy?: string | null;
  previousMileage?: number | null;
  newMileage?: number | null;
  createdAt?: string | null;
}

/**
 * Inferred DTO for inventory item images
 * Note: This schema is not defined in the Swagger spec
 */
export interface InventoryItemImageDto {
  imageId: number;
  inventoryItemId: number;
  imageUrl: string;
  imageType?: string | null;
  uploadedAt?: string | null;
  uploadedBy?: string | null;
}

/**
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
