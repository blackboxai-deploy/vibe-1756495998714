'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Package, 
  Star, 
  Navigation, 
  Phone,
  Camera,
  CheckCircle,
  AlertCircle,
  Route,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Package as PackageType, PackageStatus, Driver } from '@/types';

interface DriverStats {
  todayDeliveries: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  rating: number;
  completionRate: number;
  totalDeliveries: number;
}

interface ActiveDelivery extends PackageType {
  estimatedArrival: string;
  distance: number;
  customerPhone: string;
}

export default function DriverDashboard() {
  const { user } = useAuth();
  const { packages, updatePackageStatus, updateDriverLocation } = useApp();
  const [isOnline, setIsOnline] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [selectedDelivery, setSelectedDelivery] = useState<ActiveDelivery | null>(null);

  // Mock driver stats
  const [driverStats] = useState<DriverStats>({
    todayDeliveries: 8,
    todayEarnings: 156.50,
    weeklyEarnings: 892.75,
    monthlyEarnings: 3247.80,
    rating: 4.8,
    completionRate: 96.5,
    totalDeliveries: 1247
  });

  // Get driver's assigned packages
  const assignedPackages = packages.filter(pkg => 
    pkg.driverId === user?.id && 
    [PackageStatus.PICKED_UP, PackageStatus.IN_TRANSIT, PackageStatus.OUT_FOR_DELIVERY].includes(pkg.status)
  );

  // Mock active deliveries with additional driver-specific data
  const activeDeliveries: ActiveDelivery[] = assignedPackages.map(pkg => ({
    ...pkg,
    estimatedArrival: new Date(Date.now() + Math.random() * 3600000).toISOString(),
    distance: Math.round(Math.random() * 15 + 1),
    customerPhone: pkg.receiver.phone
  }));

  // Update driver location periodically
  useEffect(() => {
    if (isOnline && user?.id) {
      const interval = setInterval(() => {
        const newLocation = {
          lat: currentLocation.lat + (Math.random() - 0.5) * 0.01,
          lng: currentLocation.lng + (Math.random() - 0.5) * 0.01
        };
        setCurrentLocation(newLocation);
        updateDriverLocation(user.id, newLocation);
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isOnline, user?.id, currentLocation, updateDriverLocation]);

  const handleStatusUpdate = async (packageId: string, status: PackageStatus) => {
    try {
      await updatePackageStatus(packageId, status, 'Current Location', 'Updated by driver');
    } catch (error) {
      console.error('Failed to update package status:', error);
    }
  };

  const handleDeliveryComplete = async (packageId: string) => {
    try {
      await updatePackageStatus(packageId, PackageStatus.DELIVERED, 'Delivered to customer', 'Package delivered successfully');
      setSelectedDelivery(null);
    } catch (error) {
      console.error('Failed to complete delivery:', error);
    }
  };

  const getStatusColor = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.PICKED_UP:
        return 'bg-blue-500';
      case PackageStatus.IN_TRANSIT:
        return 'bg-yellow-500';
      case PackageStatus.OUT_FOR_DELIVERY:
        return 'bg-orange-500';
      case PackageStatus.DELIVERED:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: PackageStatus) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Online Status</span>
              <Switch
                checked={isOnline}
                onCheckedChange={setIsOnline}
              />
              <Badge variant={isOnline ? "default" : "secondary"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            <Avatar>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{driverStats.todayDeliveries}</div>
              <p className="text-xs text-muted-foreground">
                +2 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${driverStats.todayEarnings}</div>
              <p className="text-xs text-muted-foreground">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{driverStats.rating}</div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= Math.floor(driverStats.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{driverStats.completionRate}%</div>
              <Progress value={driverStats.completionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Deliveries */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Active Deliveries ({activeDeliveries.length})</span>
                </CardTitle>
                <CardDescription>
                  Manage your current delivery assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {activeDeliveries.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No active deliveries</p>
                        <p className="text-sm text-gray-400">New deliveries will appear here</p>
                      </div>
                    ) : (
                      activeDeliveries.map((delivery) => (
                        <Card key={delivery.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Badge className={getStatusColor(delivery.status)}>
                                    {getStatusText(delivery.status)}
                                  </Badge>
                                  <span className="font-mono text-sm">
                                    {delivery.trackingNumber}
                                  </span>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2 text-sm">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{delivery.receiver.address.street}, {delivery.receiver.address.city}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span>ETA: {new Date(delivery.estimatedArrival).toLocaleTimeString()}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm">
                                    <Navigation className="h-4 w-4 text-gray-400" />
                                    <span>{delivery.distance} km away</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedDelivery(delivery)}
                                  >
                                    <MapPin className="h-4 w-4 mr-1" />
                                    Navigate
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(`tel:${delivery.customerPhone}`)}
                                  >
                                    <Phone className="h-4 w-4 mr-1" />
                                    Call
                                  </Button>
                                  {delivery.status === PackageStatus.OUT_FOR_DELIVERY && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleDeliveryComplete(delivery.id)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Complete
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="font-semibold">{delivery.receiver.name}</p>
                                <p className="text-sm text-gray-500">{delivery.receiver.phone}</p>
                                <p className="text-sm font-medium text-green-600 mt-1">
                                  ${delivery.payment.breakdown.total}
                                </p>
                              </div>
                            </div>

                            {delivery.delivery.instructions && (
                              <div className="mt-3 p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
                                <p className="text-sm">
                                  <strong>Instructions:</strong> {delivery.delivery.instructions}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Earnings Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Earnings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="font-semibold">${driverStats.weeklyEarnings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold">${driverStats.monthlyEarnings}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Deliveries</span>
                  <span className="font-semibold">{driverStats.totalDeliveries}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Route className="h-4 w-4 mr-2" />
                  Optimize Route
                </Button>
                <Button className="w-full" variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Schedule
                </Button>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>On-time Delivery</span>
                    <span>94%</span>
                  </div>
                  <Progress value={94} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Customer Rating</span>
                    <span>4.8/5</span>
                  </div>
                  <Progress value={96} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion Rate</span>
                    <span>{driverStats.completionRate}%</span>
                  </div>
                  <Progress value={driverStats.completionRate} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delivery Detail Modal */}
        {selectedDelivery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Delivery Details</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDelivery(null)}
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Information</h4>
                    <p><strong>Name:</strong> {selectedDelivery.receiver.name}</p>
                    <p><strong>Phone:</strong> {selectedDelivery.receiver.phone}</p>
                    <p><strong>Email:</strong> {selectedDelivery.receiver.email}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Package Information</h4>
                    <p><strong>Tracking:</strong> {selectedDelivery.trackingNumber}</p>
                    <p><strong>Weight:</strong> {selectedDelivery.packageDetails.weight} kg</p>
                    <p><strong>Value:</strong> ${selectedDelivery.packageDetails.value}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Delivery Address</h4>
                  <p>{selectedDelivery.receiver.address.street}</p>
                  <p>{selectedDelivery.receiver.address.city}, {selectedDelivery.receiver.address.state} {selectedDelivery.receiver.address.zipCode}</p>
                </div>

                {selectedDelivery.delivery.instructions && (
                  <div>
                    <h4 className="font-semibold mb-2">Special Instructions</h4>
                    <p className="p-3 bg-yellow-50 rounded border">
                      {selectedDelivery.delivery.instructions}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    className="flex-1"
                    onClick={() => window.open(`https://maps.google.com/maps?q=${selectedDelivery.receiver.address.street}, ${selectedDelivery.receiver.address.city}`)}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Open in Maps
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`tel:${selectedDelivery.customerPhone}`)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </Button>
                </div>

                {selectedDelivery.status === PackageStatus.OUT_FOR_DELIVERY && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handleDeliveryComplete(selectedDelivery.id)}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Mark as Delivered
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}