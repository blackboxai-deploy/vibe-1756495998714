'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Truck, Package, Clock, CheckCircle } from 'lucide-react';
import { Package as PackageType, PackageStatus } from '@/types';

interface TrackingMapProps {
  package: PackageType;
  className?: string;
}

interface MapLocation {
  lat: number;
  lng: number;
  label: string;
  type: 'pickup' | 'delivery' | 'current' | 'waypoint';
  status?: 'completed' | 'current' | 'pending';
}

export function TrackingMap({ package: pkg, className }: TrackingMapProps) {
  const [currentDriverLocation, setCurrentDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLiveTracking, setIsLiveTracking] = useState(false);

  // Simulate real-time driver location updates
  useEffect(() => {
    if (!isLiveTracking || pkg.status === PackageStatus.DELIVERED) return;

    const interval = setInterval(() => {
      // Simulate driver movement between pickup and delivery locations
      const pickup = pkg.sender.address.coordinates;
      const delivery = pkg.receiver.address.coordinates;
      
      if (pickup && delivery) {
        // Simple linear interpolation for demo
        const progress = Math.min(0.8, Math.random() * 0.9);
        const lat = pickup.lat + (delivery.lat - pickup.lat) * progress;
        const lng = pickup.lng + (delivery.lng - pickup.lng) * progress;
        
        setCurrentDriverLocation({ lat, lng });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLiveTracking, pkg.sender.address.coordinates, pkg.receiver.address.coordinates, pkg.status]);

  const getStatusColor = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.DELIVERED:
        return 'bg-green-500';
      case PackageStatus.OUT_FOR_DELIVERY:
      case PackageStatus.IN_TRANSIT:
        return 'bg-blue-500';
      case PackageStatus.PICKED_UP:
        return 'bg-yellow-500';
      case PackageStatus.CREATED:
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.DELIVERED:
        return <CheckCircle className="h-4 w-4" />;
      case PackageStatus.OUT_FOR_DELIVERY:
      case PackageStatus.IN_TRANSIT:
        return <Truck className="h-4 w-4" />;
      case PackageStatus.PICKED_UP:
        return <Package className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const mapLocations: MapLocation[] = [
    {
      lat: pkg.sender.address.coordinates?.lat || 40.7128,
      lng: pkg.sender.address.coordinates?.lng || -74.0060,
      label: 'Pickup Location',
      type: 'pickup',
      status: pkg.status === PackageStatus.CREATED ? 'pending' : 'completed'
    },
    {
      lat: pkg.receiver.address.coordinates?.lat || 40.6892,
      lng: pkg.receiver.address.coordinates?.lng || -73.9442,
      label: 'Delivery Location',
      type: 'delivery',
      status: pkg.status === PackageStatus.DELIVERED ? 'completed' : 
              pkg.status === PackageStatus.OUT_FOR_DELIVERY ? 'current' : 'pending'
    }
  ];

  if (currentDriverLocation && pkg.status !== PackageStatus.DELIVERED) {
    mapLocations.push({
      lat: currentDriverLocation.lat,
      lng: currentDriverLocation.lng,
      label: 'Driver Location',
      type: 'current',
      status: 'current'
    });
  }

  const estimatedDistance = Math.round(
    Math.sqrt(
      Math.pow((mapLocations[1].lat - mapLocations[0].lat) * 111, 2) +
      Math.pow((mapLocations[1].lng - mapLocations[0].lng) * 111, 2)
    )
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Tracking
          </CardTitle>
          <Badge variant="outline" className={`${getStatusColor(pkg.status)} text-white`}>
            {getStatusIcon(pkg.status)}
            <span className="ml-1 capitalize">
              {pkg.status.replace('_', ' ')}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Container */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '300px' }}>
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" className="text-gray-300">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          {/* Map Locations */}
          {mapLocations.map((location, index) => {
            const x = ((location.lng + 74.0060) / 0.3) * 100;
            const y = ((40.7128 - location.lat) / 0.1) * 100;
            
            return (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${Math.max(10, Math.min(90, x))}%`, top: `${Math.max(10, Math.min(90, y))}%` }}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg
                  ${location.type === 'pickup' ? 'bg-green-500' : 
                    location.type === 'delivery' ? 'bg-red-500' : 
                    'bg-blue-500 animate-pulse'}
                `}>
                  {location.type === 'pickup' ? 'P' : 
                   location.type === 'delivery' ? 'D' : 
                   <Truck className="h-4 w-4" />}
                </div>
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
                  {location.label}
                </div>
              </div>
            );
          })}

          {/* Route Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            {mapLocations.length >= 2 && (
              <path
                d={`M ${((mapLocations[0].lng + 74.0060) / 0.3) * 100}% ${((40.7128 - mapLocations[0].lat) / 0.1) * 100}% 
                   L ${((mapLocations[1].lng + 74.0060) / 0.3) * 100}% ${((40.7128 - mapLocations[1].lat) / 0.1) * 100}%`}
                stroke="url(#routeGradient)"
                strokeWidth="3"
                strokeDasharray="5,5"
                fill="none"
                className="animate-pulse"
              />
            )}
          </svg>

          {/* Live Tracking Toggle */}
          <div className="absolute top-4 right-4">
            <Button
              size="sm"
              variant={isLiveTracking ? "default" : "outline"}
              onClick={() => setIsLiveTracking(!isLiveTracking)}
              className="text-xs"
              disabled={pkg.status === PackageStatus.DELIVERED}
            >
              <Navigation className="h-3 w-3 mr-1" />
              {isLiveTracking ? 'Live' : 'Track'}
            </Button>
          </div>
        </div>

        {/* Route Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">Pickup</span>
            </div>
            <p className="text-gray-600 text-xs">
              {pkg.sender.address.street}, {pkg.sender.address.city}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium">Delivery</span>
            </div>
            <p className="text-gray-600 text-xs">
              {pkg.receiver.address.street}, {pkg.receiver.address.city}
            </p>
          </div>
        </div>

        {/* Distance and ETA */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-sm">
            <span className="text-gray-600">Distance:</span>
            <span className="ml-1 font-medium">{estimatedDistance} km</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">ETA:</span>
            <span className="ml-1 font-medium">
              {pkg.delivery.estimatedDelivery ? 
                new Date(pkg.delivery.estimatedDelivery).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : 
                'Calculating...'
              }
            </span>
          </div>
        </div>

        {/* Driver Info (if assigned) */}
        {pkg.driverId && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                D
              </div>
              <div>
                <p className="font-medium text-sm">Driver Assigned</p>
                <p className="text-xs text-gray-600">ID: {pkg.driverId}</p>
              </div>
              {isLiveTracking && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}