import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Package, PackageStatus, DeliveryType, DeliveryPriority, PaymentMethod, UserRole } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj)
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    return formatDate(dateObj)
  }
}

export function formatWeight(weight: number, unit: string = 'kg'): string {
  return `${weight.toFixed(1)} ${unit}`
}

export function formatDimensions(dimensions: { length: number; width: number; height: number }, unit: string = 'cm'): string {
  return `${dimensions.length} × ${dimensions.width} × ${dimensions.height} ${unit}`
}

export function formatDistance(distance: number, unit: string = 'km'): string {
  if (distance < 1 && unit === 'km') {
    return `${(distance * 1000).toFixed(0)} m`
  }
  return `${distance.toFixed(1)} ${unit}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

export function getStatusColor(status: PackageStatus): string {
  switch (status) {
    case PackageStatus.CREATED:
      return 'bg-gray-100 text-gray-800'
    case PackageStatus.PAYMENT_PENDING:
      return 'bg-yellow-100 text-yellow-800'
    case PackageStatus.CONFIRMED:
      return 'bg-blue-100 text-blue-800'
    case PackageStatus.PICKED_UP:
      return 'bg-purple-100 text-purple-800'
    case PackageStatus.IN_TRANSIT:
      return 'bg-indigo-100 text-indigo-800'
    case PackageStatus.OUT_FOR_DELIVERY:
      return 'bg-orange-100 text-orange-800'
    case PackageStatus.DELIVERED:
      return 'bg-green-100 text-green-800'
    case PackageStatus.FAILED_DELIVERY:
      return 'bg-red-100 text-red-800'
    case PackageStatus.RETURNED:
      return 'bg-gray-100 text-gray-800'
    case PackageStatus.CANCELLED:
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusLabel(status: PackageStatus): string {
  switch (status) {
    case PackageStatus.CREATED:
      return 'Created'
    case PackageStatus.PAYMENT_PENDING:
      return 'Payment Pending'
    case PackageStatus.CONFIRMED:
      return 'Confirmed'
    case PackageStatus.PICKED_UP:
      return 'Picked Up'
    case PackageStatus.IN_TRANSIT:
      return 'In Transit'
    case PackageStatus.OUT_FOR_DELIVERY:
      return 'Out for Delivery'
    case PackageStatus.DELIVERED:
      return 'Delivered'
    case PackageStatus.FAILED_DELIVERY:
      return 'Failed Delivery'
    case PackageStatus.RETURNED:
      return 'Returned'
    case PackageStatus.CANCELLED:
      return 'Cancelled'
    default:
      return 'Unknown'
  }
}

export function getDeliveryTypeLabel(type: DeliveryType): string {
  switch (type) {
    case DeliveryType.STANDARD:
      return 'Standard'
    case DeliveryType.EXPRESS:
      return 'Express'
    case DeliveryType.SAME_DAY:
      return 'Same Day'
    case DeliveryType.SCHEDULED:
      return 'Scheduled'
    default:
      return 'Standard'
  }
}

export function getPriorityLabel(priority: DeliveryPriority): string {
  switch (priority) {
    case DeliveryPriority.LOW:
      return 'Low'
    case DeliveryPriority.MEDIUM:
      return 'Medium'
    case DeliveryPriority.HIGH:
      return 'High'
    case DeliveryPriority.URGENT:
      return 'Urgent'
    default:
      return 'Medium'
  }
}

export function getPriorityColor(priority: DeliveryPriority): string {
  switch (priority) {
    case DeliveryPriority.LOW:
      return 'bg-gray-100 text-gray-800'
    case DeliveryPriority.MEDIUM:
      return 'bg-blue-100 text-blue-800'
    case DeliveryPriority.HIGH:
      return 'bg-orange-100 text-orange-800'
    case DeliveryPriority.URGENT:
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.CREDIT_CARD:
      return 'Credit Card'
    case PaymentMethod.DEBIT_CARD:
      return 'Debit Card'
    case PaymentMethod.PAYPAL:
      return 'PayPal'
    case PaymentMethod.DIGITAL_WALLET:
      return 'Digital Wallet'
    case PaymentMethod.CASH_ON_DELIVERY:
      return 'Cash on Delivery'
    case PaymentMethod.BANK_TRANSFER:
      return 'Bank Transfer'
    default:
      return 'Unknown'
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.CUSTOMER:
      return 'Customer'
    case UserRole.DRIVER:
      return 'Driver'
    case UserRole.ADMIN:
      return 'Admin'
    default:
      return 'User'
  }
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function calculateDeliveryPrice(
  distance: number,
  weight: number,
  priority: DeliveryPriority,
  deliveryType: DeliveryType,
  insurance: boolean = false,
  packageValue: number = 0
): {
  basePrice: number
  distanceFee: number
  weightFee: number
  priorityFee: number
  insuranceFee: number
  serviceFee: number
  tax: number
  discount: number
  total: number
} {
  // Base pricing structure
  let basePrice = 10.00

  // Distance-based pricing (per km)
  const distanceFee = distance * 1.50

  // Weight-based pricing (per kg over 1kg)
  const weightFee = weight > 1 ? (weight - 1) * 2.00 : 0

  // Priority multipliers
  let priorityFee = 0
  switch (priority) {
    case DeliveryPriority.HIGH:
      priorityFee = basePrice * 0.5
      break
    case DeliveryPriority.URGENT:
      priorityFee = basePrice * 1.0
      break
  }

  // Delivery type multipliers
  switch (deliveryType) {
    case DeliveryType.EXPRESS:
      basePrice *= 1.5
      break
    case DeliveryType.SAME_DAY:
      basePrice *= 2.0
      break
  }

  // Insurance fee (2% of package value, minimum $2)
  const insuranceFee = insurance ? Math.max(packageValue * 0.02, 2.00) : 0

  // Service fee (fixed)
  const serviceFee = 2.50

  // Calculate subtotal
  const subtotal = basePrice + distanceFee + weightFee + priorityFee + insuranceFee + serviceFee

  // Tax (8%)
  const tax = subtotal * 0.08

  // Discount (for demo purposes)
  const discount = 0

  // Total
  const total = subtotal + tax - discount

  return {
    basePrice,
    distanceFee,
    weightFee,
    priorityFee,
    insuranceFee,
    serviceFee,
    tax,
    discount,
    total: Math.round(total * 100) / 100
  }
}

export function generateTrackingNumber(): string {
  const prefix = 'KX'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateRandomColor(): string {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

export function formatAddress(address: {
  street: string
  city: string
  state: string
  zipCode: string
  country?: string
}): string {
  const parts = [address.street, address.city, address.state, address.zipCode]
  if (address.country && address.country !== 'USA') {
    parts.push(address.country)
  }
  return parts.filter(Boolean).join(', ')
}

export function getPackageProgress(status: PackageStatus): number {
  switch (status) {
    case PackageStatus.CREATED:
      return 10
    case PackageStatus.PAYMENT_PENDING:
      return 20
    case PackageStatus.CONFIRMED:
      return 30
    case PackageStatus.PICKED_UP:
      return 50
    case PackageStatus.IN_TRANSIT:
      return 70
    case PackageStatus.OUT_FOR_DELIVERY:
      return 90
    case PackageStatus.DELIVERED:
      return 100
    case PackageStatus.FAILED_DELIVERY:
    case PackageStatus.RETURNED:
    case PackageStatus.CANCELLED:
      return 0
    default:
      return 0
  }
}

export function sortPackages(packages: Package[], sortBy: 'date' | 'status' | 'priority' = 'date'): Package[] {
  return [...packages].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'status':
        return a.status.localeCompare(b.status)
      case 'priority':
        const priorityOrder = {
          [DeliveryPriority.URGENT]: 4,
          [DeliveryPriority.HIGH]: 3,
          [DeliveryPriority.MEDIUM]: 2,
          [DeliveryPriority.LOW]: 1,
        }
        return priorityOrder[b.delivery.priority] - priorityOrder[a.delivery.priority]
      default:
        return 0
    }
  })
}

export function filterPackages(packages: Package[], filters: {
  status?: PackageStatus[]
  priority?: DeliveryPriority[]
  dateRange?: { start: Date; end: Date }
  searchTerm?: string
}): Package[] {
  return packages.filter(pkg => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(pkg.status)) return false
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(pkg.delivery.priority)) return false
    }

    // Date range filter
    if (filters.dateRange) {
      const pkgDate = new Date(pkg.createdAt)
      if (pkgDate < filters.dateRange.start || pkgDate > filters.dateRange.end) {
        return false
      }
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const searchableText = [
        pkg.trackingNumber,
        pkg.sender.name,
        pkg.receiver.name,
        pkg.packageDetails.description,
      ].join(' ').toLowerCase()
      
      if (!searchableText.includes(searchLower)) return false
    }

    return true
  })
}