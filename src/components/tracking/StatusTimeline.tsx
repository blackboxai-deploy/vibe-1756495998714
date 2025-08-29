'use client';

import React from 'react';
import { Package, PackageStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Truck, MapPin, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusTimelineProps {
  package: Package;
  className?: string;
}

const statusConfig = {
  [PackageStatus.CREATED]: {
    icon: Clock,
    label: 'Package Created',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Your package has been created and is awaiting pickup'
  },
  [PackageStatus.PAYMENT_PENDING]: {
    icon: Clock,
    label: 'Payment Pending',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'Waiting for payment confirmation'
  },
  [PackageStatus.CONFIRMED]: {
    icon: CheckCircle,
    label: 'Confirmed',
    color: 'bg-green-500',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Package confirmed and ready for pickup'
  },
  [PackageStatus.PICKED_UP]: {
    icon: Truck,
    label: 'Picked Up',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Package has been picked up by our driver'
  },
  [PackageStatus.IN_TRANSIT]: {
    icon: Truck,
    label: 'In Transit',
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Package is on its way to destination'
  },
  [PackageStatus.OUT_FOR_DELIVERY]: {
    icon: MapPin,
    label: 'Out for Delivery',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Package is out for delivery'
  },
  [PackageStatus.DELIVERED]: {
    icon: CheckCircle,
    label: 'Delivered',
    color: 'bg-green-500',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Package has been successfully delivered'
  },
  [PackageStatus.FAILED_DELIVERY]: {
    icon: AlertCircle,
    label: 'Failed Delivery',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Delivery attempt failed'
  },
  [PackageStatus.RETURNED]: {
    icon: XCircle,
    label: 'Returned',
    color: 'bg-gray-500',
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    description: 'Package has been returned to sender'
  },
  [PackageStatus.CANCELLED]: {
    icon: XCircle,
    label: 'Cancelled',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Package delivery has been cancelled'
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }),
    time: date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    })
  };
};

export function StatusTimeline({ package: pkg, className }: StatusTimelineProps) {
  const sortedTimeline = [...pkg.timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const currentStatusIndex = sortedTimeline.findIndex(
    item => item.status === pkg.status
  );

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Package Timeline</h3>
            <Badge 
              variant="secondary" 
              className={cn(
                'px-3 py-1',
                statusConfig[pkg.status]?.textColor,
                statusConfig[pkg.status]?.bgColor
              )}
            >
              {statusConfig[pkg.status]?.label || pkg.status}
            </Badge>
          </div>

          <div className="relative">
            {sortedTimeline.map((item, index) => {
              const config = statusConfig[item.status];
              const Icon = config?.icon || Clock;
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const { date, time } = formatDate(item.timestamp);

              return (
                <div key={item.id} className="relative flex items-start space-x-4 pb-8 last:pb-0">
                  {/* Timeline line */}
                  {index < sortedTimeline.length - 1 && (
                    <div 
                      className={cn(
                        'absolute left-6 top-12 w-0.5 h-16',
                        isCompleted ? 'bg-green-300' : 'bg-gray-200'
                      )}
                    />
                  )}

                  {/* Status icon */}
                  <div 
                    className={cn(
                      'relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2',
                      isCompleted 
                        ? 'bg-green-100 border-green-300 text-green-600' 
                        : 'bg-gray-100 border-gray-200 text-gray-400',
                      isCurrent && 'ring-4 ring-blue-100 border-blue-300 bg-blue-100 text-blue-600'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Status content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={cn(
                        'text-sm font-medium',
                        isCompleted ? 'text-gray-900' : 'text-gray-500'
                      )}>
                        {config?.label || item.status.replace('_', ' ')}
                      </h4>
                      <div className="text-xs text-gray-500 text-right">
                        <div>{date}</div>
                        <div>{time}</div>
                      </div>
                    </div>

                    <p className={cn(
                      'text-sm mt-1',
                      isCompleted ? 'text-gray-600' : 'text-gray-400'
                    )}>
                      {config?.description || 'Status updated'}
                    </p>

                    {item.location && (
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {item.location}
                      </div>
                    )}

                    {item.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        {item.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Estimated delivery */}
          {pkg.delivery.estimatedDelivery && pkg.status !== PackageStatus.DELIVERED && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Estimated Delivery
                </span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                {formatDate(pkg.delivery.estimatedDelivery).date} at {formatDate(pkg.delivery.estimatedDelivery).time}
              </p>
            </div>
          )}

          {/* Delivery proof */}
          {pkg.delivery.proofOfDelivery && pkg.status === PackageStatus.DELIVERED && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Delivery Confirmation
                </span>
              </div>
              
              {pkg.delivery.proofOfDelivery.photo && (
                <div className="mb-3">
                  <img 
                    src={pkg.delivery.proofOfDelivery.photo} 
                    alt="Delivery proof"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}

              {pkg.delivery.proofOfDelivery.signature && (
                <div className="mb-3">
                  <p className="text-xs text-green-700 mb-1">Digital Signature:</p>
                  <div className="p-2 bg-white rounded border text-xs">
                    {pkg.delivery.proofOfDelivery.signature}
                  </div>
                </div>
              )}

              {pkg.delivery.proofOfDelivery.notes && (
                <div className="mb-3">
                  <p className="text-xs text-green-700 mb-1">Delivery Notes:</p>
                  <p className="text-xs text-green-600">
                    {pkg.delivery.proofOfDelivery.notes}
                  </p>
                </div>
              )}

              <p className="text-xs text-green-600">
                Delivered on {formatDate(pkg.delivery.proofOfDelivery.timestamp).date} at {formatDate(pkg.delivery.proofOfDelivery.timestamp).time}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}