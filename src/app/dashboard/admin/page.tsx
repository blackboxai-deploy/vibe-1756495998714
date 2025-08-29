'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Truck, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  RefreshCw,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { UserRole, PackageStatus, UserStatus } from '@/types';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { 
    packages, 
    drivers, 
    analytics, 
    refreshAnalytics, 
    updatePackageStatus, 
    assignPackageToDriver,
    isLoading 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      refreshAnalytics();
    }
  }, [user, refreshAnalytics]);

  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.receiver.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case PackageStatus.IN_TRANSIT:
        return 'bg-blue-100 text-blue-800';
      case PackageStatus.OUT_FOR_DELIVERY:
        return 'bg-yellow-100 text-yellow-800';
      case PackageStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssignDriver = async (packageId: string, driverId: string) => {
    try {
      await assignPackageToDriver(packageId, driverId);
      setIsAssignDialogOpen(false);
    } catch (error) {
      console.error('Failed to assign driver:', error);
    }
  };

  const handleStatusUpdate = async (packageId: string, newStatus: PackageStatus) => {
    try {
      await updatePackageStatus(packageId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your delivery operations</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={refreshAnalytics} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.packages.total}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.packages.deliverySuccessRate}% success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.drivers.active}</div>
                <p className="text-xs text-muted-foreground">
                  of {analytics.drivers.total} total drivers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.revenue.today.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  ${analytics.revenue.thisMonth.toFixed(2)} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.customer.total}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.customer.new} new this month
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="packages" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Package Management</CardTitle>
                <CardDescription>Monitor and manage all package deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search packages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value={PackageStatus.CREATED}>Created</SelectItem>
                      <SelectItem value={PackageStatus.IN_TRANSIT}>In Transit</SelectItem>
                      <SelectItem value={PackageStatus.OUT_FOR_DELIVERY}>Out for Delivery</SelectItem>
                      <SelectItem value={PackageStatus.DELIVERED}>Delivered</SelectItem>
                      <SelectItem value={PackageStatus.CANCELLED}>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Packages Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tracking Number</TableHead>
                        <TableHead>Sender</TableHead>
                        <TableHead>Receiver</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPackages.map((pkg) => (
                        <TableRow key={pkg.id}>
                          <TableCell className="font-medium">{pkg.trackingNumber}</TableCell>
                          <TableCell>{pkg.sender.name}</TableCell>
                          <TableCell>{pkg.receiver.name}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(pkg.status)}>
                              {pkg.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {pkg.driverId ? (
                              drivers.find(d => d.id === pkg.driverId)?.name || 'Unknown'
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPackage(pkg);
                                  setIsAssignDialogOpen(true);
                                }}
                              >
                                Assign
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>{new Date(pkg.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Select onValueChange={(value) => handleStatusUpdate(pkg.id, value as PackageStatus)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Update" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={PackageStatus.PICKED_UP}>Picked Up</SelectItem>
                                  <SelectItem value={PackageStatus.IN_TRANSIT}>In Transit</SelectItem>
                                  <SelectItem value={PackageStatus.OUT_FOR_DELIVERY}>Out for Delivery</SelectItem>
                                  <SelectItem value={PackageStatus.DELIVERED}>Delivered</SelectItem>
                                  <SelectItem value={PackageStatus.CANCELLED}>Cancel</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Driver Management</CardTitle>
                <CardDescription>Manage driver accounts and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Deliveries</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell className="font-medium">{driver.name}</TableCell>
                          <TableCell>{driver.email}</TableCell>
                          <TableCell>{driver.phone}</TableCell>
                          <TableCell>
                            <Badge className={driver.availability.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {driver.availability.isOnline ? 'Online' : 'Offline'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span>{driver.rating.toFixed(1)}</span>
                              <span className="text-yellow-500">★</span>
                            </div>
                          </TableCell>
                          <TableCell>{driver.totalDeliveries}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Package Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Delivered</span>
                        <span>{analytics.packages.delivered}</span>
                      </div>
                      <Progress value={(analytics.packages.delivered / analytics.packages.total) * 100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>In Transit</span>
                        <span>{analytics.packages.inTransit}</span>
                      </div>
                      <Progress value={(analytics.packages.inTransit / analytics.packages.total) * 100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Pending</span>
                        <span>{analytics.packages.pending}</span>
                      </div>
                      <Progress value={(analytics.packages.pending / analytics.packages.total) * 100} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">This Week</p>
                        <p className="text-2xl font-bold">${analytics.revenue.thisWeek.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold">${analytics.revenue.thisMonth.toFixed(2)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Order Value</p>
                      <p className="text-xl font-semibold">${analytics.revenue.averageOrderValue.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Driver Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Rating</span>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{analytics.drivers.averageRating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Deliveries</span>
                      <span className="font-semibold">{analytics.drivers.totalDeliveries}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Drivers</span>
                      <span className="font-semibold">{analytics.drivers.active}/{analytics.drivers.total}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Customer Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Customers</span>
                      <span className="font-semibold">{analytics.customer.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Customers</span>
                      <span className="font-semibold">{analytics.customer.active}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Retention Rate</span>
                      <span className="font-semibold">{analytics.customer.retention}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Avg Orders/Customer</span>
                      <span className="font-semibold">{analytics.customer.averageOrdersPerCustomer}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="base-price">Base Delivery Price ($)</Label>
                  <Input id="base-price" type="number" defaultValue="15.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distance-rate">Distance Rate ($/km)</Label>
                  <Input id="distance-rate" type="number" defaultValue="1.50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight-rate">Weight Rate ($/kg)</Label>
                  <Input id="weight-rate" type="number" defaultValue="2.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-fee">Service Fee (%)</Label>
                  <Input id="service-fee" type="number" defaultValue="5" />
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Assign Driver Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Driver</DialogTitle>
              <DialogDescription>
                Select a driver for package {selectedPackage?.trackingNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select onValueChange={(driverId) => handleAssignDriver(selectedPackage?.id, driverId)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.filter(d => d.availability.isOnline).map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} - Rating: {driver.rating.toFixed(1)}★
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}