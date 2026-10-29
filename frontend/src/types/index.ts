export type UserRole = 'ADMIN' | 'MANAGER' | 'CHIEF' | 'MECHANIC' | 'STOREKEEPER' | 'DRIVER';

export type VehicleStatus = 'AVAILABLE' | 'ASSIGNED' | 'UNDER_MAINTENANCE' | 'OUT_OF_SERVICE' | 'INSPECTION_EXPIRED';

export type MeterType = 'KM' | 'WORKING_HOUR';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type WorkOrderStatus = 'DRAFT' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'WAITING_SCRAP_CONFIRMATION' | 'COMPLETED' | 'CANCELLED';

export type ScrapStatus = 'PENDING_WAREHOUSE_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  tenantName?: string;
  tenantCode?: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  meterType: MeterType;
  currentMeter: number;
  chassisNumber?: string;
  engineNumber?: string;
  qrCodeToken: string;
  status: VehicleStatus;
  lastInspectionDate?: string;
  nextInspectionDate?: string;
  insuranceExpiryDate?: string;
  fuelType?: string;
  assignedDepartment?: string;
  notes?: string;
  isInspectionLocked?: boolean;
  activeDriverName?: string;
}

export interface ZimmetRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  assignedAt: string;
  returnedAt?: string;
  startingMeter: number;
  returnMeter?: number;
  qrScanVerified: boolean;
  status: 'ACTIVE' | 'RETURNED';
  checkoutNotes?: string;
}

export interface IssueReport {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  driverName: string;
  title: string;
  description: string;
  priority: IssuePriority;
  status: 'REPORTED' | 'UNDER_REVIEW' | 'WORK_ORDER_CREATED' | 'RESOLVED';
  photoUrls: string[];
  audioRecordingUrl?: string;
  voiceTranscript?: string;
  createdAt: string;
  latitude?: number;
  longitude?: number;
}

export interface ScrapRecord {
  id: string;
  workOrderId: string;
  sparePartId: string;
  sparePartName: string;
  oemCode: string;
  scrapPhotoUrl: string;
  status: ScrapStatus;
  warehouseStaffName?: string;
  warehouseNotes?: string;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleBrandModel: string;
  chiefName: string;
  assignedMechanicName: string;
  title: string;
  description: string;
  priority: IssuePriority;
  status: WorkOrderStatus;
  startedAt: string;
  completedAt?: string;
  laborHours: number;
  laborHourlyRate: number;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  usedParts: {
    sparePartId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  scrapRecords: ScrapRecord[];
}

export interface SparePart {
  id: string;
  partCode: string;
  oemCode: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  shelfLocation: string;
  barcode: string;
  compatibleVehicles: string;
  isCriticalStock?: boolean;
}

export interface FuelTelemetry {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  tankCapacityLiters: number;
  currentFuelLiters: number;
  fuelPercentage: number;
  averageConsumptionPer100Km: number;
  idleHours: number;
  engineRpm: number;
  engineTemperatureC: number;
  speedKmH: number;
  isFuelTheftSuspected: boolean; // Şüpheli ani yakıt düşüşü ikazı (Mazot hırsızlığı koruması)
  theftAnomalyDetails?: string;
  lastTelemetryPing: string;
  gpsLocation: {
    lat: number;
    lng: number;
    locationName: string;
  };
}

export interface AIDiagnosisResult {
  defectCategory: string;
  urgencyLevel: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK - DERHAL STOP EDİLMELİ';
  estimatedRepairHours: number;
  suggestedOemParts: {
    partCode: string;
    oemCode: string;
    partName: string;
    estimatedCost: number;
  }[];
  aiRecommendation: string;
  sayistayNote: string;
}

