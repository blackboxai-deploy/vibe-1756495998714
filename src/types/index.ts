// Core application types for KingX Package Delivery System

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export interface Package {
  id: string;
  trackingNumber: string;
  sender: ContactInfo;
  receiver: ContactInfo;
  packageDetails: PackageDetails;
  delivery: DeliveryInfo;
  payment: PaymentInfo;
  status: PackageStatus;
  timeline: StatusTimeline[];
  driverId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PackageDetails {
  category: PackageCategory;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  value: number;
  description: string;
  fragile: boolean;
  insurance: boolean;
}

export enum PackageCategory {
  DOCUMENTS = 'documents',
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  FOOD = 'food',
  FRAGILE = 'fragile',
  BULK = 'bulk',
  OTHER = 'other'
}

export interface DeliveryInfo {
  type: DeliveryType;
  priority: DeliveryPriority;
  scheduledDate: string;
  scheduledTimeSlot?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  instructions?: string;
  proofOfDelivery?: DeliveryProof;
}

export enum DeliveryType {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
  SCHEDULED = 'scheduled'
}

export enum DeliveryPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface DeliveryProof {
  signature?: string;
  photo?: string;
  notes?: string;
  timestamp: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface PaymentInfo {
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transactionId?: string;
  breakdown: PriceBreakdown;
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  DIGITAL_WALLET = 'digital_wallet',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  BANK_TRANSFER = 'bank_transfer'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export interface PriceBreakdown {
  basePrice: number;
  distanceFee: number;
  weightFee: number;
  priorityFee: number;
  insuranceFee: number;
  serviceFee: number;
  tax: number;
  discount: number;
  total: number;
}

export enum PackageStatus {
  CREATED = 'created',
  PAYMENT_PENDING = 'payment_pending',
  CONFIRMED = 'confirmed',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_DELIVERY = 'failed_delivery',
  RETURNED = 'returned',
  CANCELLED = 'cancelled'
}

export interface StatusTimeline {
  id: string;
  status: PackageStatus;
  timestamp: string;
  location?: string;
  notes?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Driver extends User {
  vehicle: VehicleInfo;
  license: string;
  rating: number;
  totalDeliveries: number;
  earnings: DriverEarnings;
  availability: DriverAvailability;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export interface VehicleInfo {
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  capacity: {
    weight: number;
    volume: number;
  };
}

export enum VehicleType {
  MOTORCYCLE = 'motorcycle',
  CAR = 'car',
  VAN = 'van',
  TRUCK = 'truck',
  BICYCLE = 'bicycle'
}

export interface DriverEarnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  pending: number;
}

export interface DriverAvailability {
  isOnline: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  daysOfWeek: number[];
}

export interface Route {
  id: string;
  driverId: string;
  packages: string[];
  startLocation: {
    lat: number;
    lng: number;
  };
  stops: RouteStop[];
  status: RouteStatus;
  estimatedDuration: number;
  actualDuration?: number;
  distance: number;
  optimized: boolean;
  createdAt: string;
}

export interface RouteStop {
  packageId: string;
  address: Address;
  coordinates: {
    lat: number;
    lng: number;
  };
  estimatedArrival: string;
  actualArrival?: string;
  status: StopStatus;
  order: number;
}

export enum RouteStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum StopStatus {
  PENDING = 'pending',
  ARRIVED = 'arrived',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

export interface Analytics {
  packages: PackageAnalytics;
  drivers: DriverAnalytics;
  revenue: RevenueAnalytics;
  customer: CustomerAnalytics;
}

export interface PackageAnalytics {
  total: number;
  delivered: number;
  inTransit: number;
  pending: number;
  cancelled: number;
  averageDeliveryTime: number;
  deliverySuccessRate: number;
}

export interface DriverAnalytics {
  total: number;
  active: number;
  available: number;
  averageRating: number;
  totalDeliveries: number;
}

export interface RevenueAnalytics {
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
  averageOrderValue: number;
  topPaymentMethods: PaymentMethodStats[];
}

export interface PaymentMethodStats {
  method: PaymentMethod;
  count: number;
  revenue: number;
  percentage: number;
}

export interface CustomerAnalytics {
  total: number;
  active: number;
  new: number;
  retention: number;
  averageOrdersPerCustomer: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export enum NotificationType {
  PACKAGE_UPDATE = 'package_update',
  DELIVERY_ASSIGNED = 'delivery_assigned',
  PAYMENT_PROCESSED = 'payment_processed',
  DELIVERY_COMPLETED = 'delivery_completed',
  SYSTEM_ALERT = 'system_alert',
  PROMOTION = 'promotion'
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  packages: Package[];
  drivers: Driver[];
  routes: Route[];
  notifications: Notification[];
  analytics: Analytics | null;
  isLoading: boolean;
  error: string | null;
}