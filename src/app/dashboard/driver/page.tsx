'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
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
  Package, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Navigation, 
  Phone, 
  Camera,
  CheckCircle,
  AlertCircle,
  Route,
  TrendingUp,
  Calendar,
  User
} from 'lucide-react';
import { PackageStatus, UserRole } from '@/types';

export default function DriverDashboard() {
  const { user } = useAuth();
  const { packages, getPackagesByUser, updatePackageStatus, optimizeRoute } = useApp();
  const [isOnline, setIsOnline] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);

  // Mock driver data
  const driverData = {
    id: user?.id || '2',
    name: user?.name || 'Mike Johnson',
    rating: 4.8,
    totalDeliveries: 1247,
    todayDeliveries: 8,
    earnings: {
      today: 156.75,
      thisWeek: 892.50,
      thisMonth: 3420.25,
      pending: 45.50
    },
    vehicle: {
      type: 'Van',
      licensePlate: 'KX-2024',
      capacity: '500kg'
    }
  };

  const driverPackages = getPackagesByUser(user?.id || '2', UserRole.DRIVER);
  const activePackages = driverPackages.filter(pkg => 
    [PackageStatus.PICKED_UP, PackageStatus.IN_TRANSIT, PackageStatus.OUT_FOR_DELIVERY].includes(pkg.status)
  );

  const handleStatusUpdate = async (packageId: string, status: PackageStatus) => {
    try {
      await updatePackageStatus(packageId, status, 'Current Location', 'Updated by driver');
    } catch (error) {
      console.error('Failed to update package status:', error);
    }
  };

  const handleOptimizeRoute = async () => {
    if (selectedPackages.length === 0) return;
    
    try {
      await optimizeRoute(user?.id || '2', selectedPackages);
      setSelectedPackages([]);
    } catch (error) {
      console.error('Failed to optimize route:', error);
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

  const getNextStatus = (currentStatus: PackageStatus): PackageStatus | null => {
    switch (currentStatus) {
      case PackageStatus.PICKED_UP:
        return PackageStatus.IN_TRANSIT;
      case PackageStatus.IN_TRANSIT:
        return PackageStatus.OUT_FOR_DELIVERY;
      case PackageStatus.OUT_FOR_DELIVERY:
        return PackageStatus.DELIVERED;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
            <p className="text-gray-600">Welcome back, {driverData.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Online Status</span>
              <Switch checked={isOnline} onCheckedChange={setIsOnline} />
              <Badge variant={isOnline ? "default" : "secondary"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>{driverData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${driverData.earnings.today}</div>
              <p className="text-xs text-muted-foreground">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deliveries Today</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{driverData.todayDeliveries}</div>
              <p className="text-xs text-muted-foreground">
                {activePackages.length} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{driverData.rating}</div>
              <p className="text-xs text-muted-foreground">
                Based on {driverData.totalDeliveries} deliveries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${driverData.earnings.pending}</div>
              <p className="text-xs text-muted-foreground">
                Will be paid tomorrow
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="deliveries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deliveries">Active Deliveries</TabsTrigger>
            <TabsTrigger value="route">Route Planning</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Active Deliveries Tab */}
          <TabsContent value="deliveries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Active Deliveries ({activePackages.length})
                </CardTitle>
                <CardDescription>
                  Manage your current delivery assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {activePackages.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No active deliveries</p>
                      </div>
                    ) : (
                      activePackages.map((pkg) => {
                        const nextStatus = getNextStatus(pkg.status);
                        return (
                          <Card key={pkg.id} className="border-l-4" style={{ borderLeftColor: getStatusColor(pkg.status).replace('bg-', '#') }}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge className={getStatusColor(pkg.status)}>
                                      {pkg.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    <span className="font-mono text-sm">{pkg.trackingNumber}</span>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm">
                                      <User className="h-4 w-4" />
                                      <span>{pkg.receiver.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <MapPin className="h-4 w-4" />
                                      <span>{pkg.receiver.address.street}, {pkg.receiver.address.city}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Phone className="h-4 w-4" />
                                      <span>{pkg.receiver.phone}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="font-medium">${pkg.payment.amount}</span>
                                    <span className="text-gray-500">{pkg.packageDetails.weight}kg</span>
                                    <Badge variant="outline">{pkg.delivery.priority}</Badge>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                  {nextStatus && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusUpdate(pkg.id, nextStatus)}
                                      className="whitespace-nowrap"
                                    >
                                      {nextStatus === PackageStatus.DELIVERED ? (
                                        <>
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          Mark Delivered
                                        </>
                                      ) : (
                                        <>
                                          <Navigation className="h-4 w-4 mr-1" />
                                          Update Status
                                        </>
                                      )}
                                    </Button>
                                  )}
                                  
                                  <Button variant="outline" size="sm">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    Navigate
                                  </Button>
                                  
                                  <Button variant="outline" size="sm">
                                    <Phone className="h-4 w-4 mr-1" />
                                    Call
                                  </Button>
                                </div>
                              </div>

                              {pkg.delivery.instructions && (
                                <div className="mt-3 p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
                                  <p className="text-sm text-yellow-800">
                                    <strong>Instructions:</strong> {pkg.delivery.instructions}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Route Planning Tab */}
          <TabsContent value="route" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Route Optimization
                </CardTitle>
                <CardDescription>
                  Plan and optimize your delivery routes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Select packages for route optimization:</span>
                  <Button 
                    onClick={handleOptimizeRoute}
                    disabled={selectedPackages.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Route className="h-4 w-4" />
                    Optimize Route ({selectedPackages.length})
                  </Button>
                </div>

                <div className="grid gap-3">
                  {activePackages.map((pkg) => (
                    <div key={pkg.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectedPackages.includes(pkg.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPackages([...selectedPackages, pkg.id]);
                          } else {
                            setSelectedPackages(selectedPackages.filter(id => id !== pkg.id));
                          }
                        }}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{pkg.trackingNumber}</span>
                          <Badge variant="outline">{pkg.status.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {pkg.receiver.address.street}, {pkg.receiver.address.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{pkg.receiver.name}</p>
                        <p className="text-xs text-gray-500">{pkg.delivery.priority} priority</p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPackages.length === 0 && (
                  <div className="text-center py-8">
                    <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select packages to optimize your route</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Earnings Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Today</span>
                      <span className="font-medium">${driverData.earnings.today}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">This Week</span>
                      <span className="font-medium">${driverData.earnings.thisWeek}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-medium">${driverData.earnings.thisMonth}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="font-medium text-yellow-600">${driverData.earnings.pending}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Delivery Success Rate</span>
                        <span>98%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>On-Time Delivery</span>
                        <span>95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Customer Rating</span>
                        <span>{driverData.rating}/5.0</span>
                      </div>
                      <Progress value={(driverData.rating / 5) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Driver Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="text-lg">
                        {driverData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{driverData.name}</h3>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                      <p className="text-sm text-gray-600">{user?.phone}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Driver ID</span>
                      <span className="font-medium">{driverData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Deliveries</span>
                      <span className="font-medium">{driverData.totalDeliveries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Member Since</span>
                      <span className="font-medium">Jan 2024</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Vehicle Type</span>
                      <span className="font-medium">{driverData.vehicle.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">License Plate</span>
                      <span className="font-medium">{driverData.vehicle.licensePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Capacity</span>
                      <span className="font-medium">{driverData.vehicle.capacity}</span>
                    </div>
                  </div>

                  <Separator />

                  <Button className="w-full">
                    Update Vehicle Info
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}