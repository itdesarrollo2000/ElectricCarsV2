# Inventory API Schema Extraction Summary

## Overview
This document contains the complete extraction of inventory management schemas and endpoints from the API specification at: `https://movilidadelectrico.azurewebsites.net/swagger/v1/swagger.json`

**Extraction Date:** 2025-10-29

---

## Files Generated

1. **INVENTORY_API_SCHEMA.md** - Complete documentation of all endpoints and schemas
2. **inventory-types.ts** - TypeScript type definitions for all schemas
3. **inventory-service-interface.ts** - TypeScript service interface
4. **inventory-schemas.json** - Raw extracted JSON schemas

---

## Endpoints Extracted (14 Total)

### Read Operations (5)
1. `GET /api/Inventory/GetInventoryItems` - List with filters & pagination
2. `GET /api/Inventory/GetById` - Get by ID
3. `GET /api/Inventory/GetByVIN` - Get by VIN
4. `GET /api/Inventory/GetMovements` - List movements with filters
5. `GET /api/Inventory/GetMovementsByItem` - Get movements for specific item

### Create Operations (2)
6. `POST /api/Inventory/CreateInventoryItem` - Create new item
7. `POST /api/Inventory/CreateMovement` - Create movement record

### Update Operations (4)
8. `PUT /api/Inventory/UpdateInventoryItem` - Update item
9. `POST /api/Inventory/ChangeLocation` - Change location
10. `POST /api/Inventory/ChangeStatus` - Change status
11. `POST /api/Inventory/UpdateMileage` - Update mileage

### Delete Operations (2)
12. `DELETE /api/Inventory/DeleteInventoryItem` - Delete item
13. `DELETE /api/Inventory/DeleteImage` - Delete image

### Image Operations (1)
14. `POST /api/Inventory/AddImages` - Upload images

---

## Schemas Extracted

### Request Schemas (6)
✅ **InventoryItemRequest** - Complete
- 14 properties including vin, serialNumber, vehicleVersionId, vehicleColorId, location, status, mileage, modelYear, entryDate, entryNotes, purchasePrice, purchaseCurrency, supplierName, exitDate, exitNotes

✅ **InventoryItemUpdateRequest** - Complete
- 15 properties (includes inventoryItemId + all properties from Request, mostly nullable)

✅ **InventoryMovementRequest** - Complete
- 10 properties including inventoryItemId, movementType, movementDate, fromLocation, toLocation, reason, notes, documentReference, performedBy, previousMileage, newMileage

✅ **ChangeLocationRequest** - Complete
- 4 properties: inventoryItemId, newLocation, reason, performedBy

✅ **ChangeStatusRequest** - Complete
- 4 properties: inventoryItemId, newStatus, reason, performedBy

✅ **UpdateMileageRequest** - Complete
- 4 properties: inventoryItemId, newMileage, notes, performedBy

### Enum Schemas (3)
✅ **InventoryStatus** - Complete
- 8 values: Available, Reserved, InTransit, InMaintenance, Sold, Damaged, OnHold, Delivered

✅ **MovementType** - Complete
- 7 values: Entry, Exit, Transfer, StatusChange, MaintenanceIn, MaintenanceOut, Adjustment

✅ **Currency** - Complete (Related enum)
- 7 values: MXN, USD, CNY, JPY, EUR, CAD, RUB

### Response/DTO Schemas (Status)
❌ **InventoryItemDto** - NOT FOUND in Swagger spec
- Status: Not explicitly defined in OpenAPI specification
- Action: Inferred from request schema in generated TypeScript types

❌ **InventoryMovementDto** - NOT FOUND in Swagger spec
- Status: Not explicitly defined in OpenAPI specification
- Action: Inferred from request schema in generated TypeScript types

❌ **InventoryItemImageDto** - NOT FOUND in Swagger spec
- Status: Not explicitly defined in OpenAPI specification
- Action: Inferred structure created in TypeScript types

---

## Schema Property Details

### InventoryItemRequest Properties
| Property | Type | Format | Required | Nullable | Description |
|----------|------|--------|----------|----------|-------------|
| vin | string | - | No | Yes | Vehicle Identification Number |
| serialNumber | string | - | No | Yes | Serial number |
| vehicleVersionId | integer | int32 | Yes | No | Vehicle version ID |
| vehicleColorId | integer | int32 | Yes | No | Vehicle color ID |
| location | string | - | No | Yes | Current location |
| status | InventoryStatus | enum | Yes | No | Current status |
| mileage | integer | int32 | No | Yes | Current mileage |
| modelYear | integer | int32 | Yes | No | Model year |
| entryDate | string | date-time | No | Yes | Entry date |
| entryNotes | string | - | No | Yes | Entry notes |
| purchasePrice | number | double | No | Yes | Purchase price |
| purchaseCurrency | Currency | enum | No | Yes | Currency |
| supplierName | string | - | No | Yes | Supplier name |
| exitDate | string | date-time | No | Yes | Exit date |
| exitNotes | string | - | No | Yes | Exit notes |

### InventoryItemUpdateRequest Properties
| Property | Type | Format | Required | Nullable | Description |
|----------|------|--------|----------|----------|-------------|
| inventoryItemId | integer | int32 | Yes | No | Item ID to update |
| vin | string | - | No | Yes | Vehicle Identification Number |
| serialNumber | string | - | No | Yes | Serial number |
| vehicleVersionId | integer | int32 | No | Yes | Vehicle version ID |
| vehicleColorId | integer | int32 | No | Yes | Vehicle color ID |
| location | string | - | No | Yes | Current location |
| status | InventoryStatus | enum | No | Yes | Current status |
| mileage | integer | int32 | No | Yes | Current mileage |
| modelYear | integer | int32 | No | Yes | Model year |
| entryDate | string | date-time | No | Yes | Entry date |
| entryNotes | string | - | No | Yes | Entry notes |
| purchasePrice | number | double | No | Yes | Purchase price |
| purchaseCurrency | Currency | enum | No | Yes | Currency |
| supplierName | string | - | No | Yes | Supplier name |
| exitDate | string | date-time | No | Yes | Exit date |
| exitNotes | string | - | No | Yes | Exit notes |

### InventoryMovementRequest Properties
| Property | Type | Format | Required | Nullable | Description |
|----------|------|--------|----------|----------|-------------|
| inventoryItemId | integer | int32 | Yes | No | Inventory item ID |
| movementType | MovementType | enum | Yes | No | Type of movement |
| movementDate | string | date-time | No | Yes | Movement date/time |
| fromLocation | string | - | No | Yes | Source location |
| toLocation | string | - | No | Yes | Destination location |
| reason | string | - | No | Yes | Reason for movement |
| notes | string | - | No | Yes | Additional notes |
| documentReference | string | - | No | Yes | Document reference |
| performedBy | string | - | No | Yes | User who performed |
| previousMileage | integer | int32 | No | Yes | Mileage before |
| newMileage | integer | int32 | No | Yes | Mileage after |

### ChangeLocationRequest Properties
| Property | Type | Format | Required | Nullable |
|----------|------|--------|----------|----------|
| inventoryItemId | integer | int32 | Yes | No |
| newLocation | string | - | No | Yes |
| reason | string | - | No | Yes |
| performedBy | string | - | No | Yes |

### ChangeStatusRequest Properties
| Property | Type | Format | Required | Nullable |
|----------|------|--------|----------|----------|
| inventoryItemId | integer | int32 | Yes | No |
| newStatus | string | - | No | Yes |
| reason | string | - | No | Yes |
| performedBy | string | - | No | Yes |

### UpdateMileageRequest Properties
| Property | Type | Format | Required | Nullable |
|----------|------|--------|----------|----------|
| inventoryItemId | integer | int32 | Yes | No |
| newMileage | integer | int32 | Yes | No |
| notes | string | - | No | Yes |
| performedBy | string | - | No | Yes |

---

## Enum Values

### InventoryStatus
```typescript
enum InventoryStatus {
  Available = 'Available',
  Reserved = 'Reserved',
  InTransit = 'InTransit',
  InMaintenance = 'InMaintenance',
  Sold = 'Sold',
  Damaged = 'Damaged',
  OnHold = 'OnHold',
  Delivered = 'Delivered'
}
```

### MovementType
```typescript
enum MovementType {
  Entry = 'Entry',
  Exit = 'Exit',
  Transfer = 'Transfer',
  StatusChange = 'StatusChange',
  MaintenanceIn = 'MaintenanceIn',
  MaintenanceOut = 'MaintenanceOut',
  Adjustment = 'Adjustment'
}
```

### Currency
```typescript
enum Currency {
  MXN = 'MXN',
  USD = 'USD',
  CNY = 'CNY',
  JPY = 'JPY',
  EUR = 'EUR',
  CAD = 'CAD',
  RUB = 'RUB'
}
```

---

## Important Notes

### 1. Missing DTO Definitions
The Swagger specification does not include explicit response DTO schemas for:
- `InventoryItemDto`
- `InventoryMovementDto`
- `InventoryItemImageDto`

**Reason:** The OpenAPI spec defines all endpoints with generic "200 OK" responses without detailed schema definitions. This is common in Swagger documentation that focuses on request validation rather than response documentation.

**Solution:** Inferred TypeScript types have been created based on:
- Request schema properties
- Common REST API patterns
- Expected response fields (IDs, timestamps, etc.)

### 2. Response Structure Inference
The generated TypeScript types assume:
- Response DTOs contain all request properties
- Additional fields like IDs, timestamps are present
- Paginated endpoints return a `PaginatedResponse<T>` wrapper

### 3. Authentication
All endpoints require authentication as indicated by the "(Auth)" marker in endpoint summaries.

### 4. Pagination
Endpoints support pagination through query parameters:
- `PageSize` - Number of items per page
- `PageNumber` - Page number (likely 1-indexed)

### 5. Date-Time Format
All date-time fields use ISO 8601 format (e.g., "2025-10-29T10:30:00Z")

---

## Usage Recommendations

### For TypeScript Projects
1. Use the generated type definitions from `inventory-types.ts`
2. Implement the service interface from `inventory-service-interface.ts`
3. All types are strongly typed with proper nullability annotations

### For API Integration
1. Reference `INVENTORY_API_SCHEMA.md` for endpoint details
2. All endpoints require authentication headers
3. Use proper error handling for 200 responses (may still contain errors)

### For Testing
1. Use the enum values exactly as defined (case-sensitive)
2. Required fields must be provided in requests
3. Nullable fields can be omitted or set to null

---

## Data Quality & Validation

### Required Fields (InventoryItemRequest)
- `vehicleVersionId` (integer)
- `vehicleColorId` (integer)
- `status` (InventoryStatus enum)
- `modelYear` (integer)

### Required Fields (InventoryItemUpdateRequest)
- `inventoryItemId` (integer)
- All other fields optional for partial updates

### Required Fields (InventoryMovementRequest)
- `inventoryItemId` (integer)
- `movementType` (MovementType enum)

---

## Completion Status

✅ **Completed:**
- All 14 inventory endpoints extracted
- 6 request schemas fully documented
- 3 enum definitions complete
- TypeScript types generated
- Service interface created
- Comprehensive documentation written

⚠️ **Limitations:**
- Response DTO schemas not in original spec (inferred)
- Response structure assumptions based on best practices
- Some endpoints lack detailed error response documentation

---

## Files Location

All generated files are located in: `C:\Proyectos\ElectricCarsV2\`

- `INVENTORY_API_SCHEMA.md` - Human-readable documentation
- `inventory-types.ts` - TypeScript type definitions
- `inventory-service-interface.ts` - Service interface
- `inventory-schemas.json` - Raw JSON extraction
- `INVENTORY_EXTRACTION_SUMMARY.md` - This file
