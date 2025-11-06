# Inventory Management API - Complete Schema Documentation

## API Endpoints

### 1. GET /api/Inventory/GetInventoryItems
**Description:** Retrieve inventory items with filtering and pagination (Auth Required)

**Query Parameters:**
- `VIN` (string, optional) - Vehicle Identification Number
- `SerialNumber` (string, optional) - Serial number of the inventory item
- `VehicleVersionId` (integer, optional) - ID of the vehicle version
- `VehicleColorId` (integer, optional) - ID of the vehicle color
- `Location` (string, optional) - Current location
- `Status` (InventoryStatus, optional) - Current status (enum)
- `MinMileage` (integer, optional) - Minimum mileage filter
- `MaxMileage` (integer, optional) - Maximum mileage filter
- `ModelYear` (integer, optional) - Model year of the vehicle
- `EntryDateFrom` (string, date-time, optional) - Entry date range start
- `EntryDateTo` (string, date-time, optional) - Entry date range end
- `SupplierName` (string, optional) - Name of the supplier
- `HasExited` (boolean, optional) - Whether the item has exited inventory
- `PageSize` (integer, optional) - Number of items per page
- `PageNumber` (integer, optional) - Page number for pagination

**Response:** 200 OK

---

### 2. GET /api/Inventory/GetById
**Description:** Get a specific inventory item by ID (Auth Required)

**Query Parameters:**
- `id` (integer, required) - Inventory item ID

**Response:** 200 OK

---

### 3. GET /api/Inventory/GetByVIN
**Description:** Get a specific inventory item by VIN (Auth Required)

**Query Parameters:**
- `vin` (string, required) - Vehicle Identification Number

**Response:** 200 OK

---

### 4. POST /api/Inventory/CreateInventoryItem
**Description:** Create a new inventory item (Auth Required)

**Request Body:** `InventoryItemRequest` (JSON)

**Response:** 200 OK

---

### 5. PUT /api/Inventory/UpdateInventoryItem
**Description:** Update an existing inventory item (Auth Required)

**Request Body:** `InventoryItemUpdateRequest` (JSON)

**Response:** 200 OK

---

### 6. DELETE /api/Inventory/DeleteInventoryItem
**Description:** Delete an inventory item (Auth Required)

**Query Parameters:**
- `id` (integer, required) - Inventory item ID to delete

**Response:** 200 OK

---

### 7. POST /api/Inventory/AddImages
**Description:** Add images to an inventory item (Auth Required)

**Query Parameters:**
- `inventoryItemId` (integer, required) - Inventory item ID

**Request Body:** multipart/form-data
- `images` (array of binary files) - Image files to upload
- `imageType` (string) - Type/category of images

**Response:** 200 OK

---

### 8. DELETE /api/Inventory/DeleteImage
**Description:** Delete an image from inventory (Auth Required)

**Query Parameters:**
- `imageId` (integer, required) - Image ID to delete

**Response:** 200 OK

---

### 9. GET /api/Inventory/GetMovements
**Description:** Get inventory movements with filtering and pagination (Auth Required)

**Query Parameters:**
- `InventoryItemId` (integer, optional) - Filter by inventory item ID
- `MovementType` (MovementType, optional) - Type of movement (enum)
- `MovementDateFrom` (string, date-time, optional) - Movement date range start
- `MovementDateTo` (string, date-time, optional) - Movement date range end
- `Location` (string, optional) - Filter by location
- `PerformedBy` (string, optional) - Filter by who performed the movement
- `PageSize` (integer, optional) - Number of items per page
- `PageNumber` (integer, optional) - Page number for pagination

**Response:** 200 OK

---

### 10. GET /api/Inventory/GetMovementsByItem
**Description:** Get all movements for a specific inventory item (Auth Required)

**Query Parameters:**
- `inventoryItemId` (integer, required) - Inventory item ID

**Response:** 200 OK

---

### 11. POST /api/Inventory/CreateMovement
**Description:** Create a new inventory movement record (Auth Required)

**Request Body:** `InventoryMovementRequest` (JSON)

**Response:** 200 OK

---

### 12. POST /api/Inventory/ChangeLocation
**Description:** Change the location of an inventory item (Auth Required)

**Request Body:** `ChangeLocationRequest` (JSON)

**Response:** 200 OK

---

### 13. POST /api/Inventory/ChangeStatus
**Description:** Change the status of an inventory item (Auth Required)

**Request Body:** `ChangeStatusRequest` (JSON)

**Response:** 200 OK

---

### 14. POST /api/Inventory/UpdateMileage
**Description:** Update the mileage of an inventory item (Auth Required)

**Request Body:** `UpdateMileageRequest` (JSON)

**Response:** 200 OK

---

## Schema Definitions

### InventoryItemRequest
**Type:** object

**Properties:**
- `vin` (string, nullable) - Vehicle Identification Number
- `serialNumber` (string, nullable) - Serial number of the item
- `vehicleVersionId` (integer, int32, required) - ID of the vehicle version
- `vehicleColorId` (integer, int32, required) - ID of the vehicle color
- `location` (string, nullable) - Current location
- `status` (InventoryStatus, required) - Current status (enum)
- `mileage` (integer, int32, nullable) - Current mileage
- `modelYear` (integer, int32, required) - Model year
- `entryDate` (string, date-time, nullable) - Date of entry into inventory
- `entryNotes` (string, nullable) - Notes about the entry
- `purchasePrice` (number, double, nullable) - Purchase price
- `purchaseCurrency` (Currency, nullable) - Currency of purchase (enum)
- `supplierName` (string, nullable) - Name of the supplier
- `exitDate` (string, date-time, nullable) - Date of exit from inventory
- `exitNotes` (string, nullable) - Notes about the exit

**Additional Properties:** false

---

### InventoryItemUpdateRequest
**Type:** object

**Properties:**
- `inventoryItemId` (integer, int32, required) - ID of the inventory item to update
- `vin` (string, nullable) - Vehicle Identification Number
- `serialNumber` (string, nullable) - Serial number of the item
- `vehicleVersionId` (integer, int32, nullable) - ID of the vehicle version
- `vehicleColorId` (integer, int32, nullable) - ID of the vehicle color
- `location` (string, nullable) - Current location
- `status` (InventoryStatus, nullable) - Current status (enum)
- `mileage` (integer, int32, nullable) - Current mileage
- `modelYear` (integer, int32, nullable) - Model year
- `entryDate` (string, date-time, nullable) - Date of entry into inventory
- `entryNotes` (string, nullable) - Notes about the entry
- `purchasePrice` (number, double, nullable) - Purchase price
- `purchaseCurrency` (Currency, nullable) - Currency of purchase (enum)
- `supplierName` (string, nullable) - Name of the supplier
- `exitDate` (string, date-time, nullable) - Date of exit from inventory
- `exitNotes` (string, nullable) - Notes about the exit

**Additional Properties:** false

---

### InventoryMovementRequest
**Type:** object

**Properties:**
- `inventoryItemId` (integer, int32, required) - ID of the inventory item
- `movementType` (MovementType, required) - Type of movement (enum)
- `movementDate` (string, date-time, nullable) - Date and time of the movement
- `fromLocation` (string, nullable) - Source location
- `toLocation` (string, nullable) - Destination location
- `reason` (string, nullable) - Reason for the movement
- `notes` (string, nullable) - Additional notes
- `documentReference` (string, nullable) - Reference to related documents
- `performedBy` (string, nullable) - User who performed the movement
- `previousMileage` (integer, int32, nullable) - Mileage before movement
- `newMileage` (integer, int32, nullable) - Mileage after movement

**Additional Properties:** false

---

### ChangeLocationRequest
**Type:** object

**Properties:**
- `inventoryItemId` (integer, int32, required) - ID of the inventory item
- `newLocation` (string, nullable) - New location for the item
- `reason` (string, nullable) - Reason for location change
- `performedBy` (string, nullable) - User who performed the change

**Additional Properties:** false

---

### ChangeStatusRequest
**Type:** object

**Properties:**
- `inventoryItemId` (integer, int32, required) - ID of the inventory item
- `newStatus` (string, nullable) - New status for the item
- `reason` (string, nullable) - Reason for status change
- `performedBy` (string, nullable) - User who performed the change

**Additional Properties:** false

---

### UpdateMileageRequest
**Type:** object

**Properties:**
- `inventoryItemId` (integer, int32, required) - ID of the inventory item
- `newMileage` (integer, int32, required) - New mileage value
- `notes` (string, nullable) - Notes about the mileage update
- `performedBy` (string, nullable) - User who performed the update

**Additional Properties:** false

---

## Enums

### InventoryStatus
**Type:** string

**Values:**
- `Available` - Item is available for sale/use
- `Reserved` - Item is reserved
- `InTransit` - Item is being transported
- `InMaintenance` - Item is under maintenance
- `Sold` - Item has been sold
- `Damaged` - Item is damaged
- `OnHold` - Item is on hold
- `Delivered` - Item has been delivered

---

### MovementType
**Type:** string

**Values:**
- `Entry` - Item entering inventory
- `Exit` - Item leaving inventory
- `Transfer` - Item being transferred between locations
- `StatusChange` - Change in item status
- `MaintenanceIn` - Item going into maintenance
- `MaintenanceOut` - Item coming out of maintenance
- `Adjustment` - Inventory adjustment/correction

---

### Currency
**Type:** string

**Values:**
- `MXN` - Mexican Peso
- `USD` - US Dollar
- `CNY` - Chinese Yuan
- `JPY` - Japanese Yen
- `EUR` - Euro
- `CAD` - Canadian Dollar
- `RUB` - Russian Ruble

---

## Notes

### Missing Schemas
The following schemas were requested but were not found in the Swagger specification:
- `InventoryItemDto` - Not defined in the API specification
- `InventoryMovementDto` - Not defined in the API specification
- `InventoryItemImageDto` - Not defined in the API specification

These DTOs are likely used internally for responses but are not explicitly defined in the OpenAPI schema. The actual response structures may need to be inferred from API testing or backend code inspection.

### Response Schemas
Most endpoints return a generic "200 OK" response without detailed schema definitions in the Swagger specification. This means the actual response structure for GET endpoints is not formally documented in the OpenAPI spec.

### Authentication
All endpoints require authentication as indicated by the " (Auth)" suffix in their summaries.
