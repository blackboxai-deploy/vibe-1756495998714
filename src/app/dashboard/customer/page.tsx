'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Package, Plus, MapPin, Clock, DollarSign, Truck, Search, Filter, Eye, Star, Bell } from 'lucide-react';
import { PackageStatus, DeliveryType, DeliveryPriority, PackageCategory, PaymentMethod } from '@/types';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { packages, createPackage, getPackagesByUser, isLoading } = useApp();
  const [userPackages, setUserPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);

  // Package creation form state
  const [packageForm, setPackageForm] = useState({
    sender: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      }
    },
    receiver: {
      name: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      }
    },
    packageDetails: {
      category: PackageCategory.OTHER,
      weight: 1,
      dimensions: { length: 10, width: 10, height: 10 },
      value: 0,
      description: '',
      fragile: false,
      insurance: false
    },
    delivery: {
      type: DeliveryType.STANDARD,
      priority: DeliveryPriority.MEDIUM,
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      instructions: ''
    },
    payment: {
      method: PaymentMethod.CREDIT_CARD,
      amount: 0,
      currency: 'USD',
      status: 'pending' as any,
      breakdown: {
        basePrice: 15.00,
        distanceFee: 5.00,
        weightFee: 2.50,
        priorityFee: 0,
        insuranceFee: 0,
        serviceFee: 1.50,
        tax: 0,
        discount: 0,
        total: 24.00
      }
    }
  });

  useEffect(() => {
    if (user) {
      const filteredPackages = getPackagesByUser(user.email, user.role);
      setUserPackages(filteredPackages);
    }
  }, [user, packages, getPackagesByUser]);

  const filteredPackages = userPackages.filter(pkg => {
    const matchesSearch = pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.receiver.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case PackageStatus.DELIVERED: return 'bg-green-500';
      case PackageStatus.IN_TRANSIT: return 'bg-blue-500';
      case PackageStatus.OUT_FOR_DELIVERY: return 'bg-orange-500';
      case PackageStatus.PICKED_UP: return 'bg-yellow-500';
      case PackageStatus.CANCELLED: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusProgress = (status) => {
    switch (status) {
      case PackageStatus.CREATED: return 10;
      case PackageStatus.CONFIRMED: return 25;
      case PackageStatus.PICKED_UP: return 40;
      case PackageStatus.IN_TRANSIT: return 60;
      case PackageStatus.OUT_FOR_DELIVERY: return 80;
      case PackageStatus.DELIVERED: return 100;
      default: return 0;
    }
  };

  const calculatePrice = () => {
    const { packageDetails, delivery } = packageForm;
    let basePrice = 15.00;
    let weightFee = Math.max(0, (packageDetails.weight - 1) * 2.50);
    let priorityFee = delivery.priority === DeliveryPriority.HIGH ? 5.00 : 
                     delivery.priority === DeliveryPriority.URGENT ? 10.00 : 0;
    let insuranceFee = packageDetails.insurance ? packageDetails.value * 0.02 : 0;
    let serviceFee = 1.50;
    let subtotal = basePrice + weightFee + priorityFee + insuranceFee + serviceFee;
    let tax = subtotal * 0.08;
    let total = subtotal + tax;

    return {
      basePrice,
      distanceFee: 5.00,
      weightFee,
      priorityFee,
      insuranceFee,
      serviceFee,
      tax,
      discount: 0,
      total
    };
  };

  const handleCreatePackage = async () => {
    try {
      const pricing = calculatePrice();
      const packageData = {
        ...packageForm,
        payment: {
          ...packageForm.payment,
          breakdown: pricing,
          amount: pricing.total
        },
        delivery: {
          ...packageForm.delivery,
          estimatedDelivery: new Date(Date.now() + 86400000).toISOString()
        },
        status: PackageStatus.CREATED
      };

      await createPackage(packageData);
      setIsCreateDialogOpen(false);
      // Reset form
      setPackageForm({
        ...packageForm,
        receiver: { name: '', phone: '', email: '', address: { street: '', city: '', state: '', zipCode: '', country: 'USA' } },
        packageDetails: { category: PackageCategory.OTHER, weight: 1, dimensions: { length: 10, width: 10, height: 10 }, value: 0, description: '', fragile: false, insurance: false }
      });
    } catch (error) {
      console.error('Failed to create package:', error);
    }
  };

  const openTrackingDialog = (pkg) => {
    setSelectedPackage(pkg);
    setIsTrackingDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Manage your packages and shipments.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Packages</p>
                  <p className="text-2xl font-bold text-gray-900">{userPackages.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Transit</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {userPackages.filter(p => p.status === PackageStatus.IN_TRANSIT).length}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">
                    {userPackages.filter(p => p.status === PackageStatus.DELIVERED).length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${userPackages.reduce((sum, p) => sum + p.payment.amount, 0).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="packages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="packages">My Packages</TabsTrigger>
            <TabsTrigger value="create">Send Package</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="packages" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by tracking number or recipient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value={PackageStatus.CREATED}>Created</SelectItem>
                      <SelectItem value={PackageStatus.IN_TRANSIT}>In Transit</SelectItem>
                      <SelectItem value={PackageStatus.OUT_FOR_DELIVERY}>Out for Delivery</SelectItem>
                      <SelectItem value={PackageStatus.DELIVERED}>Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Packages List */}
            <div className="space-y-4">
              {filteredPackages.map((pkg) => (
                <Card key={pkg.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{pkg.trackingNumber}</h3>
                          <Badge className={`${getStatusColor(pkg.status)} text-white`}>
                            {pkg.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>To: {pkg.receiver.name}, {pkg.receiver.address.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Created: {new Date(pkg.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>Amount: ${pkg.payment.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span>Weight: {pkg.packageDetails.weight} kg</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Delivery Progress</span>
                            <span className="text-sm text-gray-600">{getStatusProgress(pkg.status)}%</span>
                          </div>
                          <Progress value={getStatusProgress(pkg.status)} className="h-2" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTrackingDialog(pkg)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Track
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredPackages.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria.'
                        : 'You haven\'t sent any packages yet. Create your first shipment!'}
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Send Package
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send a New Package</CardTitle>
                <CardDescription>Fill in the details to create a new shipment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sender Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sender Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sender-name">Full Name</Label>
                      <Input
                        id="sender-name"
                        value={packageForm.sender.name}
                        onChange={(e) => setPackageForm({
                          ...packageForm,
                          sender: { ...packageForm.sender, name: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sender-phone">Phone Number</Label>
                      <Input
                        id="sender-phone"
                        value={packageForm.sender.phone}
                        onChange={(e) => setPackageForm({
                          ...packageForm,
                          sender: { ...packageForm.sender, phone: e.target.value }
                        })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="sender-address">Address</Label>
                      <Input
                        id="sender-address"
                        placeholder="Street address"
                        value={packageForm.sender.address.street}
                        onChange={(e) => setPackageForm({
                          ...packageForm,
                          sender: {
                            ...packageForm.sender,
                            address: { ...packageForm.sender.address, street: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sender-city">City</Label>
                      <Input
                        id="sender-city"
                        value={packageForm.sender.address.city}
                        onChange={(e) => setPackageForm({
                          ...packageForm,
                          sender: {
                            ...packageForm.sender,
                            address: { ...packageForm.sender.address, city: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sender-zip">ZIP Code</Label>
                      <Input
                        id="sender-zip"
                        value={packageForm.sender.address.zipCode}
                        onChange={(e) => setPackageForm({
                          ...packageForm,
                          sender: {
                            ...packageForm.sender,
                            address: { ...packageForm.sender.address, zipCode: e.target.value }
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Receiver Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Receiver Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="receiver-name">Full Name</Label>
                      <Input
                        id="receiver-name"
                        value={packageForm.receiver.name}
                        onChange={(e) => setPackageForm({
                          ...packageForm,
                          receiver: { ...packageForm.receiver, name: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="receiver-phone">Phone Number</Label>
                      <Input
                        id="receiver-phone"
                        value={packageForm.receiver.phone}
                        onChange={(e) => setPackageForm({
                          ...packageForm,
                          receiver: { ...packageForm.receiver, phone: e.target.value }
                        })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="receiver-address">Address</Label>
                      <Input
                        id="receiver-address"
                        placeholder="Street address"
                        value={packageForm.receiver.address.street}
                        onChange={(e) => setPackageForm({
                          ...packageForm,
                          receiver: {
                            ...packageForm.receiver,
                            address: { ...packageForm.receiver.address, street: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="receiver-city">City</Label>
                      <Input
                        id="receiver-city"
                        value={packageForm.receiver.address.city}
                        onChange={(e) => setPackageForm({
                          ...packageForm,
                          receiver: {
                            ...packageForm.receiver,
                            address: { ...packageForm.receiver.address, city: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="receiver-zip">ZIP Code</Label>
                      <Input
                        id="receiver-zip"
                        value={packageForm.receiver.address.zipCode}
                        onChange={(e) => setPackageForm({
                          ...packageForm,
                          receiver: {
                            ...packageForm.receiver,
                            address: { ...packageForm.receiver.address, zipCode: e.target.value }
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Package Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Package Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={packageForm.packageDetails.category}
                        onValueChange={(value) => setPackageForm({
                          ...packageForm,
                          packageDetails: { ...packageForm.packageDetails, category: value as PackageCategory }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={PackageCategory.DOCUMENTS}>Documents</SelectItem>
                          <SelectItem value={PackageCategory.ELECTRONICS}>Electronics</SelectItem>
                          <SelectItem value={PackageCategory.CLOTHING}>Clothing</SelectItem>
                          <SelectItem value={PackageCategory.FOOD}>Food</SelectItem>
                          <SelectItem value={PackageCategory.FRAGILE}>Fragile Items</SelectItem>
                          <SelectItem value={PackageCategory.OTHER}>Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={packageForm.packageDetails.weight}
                        onChange={(e) => setPackageForm({
                          ...packageForm,
                          packageDetails: { ...packageForm.packageDetails, weight: parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="value">Declared Value ($)</Label>
                      <Input
                        id="value"
                        type="number"
                        min="0"
                        value={packageForm.packageDetails.value}
                        onChange={(e) => setPackageForm({
                          ...packageForm,
                          packageDetails: { ...packageForm.packageDetails, value: parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={packageForm.delivery.priority}
                        onValueChange={(value) => setPackageForm({
                          ...packageForm,
                          delivery: { ...packageForm.delivery, priority: value as DeliveryPriority }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={DeliveryPriority.LOW}>Standard</SelectItem>
                          <SelectItem value={DeliveryPriority.MEDIUM}>Express</SelectItem>
                          <SelectItem value={DeliveryPriority.HIGH}>Priority</SelectItem>
                          <SelectItem value={DeliveryPriority.URGENT}>Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of package contents"
                        value={packageForm.packageDetails.description}
                        onChange={(e) => setPackageForm({
                          ...packageForm,
                          packageDetails: { ...packageForm.packageDetails, description: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Price Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Price Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {(() => {
                      const pricing = calculatePrice();
                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Base Price:</span>
                            <span>${pricing.basePrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Distance Fee:</span>
                            <span>${pricing.distanceFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Weight Fee:</span>
                            <span>${pricing.weightFee.toFixed(2)}</span>
                          </div>
                          {pricing.priorityFee > 0 && (
                            <div className="flex justify-between">
                              <span>Priority Fee:</span>
                              <span>${pricing.priorityFee.toFixed(2)}</span>
                            </div>
                          )}
                          {pricing.insuranceFee > 0 && (
                            <div className="flex justify-between">
                              <span>Insurance Fee:</span>
                              <span>${pricing.insuranceFee.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Service Fee:</span>
                            <span>${pricing.serviceFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>${pricing.tax.toFixed(2)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total:</span>
                            <span>${pricing.total.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePackage} disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Package'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Manage your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input id="profile-name" value={user?.name || ''} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="profile-email">Email</Label>
                    <Input id="profile-email" value={user?.email || ''} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="profile-phone">Phone</Label>
                    <Input id="profile-phone" value={user?.phone || ''} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="profile-role">Account Type</Label>
                    <Input id="profile-role" value={user?.role || ''} readOnly />
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="outline">Edit Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Package Tracking Dialog */}
        <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Package Tracking</DialogTitle>
              <DialogDescription>
                Track your package: {selectedPackage?.trackingNumber}
              </DialogDescription>
            </DialogHeader>
            {selectedPackage && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">From:</span>
                    <p>{selectedPackage.sender.name}</p>
                    <p>{selectedPackage.sender.address.city}, {selectedPackage.sender.address.state}</p>
                  </div>
                  <div>
                    <span className="font-medium">To:</span>
                    <p>{selectedPackage.receiver.name}</p>
                    <p>{selectedPackage.receiver.address.city}, {selectedPackage.receiver.address.state}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Tracking Timeline</h4>
                  <div className="space-y-4">
                    {selectedPackage.timeline.map((event, index) => (
                      <div key={event.id} className="flex items-start gap-4">
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {event.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {event.location && (
                            <p className="text-sm text-gray-600">{event.location}</p>
                          )}
                          {event.notes && (
                            <p className="text-sm text-gray-600">{event.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}