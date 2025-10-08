// API Response Types

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
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
  hexCode?: string;
}

export interface VehicleColorRequest {
  colorCode: string;
  colorName: string;
  brandId: number;
  minYear?: number;
  hexCode?: string;
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
