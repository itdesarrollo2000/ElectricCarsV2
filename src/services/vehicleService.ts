import api from './api';
import type {
  BaseVehicle,
  BaseVehicleRequest,
  VehicleVersion,
  VehicleVersionRequest,
  VehicleVersionUpdateRequest,
  VehicleFilters,
  PaginatedResponse,
  VehicleImage,
} from '../types';

export const vehicleService = {
  // Base Vehicle endpoints
  getBaseVehicles: async (): Promise<BaseVehicle[]> => {
    const response = await api.get<BaseVehicle[]>('/BaseVehicle');
    return response.data;
  },

  getBaseVehicleById: async (id: number): Promise<BaseVehicle> => {
    const response = await api.get(`/BaseVehicle/${id}`);
    // La API puede devolver { data: BaseVehicle } o directamente BaseVehicle
    return response.data?.data || response.data;
  },

  getBaseVehiclesByBrand: async (brandId: number): Promise<BaseVehicle[]> => {
    const response = await api.get<BaseVehicle[]>(`/BaseVehicle/GetByBrand?brandId=${brandId}`);
    return response.data;
  },

  getFavoriteVehicles: async (): Promise<BaseVehicle[]> => {
    const response = await api.get<BaseVehicle[]>('/BaseVehicle/GetFavorites');
    return response.data;
  },

  addBaseVehicle: async (vehicle: BaseVehicleRequest): Promise<BaseVehicle> => {
    const formData = new FormData();
    formData.append('BrandId', vehicle.brandId.toString());
    formData.append('BrandName', vehicle.brandName);
    if (vehicle.modelName) formData.append('ModelName', vehicle.modelName);
    if (vehicle.modelYear) formData.append('ModelYear', vehicle.modelYear.toString());
    if (vehicle.imageVehicleBase) formData.append('ImageVehicleBase', vehicle.imageVehicleBase);
    if (vehicle.isFavorite !== undefined) formData.append('IsFavorite', vehicle.isFavorite.toString());

    const response = await api.post<BaseVehicle>('/BaseVehicle', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateBaseVehicle: async (id: number, vehicle: Partial<BaseVehicleRequest>): Promise<BaseVehicle> => {
    const formData = new FormData();
    if (vehicle.brandId) formData.append('BrandId', vehicle.brandId.toString());
    if (vehicle.brandName) formData.append('BrandName', vehicle.brandName);
    if (vehicle.modelName) formData.append('ModelName', vehicle.modelName);
    if (vehicle.modelYear) formData.append('ModelYear', vehicle.modelYear.toString());
    if (vehicle.imageVehicleBase) formData.append('ImageVehicleBase', vehicle.imageVehicleBase);
    if (vehicle.isFavorite !== undefined) formData.append('IsFavorite', vehicle.isFavorite.toString());

    const response = await api.put<BaseVehicle>(`/BaseVehicle?id=${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteBaseVehicle: async (id: number): Promise<void> => {
    await api.delete(`/BaseVehicle/${id}`);
  },

  // Vehicle Version endpoints
  getVehicleVersions: async (filters?: VehicleFilters): Promise<PaginatedResponse<VehicleVersion>> => {
    const params = new URLSearchParams();
    if (filters?.versionName) params.append('VersionName', filters.versionName);
    if (filters?.baseVehicleId) params.append('BaseVehicleId', filters.baseVehicleId.toString());
    if (filters?.brandId) params.append('BrandId', filters.brandId.toString());
    if (filters?.minPrice) params.append('MinPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('MaxPrice', filters.maxPrice.toString());
    if (filters?.minRange) params.append('MinRange', filters.minRange.toString());
    if (filters?.maxRange) params.append('MaxRange', filters.maxRange.toString());
    if (filters?.minSpeed) params.append('MinSpeed', filters.minSpeed.toString());
    if (filters?.maxSpeed) params.append('MaxSpeed', filters.maxSpeed.toString());
    if (filters?.pageSize) params.append('PageSize', filters.pageSize.toString());
    if (filters?.pageNumber) params.append('PageNumber', filters.pageNumber.toString());

    const response = await api.get<PaginatedResponse<VehicleVersion>>(`/Vehicles/GetVehicleVersions?${params}`);
    return response.data;
  },

  getVehicleVersionById: async (id: number): Promise<VehicleVersion> => {
    const response = await api.get<VehicleVersion>(`/Vehicles/Versions/GetById?id=${id}`);
    return response.data;
  },

  addVehicleVersion: async (version: VehicleVersionRequest): Promise<VehicleVersion> => {
    const formData = new FormData();

    // Required fields
    formData.append('BaseVehicleId', version.baseVehicleId.toString());
    formData.append('VersionName', version.versionName);

    // Price fields
    if (version.originPrice !== undefined) formData.append('OriginPrice', version.originPrice.toString());
    if (version.originCurrency) formData.append('OriginCurrency', version.originCurrency);
    if (version.discountPrice !== undefined) formData.append('DiscountPrice', version.discountPrice.toString());

    // Dimensions
    if (version.lenghtmm !== undefined) formData.append('Lenghtmm', version.lenghtmm.toString());
    if (version.widthmm !== undefined) formData.append('Widthmm', version.widthmm.toString());
    if (version.heightmm !== undefined) formData.append('Heightmm', version.heightmm.toString());
    if (version.wheelSize) formData.append('WheelSize', version.wheelSize);
    if (version.wheelBasemm !== undefined) formData.append('WheelBasemm', version.wheelBasemm.toString());
    if (version.wheelTrackmm !== undefined) formData.append('WheelTrackmm', version.wheelTrackmm.toString());
    if (version.groundClearance !== undefined) formData.append('GroundClearance', version.groundClearance.toString());
    if (version.curbWeightKg !== undefined) formData.append('CurbWeightKg', version.curbWeightKg.toString());
    if (version.seatsNumber !== undefined) formData.append('SeatsNumber', version.seatsNumber.toString());
    if (version.doorsNumber !== undefined) formData.append('DoorsNumber', version.doorsNumber.toString());

    // Motor and Performance
    if (version.maximumSpeedKmH !== undefined) formData.append('MaximumSpeedKmH', version.maximumSpeedKmH.toString());
    if (version.motorPowerkw !== undefined) formData.append('MotorPowerkw', version.motorPowerkw.toString());
    if (version.motorTorqueNm !== undefined) formData.append('MotorTorqueNm', version.motorTorqueNm.toString());
    if (version.numberOfMotors !== undefined) formData.append('NumberOfMotors', version.numberOfMotors.toString());
    if (version.rearMotorKw !== undefined) formData.append('RearMotorKw', version.rearMotorKw.toString());
    if (version.rearMotorTorque !== undefined) formData.append('RearMotorTorque', version.rearMotorTorque.toString());

    // Battery and Range
    if (version.maxDrivingRangeKm !== undefined) formData.append('MaxDrivingRangeKm', version.maxDrivingRangeKm.toString());
    if (version.operatingDrivingRangeKm !== undefined) formData.append('OperatingDrivingRangeKm', version.operatingDrivingRangeKm.toString());
    if (version.drivingRangeWithACMultiplier !== undefined) formData.append('DrivingRangeWithACMultiplier', version.drivingRangeWithACMultiplier.toString());
    if (version.batteryCapacityKwh !== undefined) formData.append('BatteryCapacityKwh', version.batteryCapacityKwh.toString());
    if (version.batteryCapacityAh !== undefined) formData.append('BatteryCapacityAh', version.batteryCapacityAh.toString());
    if (version.batteryType) formData.append('BatteryType', version.batteryType);
    if (version.systemVoltageV !== undefined) formData.append('SystemVoltageV', version.systemVoltageV.toString());

    // Charging
    if (version.chargeTimeHrs !== undefined) formData.append('ChargeTimeHrs', version.chargeTimeHrs.toString());
    if (version.chargeVoltage) formData.append('ChargeVoltage', version.chargeVoltage);
    if (version.hasFastCharge !== undefined) formData.append('HasFastCharge', version.hasFastCharge.toString());
    if (version.fastChargeTimeHrs !== undefined) formData.append('FastChargeTimeHrs', version.fastChargeTimeHrs.toString());

    // Drivetrain and Suspension
    if (version.gears !== undefined) formData.append('Gears', version.gears.toString());
    if (version.driveTrainType) formData.append('DriveTrainType', version.driveTrainType);
    if (version.frontSuspension) formData.append('FrontSuspension', version.frontSuspension);
    if (version.rearSuspension) formData.append('RearSuspension', version.rearSuspension);
    if (version.brakeSystem) formData.append('BrakeSystem', version.brakeSystem);

    // Wheels and Tires
    if (version.spareTire !== undefined) formData.append('SpareTire', version.spareTire.toString());
    if (version.wheelMaterial) formData.append('WheelMaterial', version.wheelMaterial);
    if (version.tirePressureMonitoring !== undefined) formData.append('TirePressureMonitoring', version.tirePressureMonitoring.toString());

    // Safety Features
    if (version.preventSlipping !== undefined) formData.append('PreventSlipping', version.preventSlipping.toString());
    if (version.brakeBooster !== undefined) formData.append('BrakeBooster', version.brakeBooster.toString());
    if (version.seatBeltWarning !== undefined) formData.append('SeatBeltWarning', version.seatBeltWarning.toString());
    if (version.parkingRadar !== undefined) formData.append('ParkingRadar', version.parkingRadar.toString());
    if (version.rearViewCamera !== undefined) formData.append('RearViewCamera', version.rearViewCamera.toString());
    if (version.safetyBelt3Point !== undefined) formData.append('SafetyBelt3Point', version.safetyBelt3Point.toString());
    if (version.airbag !== undefined) formData.append('Airbag', version.airbag.toString());

    // Lighting
    if (version.foldableRearViewMirror !== undefined) formData.append('FoldableRearViewMirror', version.foldableRearViewMirror.toString());
    if (version.ledDigitalInstrument !== undefined) formData.append('LEDDigitalInstrument', version.ledDigitalInstrument.toString());
    if (version.ledTailight !== undefined) formData.append('LEDTailight', version.ledTailight.toString());
    if (version.ledHeadlamp !== undefined) formData.append('LEDHeadlamp', version.ledHeadlamp.toString());
    if (version.headLampLevelingSystem !== undefined) formData.append('HeadLampLevelingSystem', version.headLampLevelingSystem.toString());
    if (version.daylightRunningLights !== undefined) formData.append('DaylightRunningLights', version.daylightRunningLights.toString());
    if (version.highMountedBrakeLamp !== undefined) formData.append('HighMountedBrakeLamp', version.highMountedBrakeLamp.toString());
    if (version.autoInductionHeadlamp !== undefined) formData.append('AutoInductionHeadlamp', version.autoInductionHeadlamp.toString());
    if (version.readingLamp !== undefined) formData.append('ReadingLamp', version.readingLamp.toString());

    // Convenience Features
    if (version.automaticSteeringWheelReturn !== undefined) formData.append('AutomaticSteeringWheelReturn', version.automaticSteeringWheelReturn.toString());
    if (version.keylessEnginteStart !== undefined) formData.append('KeylessEnginteStart', version.keylessEnginteStart.toString());
    if (version.keylessEntrySystem !== undefined) formData.append('KeylessEntrySystem', version.keylessEntrySystem.toString());
    if (version.remoteStart !== undefined) formData.append('RemoteStart', version.remoteStart.toString());
    if (version.rotationsOfSteeringWheel !== undefined) formData.append('RotationsOfSteeringWheel', version.rotationsOfSteeringWheel.toString());
    if (version.fullAutomaticAC !== undefined) formData.append('FullAutomaticAC', version.fullAutomaticAC.toString());
    if (version.heater !== undefined) formData.append('Heater', version.heater.toString());
    if (version.inermittentWindshieldWiper !== undefined) formData.append('InermittentWindshieldWiper', version.inermittentWindshieldWiper.toString());
    if (version.adjustableSeat !== undefined) formData.append('AdjustableSeat', version.adjustableSeat.toString());
    if (version.electricDoorsWindows !== undefined) formData.append('ElectricDoorsWindows', version.electricDoorsWindows.toString());
    if (version.antiGlareInsideRearViewMirror !== undefined) formData.append('AntiGlareInsideRearViewMirror', version.antiGlareInsideRearViewMirror.toString());
    if (version.powerInterFace12V !== undefined) formData.append('PowerInterFace12V', version.powerInterFace12V.toString());
    if (version.centralControlSystem !== undefined) formData.append('CentralControlSystem', version.centralControlSystem.toString());
    if (version.copilotHandle !== undefined) formData.append('CopilotHandle', version.copilotHandle.toString());
    if (version.skyRoof !== undefined) formData.append('SkyRoof', version.skyRoof.toString());

    // Technology Features
    if (version.intelligentChargingSystem !== undefined) formData.append('IntelligentChargingSystem', version.intelligentChargingSystem.toString());
    if (version.androidInch9 !== undefined) formData.append('AndroidInch9', version.androidInch9.toString());
    if (version.intelligentVehicleNavigation !== undefined) formData.append('IntelligentVehicleNavigation', version.intelligentVehicleNavigation.toString());
    if (version.voiceControl !== undefined) formData.append('VoiceControl', version.voiceControl.toString());
    if (version.navigationSystem !== undefined) formData.append('NavigationSystem', version.navigationSystem.toString());
    if (version.bluetoothTelephone !== undefined) formData.append('BluetoothTelephone', version.bluetoothTelephone.toString());
    if (version.radioMP3 !== undefined) formData.append('RadioMP3', version.radioMP3.toString());
    if (version.loudspeaker !== undefined) formData.append('Loudspeaker', version.loudspeaker.toString());

    // Images
    if (version.vehicleImages && version.vehicleImages.length > 0) {
      version.vehicleImages.forEach((image) => {
        formData.append('VehicleImages', image);
      });
    }

    const response = await api.post<VehicleVersion>('/Vehicles/Versions/AddVersion', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateVehicleVersion: async (version: VehicleVersionUpdateRequest): Promise<VehicleVersion> => {
    const response = await api.put<VehicleVersion>('/Vehicles/Versions/UpdateVersion', version);
    return response.data;
  },

  deleteVehicleVersion: async (id: number): Promise<void> => {
    await api.delete(`/Vehicles/Versions/DeleteVersion?id=${id}`);
  },

  // Vehicle Images
  getVehicleImages: async (vehicleVersionId: number): Promise<VehicleImage[]> => {
    const response = await api.get<VehicleImage[]>(`/Vehicles/Versions/GetImages?vehicleVersionId=${vehicleVersionId}`);
    return response.data;
  },

  addVehicleImages: async (vehicleVersionId: number, images: File[]): Promise<VehicleImage[]> => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('Images', image);
    });

    const response = await api.post<VehicleImage[]>(
      `/Vehicles/Versions/AddImages?VehicleVersionId=${vehicleVersionId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  deleteVehicleImage: async (id: number): Promise<void> => {
    await api.delete(`/Vehicles/Versions/DeleteImage?id=${id}`);
  },
};

export default vehicleService;
