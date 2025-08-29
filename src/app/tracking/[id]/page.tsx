'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Package, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Truck, 
  CheckCircle, 
  Circle, 
  Navigation,
  Star,
  Camera,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Package as PackageType, PackageStatus, Driver } from '@/types';

export default function TrackingPage() {
  const params = useParams();
  const trackingId = params.id as string;
  const [packageData, setPackageData] = useState<PackageType | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({ lat: 40.7128, lng: -74.0060 });

  // Mock data for demonstration
  useEffect(() => {
    const fetchPackageData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockPackage: PackageType = {
        id: '1',
        trackingNumber: trackingId,
        sender: {
          name: 'Alice Johnson',
          phone: '+1 (555) 123-4567',
          email: 'alice@example.com',
          address: {
            street: '123 Main Street',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA',
            coordinates: { lat: 40.7128, lng: -74.0060 }
          }
        },
        receiver: {
          name: 'Bob Smith',
          phone: '+1 (555) 987-6543',
          email: 'bob@example.com',
          address: {
            street: '456 Oak Avenue',
            city: 'Brooklyn',
            state: 'NY',
            zipCode: '11201',
            country: 'USA',
            coordinates: { lat: 40.6892, lng: -73.9442 }
          }
        },
        packageDetails: {
          category: 'electronics' as any,
          weight: 2.5,
          dimensions: { length: 30, width: 20, height: 10 },
          value: 299.99,
          description: 'Smartphone - iPhone 15 Pro',
          fragile: true,
          insurance: true
        },
        delivery: {
          type: 'express' as any,
          priority: 'high' as any,
          scheduledDate: new Date(Date.now() + 86400000).toISOString(),
          estimatedDelivery: new Date(Date.now() + 7200000).toISOString(),
          instructions: 'Leave at front door if no answer. Ring doorbell twice.',
          proofOfDelivery: undefined
        },
        payment: {
          method: 'credit_card' as any,
          amount: 25.99,
          currency: 'USD',
          status: 'completed' as any,
          transactionId: 'txn_123456789',
          breakdown: {
            basePrice: 15.00,
            distanceFee: 5.00,
            weightFee: 2.50,
            priorityFee: 3.49,
            insuranceFee: 2.00,
            serviceFee: 1.50,
            tax: 2.08,
            discount: 0,
            total: 25.99
          }
        },
        status: PackageStatus.IN_TRANSIT,
        timeline: [
          {
            id: '1',
            status: PackageStatus.CREATED,
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            location: 'New York, NY',
            notes: 'Package created and payment confirmed'
          },
          {
            id: '2',
            status: PackageStatus.CONFIRMED,
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            location: 'New York, NY',
            notes: 'Package confirmed and ready for pickup'
          },
          {
            id: '3',
            status: PackageStatus.PICKED_UP,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            location: 'New York, NY',
            notes: 'Package picked up by driver',
            coordinates: { lat: 40.7128, lng: -74.0060 }
          },
          {
            id: '4',
            status: PackageStatus.IN_TRANSIT,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            location: 'Manhattan Bridge',
            notes: 'Package in transit to destination',
            coordinates: { lat: 40.7061, lng: -73.9969 }
          }
        ],
        driverId: 'driver_123',
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockDriver: Driver = {
        id: 'driver_123',
        email: 'mike@kingx.com',
        name: 'Mike Johnson',
        phone: '+1 (555) 456-7890',
        avatar: 'https://placehold.co/100x100/4f46e5/ffffff?text=MJ',
        role: 'driver' as any,
        status: 'active' as any,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        vehicle: {
          type: 'van' as any,
          make: 'Ford',
          model: 'Transit',
          year: 2022,
          licensePlate: 'KX-1234',
          capacity: { weight: 1000, volume: 15 }
        },
        license: 'DL123456789',
        rating: 4.8,
        totalDeliveries: 1247,
        earnings: {
          today: 125.50,
          thisWeek: 875.25,
          thisMonth: 3520.75,
          total: 42500.00,
          pending: 125.50
        },
        availability: {
          isOnline: true,
          workingHours: { start: '08:00', end: '18:00' },
          daysOfWeek: [1, 2, 3, 4, 5, 6]
        },
        currentLocation: { lat: 40.7061, lng: -73.9969 }
      };

      setPackageData(mockPackage);
      setDriver(mockDriver);
      setCurrentLocation(mockDriver.currentLocation!);
      setIsLoading(false);
    };

    fetchPackageData();
  }, [trackingId]);

  // Simulate real-time location updates
  useEffect(() => {
    if (!driver || packageData?.status !== PackageStatus.IN_TRANSIT) return;

    const interval = setInterval(() => {
      setCurrentLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [driver, packageData?.status]);

  const getStatusProgress = (status: PackageStatus): number => {
    const statusOrder = [
      PackageStatus.CREATED,
      PackageStatus.CONFIRMED,
      PackageStatus.PICKED_UP,
      PackageStatus.IN_TRANSIT,
      PackageStatus.OUT_FOR_DELIVERY,
      PackageStatus.DELIVERED
    ];
    
    const currentIndex = statusOrder.indexOf(status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const getStatusColor = (status: PackageStatus): string => {
    switch (status) {
      case PackageStatus.CREATED:
      case PackageStatus.CONFIRMED:
        return 'bg-blue-500';
      case PackageStatus.PICKED_UP:
      case PackageStatus.IN_TRANSIT:
        return 'bg-yellow-500';
      case PackageStatus.OUT_FOR_DELIVERY:
        return 'bg-orange-500';
      case PackageStatus.DELIVERED:
        return 'bg-green-500';
      case PackageStatus.CANCELLED:
      case PackageStatus.FAILED_DELIVERY:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatStatus = (status: PackageStatus): string => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Package Not Found</h2>
            <p className="text-gray-600 mb-4">
              We couldn't find a package with tracking number: {trackingId}
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Package Tracking</h1>
              <p className="text-gray-600">Track your package in real-time</p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {packageData.trackingNumber}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Package Status
                  </CardTitle>
                  <Badge className={getStatusColor(packageData.status)}>
                    {formatStatus(packageData.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(getStatusProgress(packageData.status))}%</span>
                    </div>
                    <Progress value={getStatusProgress(packageData.status)} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Estimated Delivery</p>
                        <p className="text-sm text-gray-600">
                          {formatDateTime(packageData.delivery.estimatedDelivery)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Current Location</p>
                        <p className="text-sm text-gray-600">
                          {packageData.timeline[packageData.timeline.length - 1]?.location || 'In Transit'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Live Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
                  {/* Mock Map Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100"></div>
                  
                  {/* Route Line */}
                  <svg className="absolute inset-0 w-full h-full">
                    <path
                      d="M 50 200 Q 150 100 250 150 Q 350 200 450 120"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="5,5"
                    />
                  </svg>
                  
                  {/* Pickup Location */}
                  <div className="absolute top-4 left-4 bg-green-500 rounded-full p-2">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  
                  {/* Current Location (Animated) */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75"></div>
                      <div className="relative inline-flex rounded-full h-6 w-6 bg-blue-600 items-center justify-center">
                        <Truck className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Destination */}
                  <div className="absolute bottom-4 right-4 bg-red-500 rounded-full p-2">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className="text-center z-10">
                    <p className="text-gray-600 mb-2">Live GPS Tracking</p>
                    <p className="text-sm text-gray-500">
                      Last updated: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {packageData.timeline.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`rounded-full p-2 ${
                          index === packageData.timeline.length - 1 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-green-500 text-white'
                        }`}>
                          {index === packageData.timeline.length - 1 ? (
                            <Circle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </div>
                        {index < packageData.timeline.length - 1 && (
                          <div className="w-px h-8 bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{formatStatus(event.status)}</h4>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{event.location}</p>
                        {event.notes && (
                          <p className="text-sm text-gray-500 mt-1">{event.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Info */}
            {driver && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Your Driver
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={driver.avatar} alt={driver.name} />
                        <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{driver.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">{driver.rating}</span>
                          <span className="text-sm text-gray-500">
                            ({driver.totalDeliveries} deliveries)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.licensePlate})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{driver.phone}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Mail className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Package Details */}
            <Card>
              <CardHeader>
                <CardTitle>Package Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{packageData.packageDetails.description}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Weight:</span>
                      <p className="font-medium">{packageData.packageDetails.weight} kg</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Value:</span>
                      <p className="font-medium">${packageData.packageDetails.value}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-medium capitalize">{packageData.packageDetails.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Priority:</span>
                      <p className="font-medium capitalize">{packageData.delivery.priority}</p>
                    </div>
                  </div>
                  
                  {packageData.packageDetails.fragile && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">Fragile Item</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Instructions */}
            {packageData.delivery.instructions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Delivery Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{packageData.delivery.instructions}</p>
                </CardContent>
              </Card>
            )}

            {/* Delivery Addresses */}
            <Card>
              <CardHeader>
                <CardTitle>Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-1">FROM</h4>
                    <p className="text-sm font-medium">{packageData.sender.name}</p>
                    <p className="text-sm text-gray-600">
                      {packageData.sender.address.street}<br />
                      {packageData.sender.address.city}, {packageData.sender.address.state} {packageData.sender.address.zipCode}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-1">TO</h4>
                    <p className="text-sm font-medium">{packageData.receiver.name}</p>
                    <p className="text-sm text-gray-600">
                      {packageData.receiver.address.street}<br />
                      {packageData.receiver.address.city}, {packageData.receiver.address.state} {packageData.receiver.address.zipCode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}