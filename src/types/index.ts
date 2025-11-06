// API Response Types

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Authentication Types
export interface LoginRequest {
  userName: string; // Can be email or username
  password: string;
}

export interface LoginResponse {
  token?: string;
  tokenExpiration?: string;
  refreshToken?: string;
  data?: any;
  meta?: any;
  success: boolean;
  messages?: string[];
  errors?: string[] | { [key: string]: string }; // Can be array or object
  errorCode: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface TokenRequest {
  token: string;
  refreshToken: string;
}

export interface PasswordResetRequest {
  emailAddress: string;
}

export interface PasswordResetConfirmationRequest {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

// Brand Types
export interface Brand {
  id: number;
  brandId?: number; // Alias para compatibilidad
  brandName: string;
  brandLogo?: string;
  brandLogoUrl?: string;
  adressLine?: string;
  brandPhone?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface BrandRequest {
  brandName: string;
  brandLogo?: File;
  adressLine?: string;
  brandPhone?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface BrandAddress {
  id: number;
  brandId: number;
  addressName: string;
  country?: string;
  estate?: string;
  city?: string;
  postalCode?: string;
  streetName?: string;
  streetNumber?: string;
  contactNumber?: string;
  contactEmail?: string;
  otherDetails?: string;
  comment?: string;
  latitude?: number;
  longitude?: number;
}

export interface BrandAddressRequest {
  brandId: number;
  addressName: string;
  country?: string;
  estate?: string;
  city?: string;
  postalCode?: string;
  streetName?: string;
  streetNumber?: string;
  contactNumber?: string;
  contactEmail?: string;
  otherDetails?: string;
  comment?: string;
  latitude?: number;
  longitude?: number;
}

// Base Vehicle Types
export interface BaseVehicle {
  id: number;
  brandId: number;
  brandName?: string;
  modelName: string;
  modelYear: number;
  imageVehicleBase?: string;
  baseVehicleImageUrl?: string;
  baseVehicleImageFilePath?: string;
  isFavorite: boolean;
}

export interface BaseVehicleRequest {
  brandId: number;
  brandName: string;
  modelName?: string;
  modelYear?: number;
  imageVehicleBase?: File;
  isFavorite?: boolean;
}

// Vehicle Version Types
export interface VehicleVersion {
  id: number;
  baseVehicleId: number;
  versionName: string;
  price?: number;
  originPrice?: number;
  originCurrency?: number;
  maxSpeed: number;
  acceleration: number;
  range: number;
  batteryCapacity: number;
  motorPower: number;
  torque: number;
  seatingCapacity: number;
  trunkCapacity: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  wheelbase: number;
  groundClearance: number;
  dragCoefficient: number;
  topSpeed: number;
  chargingTime: number;
  fastChargingTime: number;
  warranty: string;
  description?: string;
  images?: VehicleImage[];
  vehicleImages?: VehicleImage[];
  colors?: VehicleColor[];
  associatedColors?: VehicleColor[];
  additionalEquipments?: AdditionalEquipment[];
  additionalEquipment?: AdditionalEquipment[];
  maxDrivingRangeKm?:any
}

export interface VehicleVersionRequest {
  baseVehicleId: number;
  versionName: string;
  originPrice?: number;
  originCurrency?: string;
  discountPrice?: number;
  lenghtmm?: number;
  widthmm?: number;
  heightmm?: number;
  wheelSize?: string;
  wheelBasemm?: number;
  wheelTrackmm?: number;
  groundClearance?: number;
  curbWeightKg?: number;
  seatsNumber?: number;
  doorsNumber?: number;
  maximumSpeedKmH?: number;
  motorPowerkw?: number;
  motorTorqueNm?: number;
  maxDrivingRangeKm?: number;
  operatingDrivingRangeKm?: number;
  drivingRangeWithACMultiplier?: number;
  batteryCapacityKwh?: number;
  numberOfMotors?: number;
  rearMotorKw?: number;
  rearMotorTorque?: number;
  chargeTimeHrs?: number;
  systemVoltageV?: number;
  batteryCapacityAh?: number;
  batteryType?: string;
  chargeVoltage?: string;
  hasFastCharge?: boolean;
  fastChargeTimeHrs?: number;
  gears?: number;
  driveTrainType?: string;
  frontSuspension?: string;
  rearSuspension?: string;
  brakeSystem?: string;
  spareTire?: boolean;
  wheelMaterial?: string;
  tirePressureMonitoring?: boolean;
  preventSlipping?: boolean;
  foldableRearViewMirror?: boolean;
  ledDigitalInstrument?: boolean;
  ledTailight?: boolean;
  ledHeadlamp?: boolean;
  headLampLevelingSystem?: boolean;
  daylightRunningLights?: boolean;
  highMountedBrakeLamp?: boolean;
  automaticSteeringWheelReturn?: boolean;
  brakeBooster?: boolean;
  keylessEnginteStart?: boolean;
  keylessEntrySystem?: boolean;
  remoteStart?: boolean;
  rotationsOfSteeringWheel?: number;
  fullAutomaticAC?: boolean;
  heater?: boolean;
  seatBeltWarning?: boolean;
  inermittentWindshieldWiper?: boolean;
  parkingRadar?: boolean;
  autoInductionHeadlamp?: boolean;
  adjustableSeat?: boolean;
  electricDoorsWindows?: boolean;
  antiGlareInsideRearViewMirror?: boolean;
  readingLamp?: boolean;
  powerInterFace12V?: number;
  centralControlSystem?: boolean;
  safetyBelt3Point?: boolean;
  copilotHandle?: boolean;
  rearViewCamera?: boolean;
  intelligentChargingSystem?: boolean;
  androidInch9?: boolean;
  intelligentVehicleNavigation?: boolean;
  voiceControl?: boolean;
  navigationSystem?: boolean;
  bluetoothTelephone?: boolean;
  radioMP3?: boolean;
  loudspeaker?: number;
  skyRoof?: boolean;
  airbag?: boolean;
  additionalEquipment?: AdditionalEquipmentRequest[];
  vehicleImages?: File[];
}

export interface VehicleVersionUpdateRequest {
  vehicleVersionId: number;
  versionName?: string;
  originPrice?: number;
  originCurrency?: string;
  discountPrice?: number;
  lenghtmm?: number;
  widthmm?: number;
  heightmm?: number;
  wheelSize?: string;
  wheelBasemm?: number;
  wheelTrackmm?: number;
  groundClearance?: number;
  curbWeightKg?: number;
  seatsNumber?: number;
  doorsNumber?: number;
  maximumSpeedKmH?: number;
  motorPowerkw?: number;
  motorTorqueNm?: number;
  maxDrivingRangeKm?: number;
  operatingDrivingRangeKm?: number;
  drivingRangeWithACMultiplier?: number;
  batteryCapacityKwh?: number;
  numberOfMotors?: number;
  rearMotorKw?: number;
  rearMotorTorque?: number;
  chargeTimeHrs?: number;
  systemVoltageV?: number;
  batteryCapacityAh?: number;
  batteryType?: string;
  chargeVoltage?: string;
  hasFastCharge?: boolean;
  fastChargeTimeHrs?: number;
  gears?: number;
  driveTrainType?: string;
  frontSuspension?: string;
  rearSuspension?: string;
  brakeSystem?: string;
  spareTire?: boolean;
  wheelMaterial?: string;
  tirePressureMonitoring?: boolean;
  preventSlipping?: boolean;
  foldableRearViewMirror?: boolean;
  ledDigitalInstrument?: boolean;
  ledTailight?: boolean;
  ledHeadlamp?: boolean;
  headLampLevelingSystem?: boolean;
  daylightRunningLights?: boolean;
  highMountedBrakeLamp?: boolean;
  automaticSteeringWheelReturn?: boolean;
  brakeBooster?: boolean;
  keylessEnginteStart?: boolean;
  keylessEntrySystem?: boolean;
  remoteStart?: boolean;
  rotationsOfSteeringWheel?: number;
  fullAutomaticAC?: boolean;
  heater?: boolean;
  seatBeltWarning?: boolean;
  inermittentWindshieldWiper?: boolean;
  parkingRadar?: boolean;
  autoInductionHeadlamp?: boolean;
  adjustableSeat?: boolean;
  electricDoorsWindows?: boolean;
  antiGlareInsideRearViewMirror?: boolean;
  readingLamp?: boolean;
  powerInterFace12V?: number;
  centralControlSystem?: boolean;
  safetyBelt3Point?: boolean;
  copilotHandle?: boolean;
  rearViewCamera?: boolean;
  intelligentChargingSystem?: boolean;
  androidInch9?: boolean;
  intelligentVehicleNavigation?: boolean;
  voiceControl?: boolean;
  navigationSystem?: boolean;
  bluetoothTelephone?: boolean;
  radioMP3?: boolean;
  loudspeaker?: number;
  skyRoof?: boolean;
  airbag?: boolean;
}

export interface VehicleImage {
  id: number;
  vehicleVersionId: number;
  imageUrl?: string;
  fileURL?: string;
  filePath?: string;
  isPrimary?: boolean;
  order?: number;
}

// Vehicle Color Types
export interface VehicleColor {
  id: number;
  colorCode: string;
  colorName: string;
  brandId: number;
  minYear?: number;
  maxYear?: number;
  hexCode?: string;
  manufacturer?: string;
  mainColorGroup?: string;
  mainColorGroupHexCode?: string;
  colorType?: number | 'Metalico' | 'Solido' | 'Matte' | 'Pearlescente' | 'Especial';
}

export interface VehicleColorRequest {
  colorCode: string;
  colorName: string;
  brandId: number;
  minYear?: number;
  maxYear?: number;
  hexCode?: string | null;
  manufacturer?: string | null;
  mainColorGroup?: string | null;
  mainColorGroupHexCode?: string | null;
  colorType?: number | 'Metalico' | 'Solido' | 'Matte' | 'Pearlescente' | 'Especial' | null;
}

// Additional Equipment Types
export interface AdditionalEquipment {
  id: number;
  equipmentType: string;
  equipmentDescription: string;
  equipmentPrice: number;
  equipmentPriceCurrency: string;
}

export interface AdditionalEquipmentRequest {
  vehicleVersionId?: number;
  equipmentType: string;
  equipmentDescription: string;
  equipmentPrice: number;
  equipmentPriceCurrency: string;
}

// Vehicle Comment Types
export interface VehicleComment {
  id: number;
  baseVehicleId: number;
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleCommentRequest {
  baseVehicleId: number;
  title: string;
  description: string;
}

// Filter Types
export interface VehicleFilters {
  versionName?: string;
  baseVehicleId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRange?: number;
  maxRange?: number;
  minSpeed?: number;
  maxSpeed?: number;
  pageSize?: number;
  pageNumber?: number;
}

export interface BrandFilters {
  pageSize?: number;
  pageNumber?: number;
}

// ==================== INVENTORY TYPES ====================

// Inventory Enums
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

export enum MovementType {
  Entry = 'Entry',
  Exit = 'Exit',
  Transfer = 'Transfer',
  StatusChange = 'StatusChange',
  MaintenanceIn = 'MaintenanceIn',
  MaintenanceOut = 'MaintenanceOut',
  Adjustment = 'Adjustment'
}

export enum Currency {
  MXN = 'MXN',
  USD = 'USD',
  CNY = 'CNY',
  JPY = 'JPY',
  EUR = 'EUR',
  CAD = 'CAD',
  RUB = 'RUB'
}

// Inventory Item Types
export interface InventoryItem {
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
  // Relations
  vehicleVersion?: VehicleVersion;
  vehicleColor?: VehicleColor;
  images?: InventoryItemImage[];
  movements?: InventoryMovement[];
}

export interface InventoryItemRequest {
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
}

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
  entryDate?: string | null;
  entryNotes?: string | null;
  purchasePrice?: number | null;
  purchaseCurrency?: Currency | null;
  supplierName?: string | null;
  exitDate?: string | null;
  exitNotes?: string | null;
}

// Inventory Movement Types
export interface InventoryMovement {
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

export interface InventoryMovementRequest {
  inventoryItemId: number;
  movementType: MovementType;
  movementDate?: string | null;
  fromLocation?: string | null;
  toLocation?: string | null;
  reason?: string | null;
  notes?: string | null;
  documentReference?: string | null;
  performedBy?: string | null;
  previousMileage?: number | null;
  newMileage?: number | null;
}

export interface ChangeLocationRequest {
  inventoryItemId: number;
  newLocation?: string | null;
  reason?: string | null;
  performedBy?: string | null;
}

export interface ChangeStatusRequest {
  inventoryItemId: number;
  newStatus?: InventoryStatus | null;
  reason?: string | null;
  performedBy?: string | null;
}

export interface UpdateMileageRequest {
  inventoryItemId: number;
  newMileage: number;
  notes?: string | null;
  performedBy?: string | null;
}

// Inventory Image Types
export interface InventoryItemImage {
  imageId: number;
  inventoryItemId: number;
  imageUrl: string;
  imageType?: string | null;
  uploadedAt?: string | null;
  uploadedBy?: string | null;
}

// Inventory Filter Types
export interface InventoryFilters {
  VIN?: string;
  SerialNumber?: string;
  VehicleVersionId?: number;
  VehicleColorId?: number;
  Location?: string;
  Status?: InventoryStatus;
  MinMileage?: number;
  MaxMileage?: number;
  ModelYear?: number;
  EntryDateFrom?: string;
  EntryDateTo?: string;
  SupplierName?: string;
  HasExited?: boolean;
  PageSize?: number;
  PageNumber?: number;
}

export interface MovementFilters {
  InventoryItemId?: number;
  MovementType?: MovementType;
  MovementDateFrom?: string;
  MovementDateTo?: string;
  Location?: string;
  PerformedBy?: string;
  PageSize?: number;
  PageNumber?: number;
}
