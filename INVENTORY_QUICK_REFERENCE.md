# Inventory API - Quick Reference Guide

## Generated Files

| File | Purpose | Format |
|------|---------|--------|
| `INVENTORY_API_SCHEMA.md` | Complete API documentation | Markdown |
| `INVENTORY_EXTRACTION_SUMMARY.md` | Detailed extraction report | Markdown |
| `INVENTORY_QUICK_REFERENCE.md` | This file - Quick reference | Markdown |
| `inventory-types.ts` | TypeScript type definitions | TypeScript |
| `inventory-service-interface.ts` | TypeScript service interface | TypeScript |
| `inventory-schemas.json` | Raw extracted schemas | JSON |
| `inventory-api-complete.json` | Structured API specification | JSON |

---

## Quick Access

### Enums

**InventoryStatus:**
`Available`, `Reserved`, `InTransit`, `InMaintenance`, `Sold`, `Damaged`, `OnHold`, `Delivered`

**MovementType:**
`Entry`, `Exit`, `Transfer`, `StatusChange`, `MaintenanceIn`, `MaintenanceOut`, `Adjustment`

**Currency:**
`MXN`, `USD`, `CNY`, `JPY`, `EUR`, `CAD`, `RUB`

---

## Common Endpoints

### Read Operations
```
GET  /api/Inventory/GetInventoryItems      # List with filters
GET  /api/Inventory/GetById?id={id}        # Get by ID
GET  /api/Inventory/GetByVIN?vin={vin}     # Get by VIN
```

### Create/Update
```
POST /api/Inventory/CreateInventoryItem    # Create new
PUT  /api/Inventory/UpdateInventoryItem    # Update existing
```

### Quick Actions
```
POST /api/Inventory/ChangeLocation         # Change location
POST /api/Inventory/ChangeStatus           # Change status
POST /api/Inventory/UpdateMileage          # Update mileage
```

### Movements
```
GET  /api/Inventory/GetMovements           # List movements
GET  /api/Inventory/GetMovementsByItem     # Get by item
POST /api/Inventory/CreateMovement         # Create movement
```

### Images
```
POST   /api/Inventory/AddImages            # Upload images
DELETE /api/Inventory/DeleteImage          # Delete image
```

---

## Request Examples

### Create Inventory Item
```json
{
  "vehicleVersionId": 1,
  "vehicleColorId": 2,
  "status": "Available",
  "modelYear": 2024,
  "vin": "1HGBH41JXMN109186",
  "location": "Warehouse A",
  "mileage": 0
}
```

### Update Inventory Item
```json
{
  "inventoryItemId": 123,
  "status": "Sold",
  "mileage": 100
}
```

### Create Movement
```json
{
  "inventoryItemId": 123,
  "movementType": "Transfer",
  "fromLocation": "Warehouse A",
  "toLocation": "Showroom B",
  "reason": "Customer requested viewing"
}
```

### Change Location
```json
{
  "inventoryItemId": 123,
  "newLocation": "Service Center",
  "reason": "Maintenance required",
  "performedBy": "John Doe"
}
```

### Change Status
```json
{
  "inventoryItemId": 123,
  "newStatus": "InMaintenance",
  "reason": "Scheduled service",
  "performedBy": "Jane Smith"
}
```

### Update Mileage
```json
{
  "inventoryItemId": 123,
  "newMileage": 1500,
  "notes": "After test drive",
  "performedBy": "John Doe"
}
```

---

## Filter Examples

### Get Inventory Items with Filters
```
GET /api/Inventory/GetInventoryItems?
  Status=Available&
  Location=Warehouse A&
  MinMileage=0&
  MaxMileage=100&
  ModelYear=2024&
  PageSize=20&
  PageNumber=1
```

### Get Movements with Filters
```
GET /api/Inventory/GetMovements?
  InventoryItemId=123&
  MovementType=Transfer&
  MovementDateFrom=2024-01-01T00:00:00Z&
  MovementDateTo=2024-12-31T23:59:59Z&
  PageSize=50&
  PageNumber=1
```

---

## Required Fields Reference

### InventoryItemRequest
- `vehicleVersionId` (integer) ✓ Required
- `vehicleColorId` (integer) ✓ Required
- `status` (InventoryStatus) ✓ Required
- `modelYear` (integer) ✓ Required

### InventoryItemUpdateRequest
- `inventoryItemId` (integer) ✓ Required
- All other fields optional

### InventoryMovementRequest
- `inventoryItemId` (integer) ✓ Required
- `movementType` (MovementType) ✓ Required

### ChangeLocationRequest
- `inventoryItemId` (integer) ✓ Required

### ChangeStatusRequest
- `inventoryItemId` (integer) ✓ Required

### UpdateMileageRequest
- `inventoryItemId` (integer) ✓ Required
- `newMileage` (integer) ✓ Required

---

## TypeScript Usage

### Import Types
```typescript
import {
  InventoryItemRequest,
  InventoryItemDto,
  InventoryStatus,
  MovementType
} from './inventory-types';
```

### Type-Safe Request
```typescript
const createRequest: InventoryItemRequest = {
  vehicleVersionId: 1,
  vehicleColorId: 2,
  status: InventoryStatus.Available,
  modelYear: 2024,
  vin: "1HGBH41JXMN109186"
};
```

### Implement Service
```typescript
import { IInventoryService } from './inventory-service-interface';

class InventoryService implements IInventoryService {
  async getById(id: number): Promise<InventoryItemDto> {
    // Implementation
  }
  // ... other methods
}
```

---

## Important Notes

1. **Authentication:** All endpoints require authentication
2. **Date Format:** Use ISO 8601 format (e.g., `2024-10-29T10:30:00Z`)
3. **Nullable Fields:** Fields marked as nullable can be `null` or omitted
4. **Pagination:** Default page size should be specified if not provided
5. **Response DTOs:** Some response schemas are inferred (see documentation)

---

## Status Workflow Example

```
Available → Reserved → InTransit → Delivered
                    ↓
                OnHold → Available
                    ↓
          InMaintenance → Available
                    ↓
                 Damaged
                    ↓
                  Sold
```

---

## Movement Type Usage

- **Entry:** Vehicle enters inventory
- **Exit:** Vehicle leaves inventory permanently
- **Transfer:** Moving between locations
- **StatusChange:** Only status changes
- **MaintenanceIn:** Entering maintenance
- **MaintenanceOut:** Leaving maintenance
- **Adjustment:** Corrections or audits

---

## Error Handling Tips

1. Check required fields before sending requests
2. Validate enum values match exactly (case-sensitive)
3. Ensure dates are in ISO 8601 format
4. Handle 200 responses that may contain errors
5. Implement proper timeout handling
6. Log authentication failures separately

---

## Testing Checklist

- [ ] Test all CRUD operations
- [ ] Test pagination with various page sizes
- [ ] Test all status transitions
- [ ] Test all movement types
- [ ] Test image upload/delete
- [ ] Test filter combinations
- [ ] Test required field validations
- [ ] Test nullable field handling
- [ ] Test date range filters
- [ ] Test concurrent updates

---

## Support

For detailed information, refer to:
- `INVENTORY_API_SCHEMA.md` - Complete endpoint documentation
- `INVENTORY_EXTRACTION_SUMMARY.md` - Detailed schema information
- `inventory-types.ts` - TypeScript type definitions
- `inventory-service-interface.ts` - Service interface
