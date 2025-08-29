'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Star,
  Bell,
  CreditCard,
  User,
  Phone,
  Mail,
  Calendar,
  Weight,
  Ruler,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Package as PackageType, PackageStatus, DeliveryType, DeliveryPriority, PackageCategory, PaymentMethod } from '@/types';

interface CustomerDashboardProps {
  className?: string;
}

export default function CustomerDashboard({ className }: CustomerDashboardProps) {
  const { user } = useAuth();
  const { packages, createPackage, getPackagesByUser, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);

  // Get user's packages
  const userPackages = user ? getPackagesByUser(user.email, user.role) : [];

  // Filter packages based on search and status
  const filteredPackages = userPackages.filter(pkg => {
    const matchesSearch = pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.receiver.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Package statistics
  const packageStats = {
    total: userPackages.length,
    delivered: userPackages.filter(p => p.status === PackageStatus.DELIVERED).length,
    inTransit: userPackages.filter(p => p.status === PackageStatus.IN_TRANSIT).length,
    pending: userPackages.filter(p => p.status === PackageStatus.CREATED).length,
  };

  const getStatusColor = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.DELIVERED:
        return 'bg-green-500';
      case PackageStatus.IN_TRANSIT:
        return 'bg-blue-500';
      case PackageStatus.OUT_FOR_DELIVERY:
        return 'bg-orange-500';
      case PackageStatus.PICKED_UP:
        return 'bg-yellow-500';
      case PackageStatus.CREATED:
        return 'bg-gray-500';
      case PackageStatus.CANCELLED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusProgress = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.CREATED:
        return 10;
      case PackageStatus.PICKED_UP:
        return 30;
      case PackageStatus.IN_TRANSIT:
        return 60;
      case PackageStatus.OUT_FOR_DELIVERY:
        return 85;
      case PackageStatus.DELIVERED:
        return 100;
      default:
        return 0;
    }
  };

  const formatStatus = (status: PackageStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const CreatePackageForm = () => {
    const [formData, setFormData] = useState({
      senderName: user?.name || '',
      senderPhone: user?.phone || '',
      senderEmail: user?.email || '',
      senderStreet: '',
      senderCity: '',
      senderState: '',
      senderZip: '',
      receiverName: '',
      receiverPhone: '',
      receiverEmail: '',
      receiverStreet: '',
      receiverCity: '',
      receiverState: '',
      receiverZip: '',
      category: PackageCategory.OTHER,
      weight: '',
      length: '',
      width: '',
      height: '',
      value: '',
      description: '',
      fragile: false,
      insurance: false,
      deliveryType: DeliveryType.STANDARD,
      priority: DeliveryPriority.MEDIUM,
      scheduledDate: '',
      instructions: '',
      paymentMethod: PaymentMethod.CREDIT_CARD
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
        const packageData = {
          sender: {
            name: formData.senderName,
            phone: formData.senderPhone,
            email: formData.senderEmail,
            address: {
              street: formData.senderStreet,
              city: formData.senderCity,
              state: formData.senderState,
              zipCode: formData.senderZip,
              country: 'USA',
              coordinates: { lat: 40.7128, lng: -74.0060 }
            }
          },
          receiver: {
            name: formData.receiverName,
            phone: formData.receiverPhone,
            email: formData.receiverEmail,
            address: {
              street: formData.receiverStreet,
              city: formData.receiverCity,
              state: formData.receiverState,
              zipCode: formData.receiverZip,
              country: 'USA',
              coordinates: { lat: 40.6892, lng: -73.9442 }
            }
          },
          packageDetails: {
            category: formData.category,
            weight: parseFloat(formData.weight) || 0,
            dimensions: {
              length: parseFloat(formData.length) || 0,
              width: parseFloat(formData.width) || 0,
              height: parseFloat(formData.height) || 0
            },
            value: parseFloat(formData.value) || 0,
            description: formData.description,
            fragile: formData.fragile,
            insurance: formData.insurance
          },
          delivery: {
            type: formData.deliveryType,
            priority: formData.priority,
            scheduledDate: formData.scheduledDate || new Date(Date.now() + 86400000).toISOString(),
            estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
            instructions: formData.instructions
          },
          payment: {
            method: formData.paymentMethod,
            amount: 25.99, // This would be calculated based on package details
            currency: 'USD',
            status: 'pending' as any,
            breakdown: {
              basePrice: 15.00,
              distanceFee: 5.00,
              weightFee: 2.50,
              priorityFee: 3.49,
              insuranceFee: formData.insurance ? 2.00 : 0,
              serviceFee: 1.50,
              tax: 2.08,
              discount: 0,
              total: 25.99
            }
          },
          status: PackageStatus.CREATED
        };

        await createPackage(packageData);
        setIsCreateDialogOpen(false);
        
        // Reset form
        setFormData({
          senderName: user?.name || '',
          senderPhone: user?.phone || '',
          senderEmail: user?.email || '',
          senderStreet: '',
          senderCity: '',
          senderState: '',
          senderZip: '',
          receiverName: '',
          receiverPhone: '',
          receiverEmail: '',
          receiverStreet: '',
          receiverCity: '',
          receiverState: '',
          receiverZip: '',
          category: PackageCategory.OTHER,
          weight: '',
          length: '',
          width: '',
          height: '',
          value: '',
          description: '',
          fragile: false,
          insurance: false,
          deliveryType: DeliveryType.STANDARD,
          priority: DeliveryPriority.MEDIUM,
          scheduledDate: '',
          instructions: '',
          paymentMethod: PaymentMethod.CREDIT_CARD
        });
      } catch (error) {
        console.error('Failed to create package:', error);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sender Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sender Information</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="senderName">Full Name</Label>
                <Input
                  id="senderName"
                  value={formData.senderName}
                  onChange={(e) => setFormData({...formData, senderName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="senderPhone">Phone</Label>
                <Input
                  id="senderPhone"
                  value={formData.senderPhone}
                  onChange={(e) => setFormData({...formData, senderPhone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="senderEmail">Email</Label>
                <Input
                  id="senderEmail"
                  type="email"
                  value={formData.senderEmail}
                  onChange={(e) => setFormData({...formData, senderEmail: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="senderStreet">Street Address</Label>
                <Input
                  id="senderStreet"
                  value={formData.senderStreet}
                  onChange={(e) => setFormData({...formData, senderStreet: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="senderCity">City</Label>
                  <Input
                    id="senderCity"
                    value={formData.senderCity}
                    onChange={(e) => setFormData({...formData, senderCity: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="senderState">State</Label>
                  <Input
                    id="senderState"
                    value={formData.senderState}
                    onChange={(e) => setFormData({...formData, senderState: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="senderZip">ZIP Code</Label>
                <Input
                  id="senderZip"
                  value={formData.senderZip}
                  onChange={(e) => setFormData({...formData, senderZip: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          {/* Receiver Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Receiver Information</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="receiverName">Full Name</Label>
                <Input
                  id="receiverName"
                  value={formData.receiverName}
                  onChange={(e) => setFormData({...formData, receiverName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="receiverPhone">Phone</Label>
                <Input
                  id="receiverPhone"
                  value={formData.receiverPhone}
                  onChange={(e) => setFormData({...formData, receiverPhone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="receiverEmail">Email</Label>
                <Input
                  id="receiverEmail"
                  type="email"
                  value={formData.receiverEmail}
                  onChange={(e) => setFormData({...formData, receiverEmail: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="receiverStreet">Street Address</Label>
                <Input
                  id="receiverStreet"
                  value={formData.receiverStreet}
                  onChange={(e) => setFormData({...formData, receiverStreet: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="receiverCity">City</Label>
                  <Input
                    id="receiverCity"
                    value={formData.receiverCity}
                    onChange={(e) => setFormData({...formData, receiverCity: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="receiverState">State</Label>
                  <Input
                    id="receiverState"
                    value={formData.receiverState}
                    onChange={(e) => setFormData({...formData, receiverState: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="receiverZip">ZIP Code</Label>
                <Input
                  id="receiverZip"
                  value={formData.receiverZip}
                  onChange={(e) => setFormData({...formData, receiverZip: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Package Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Package Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value as PackageCategory})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PackageCategory.DOCUMENTS}>Documents</SelectItem>
                  <SelectItem value={PackageCategory.ELECTRONICS}>Electronics</SelectItem>
                  <SelectItem value={PackageCategory.CLOTHING}>Clothing</SelectItem>
                  <SelectItem value={PackageCategory.FOOD}>Food</SelectItem>
                  <SelectItem value={PackageCategory.FRAGILE}>Fragile Items</SelectItem>
                  <SelectItem value={PackageCategory.BULK}>Bulk Items</SelectItem>
                  <SelectItem value={PackageCategory.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="length">Length (cm)</Label>
              <Input
                id="length"
                type="number"
                value={formData.length}
                onChange={(e) => setFormData({...formData, length: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="width">Width (cm)</Label>
              <Input
                id="width"
                type="number"
                value={formData.width}
                onChange={(e) => setFormData({...formData, width: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="value">Declared Value ($)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of the package contents"
              required
            />
          </div>
        </div>

        {/* Delivery Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Delivery Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deliveryType">Delivery Type</Label>
              <Select value={formData.deliveryType} onValueChange={(value) => setFormData({...formData, deliveryType: value as DeliveryType})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DeliveryType.STANDARD}>Standard (3-5 days)</SelectItem>
                  <SelectItem value={DeliveryType.EXPRESS}>Express (1-2 days)</SelectItem>
                  <SelectItem value={DeliveryType.SAME_DAY}>Same Day</SelectItem>
                  <SelectItem value={DeliveryType.SCHEDULED}>Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value as DeliveryPriority})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DeliveryPriority.LOW}>Low</SelectItem>
                  <SelectItem value={DeliveryPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={DeliveryPriority.HIGH}>High</SelectItem>
                  <SelectItem value={DeliveryPriority.URGENT}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="instructions">Delivery Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({...formData, instructions: e.target.value})}
              placeholder="Special delivery instructions (optional)"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payment Method</h3>
          <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value as PaymentMethod})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PaymentMethod.CREDIT_CARD}>Credit Card</SelectItem>
              <SelectItem value={PaymentMethod.DEBIT_CARD}>Debit Card</SelectItem>
              <SelectItem value={PaymentMethod.PAYPAL}>PayPal</SelectItem>
              <SelectItem value={PaymentMethod.DIGITAL_WALLET}>Digital Wallet</SelectItem>
              <SelectItem value={PaymentMethod.CASH_ON_DELIVERY}>Cash on Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Package'}
          </Button>
        </div>
      </form>
    );
  };

  const PackageTrackingDialog = ({ package: pkg }: { package: PackageType }) => {
    if (!pkg) return null;

    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Package Tracking - {pkg.trackingNumber}</DialogTitle>
          <DialogDescription>
            Real-time tracking information for your package
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Package Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{formatStatus(pkg.status)}</h3>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(pkg.updatedAt).toLocaleString()}
              </p>
            </div>
            <Badge className={getStatusColor(pkg.status)}>
              {formatStatus(pkg.status)}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{getStatusProgress(pkg.status)}%</span>
            </div>
            <Progress value={getStatusProgress(pkg.status)} className="h-2" />
          </div>

          {/* Package Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">From</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="font-medium">{pkg.sender.name}</p>
                <p className="text-sm text-muted-foreground">{pkg.sender.phone}</p>
                <p className="text-sm text-muted-foreground">
                  {pkg.sender.address.street}, {pkg.sender.address.city}, {pkg.sender.address.state} {pkg.sender.address.zipCode}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">To</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="font-medium">{pkg.receiver.name}</p>
                <p className="text-sm text-muted-foreground">{pkg.receiver.phone}</p>
                <p className="text-sm text-muted-foreground">
                  {pkg.receiver.address.street}, {pkg.receiver.address.city}, {pkg.receiver.address.state} {pkg.receiver.address.zipCode}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h4 className="font-semibold">Tracking Timeline</h4>
            <ScrollArea className="h-48">
              <div className="space-y-4">
                {pkg.timeline.map((event, index) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${getStatusColor(event.status)}`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{formatStatus(event.status)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                      {event.location && (
                        <p className="text-xs text-muted-foreground flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </p>
                      )}
                      {event.notes && (
                        <p className="text-xs text-muted-foreground">{event.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Estimated Delivery */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Estimated Delivery</span>
                </div>
                <span className="font-medium">
                  {new Date(pkg.delivery.estimatedDelivery).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Manage your packages and shipments.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Send Package</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Send a New Package</DialogTitle>
              <DialogDescription>
                Fill in the details below to send your package with KingX.
              </DialogDescription>
            </DialogHeader>
            <CreatePackageForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="packages">My Packages</TabsTrigger>
          <TabsTrigger value="tracking">Quick Track</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{packageStats.total}</div>
                <p className="text-xs text-muted-foreground">All time shipments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{packageStats.inTransit}</div>
                <p className="text-xs text-muted-foreground">Currently shipping</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{packageStats.delivered}</div>
                <p className="text-xs text-muted-foreground">Successfully delivered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{packageStats.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting pickup</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Packages */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Packages</CardTitle>
              <CardDescription>Your latest shipments and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              {userPackages.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No packages yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by sending your first package with KingX.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Send Package
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPackages.slice(0, 5).map((pkg) => (
                    <div key={pkg.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(pkg.status)}`} />
                        <div>
                          <p className="font-medium">{pkg.trackingNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            To: {pkg.receiver.name} • {pkg.receiver.address.city}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{formatStatus(pkg.status)}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPackage(pkg);
                            setIsTrackingDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by tracking number or recipient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={PackageStatus.CREATED}>Created</SelectItem>
                <SelectItem value={PackageStatus.PICKED_UP}>Picked Up</SelectItem>
                <SelectItem value={PackageStatus.IN_TRANSIT}>In Transit</SelectItem>
                <SelectItem value={PackageStatus.OUT_FOR_DELIVERY}>Out for Delivery</SelectItem>
                <SelectItem value={PackageStatus.DELIVERED}>Delivered</SelectItem>
                <SelectItem value={PackageStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Packages List */}
          <div className="space-y-4">
            {filteredPackages.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No packages found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Start by sending your first package with KingX.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredPackages.map((pkg) => (
                <Card key={pkg.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className={`w-4 h-4 rounded-full mt-1 ${getStatusColor(pkg.status)}`} />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{pkg.trackingNumber}</h3>
                            <Badge variant="outline">{formatStatus(pkg.status)}</Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>To: {pkg.receiver.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{pkg.receiver.address.city}, {pkg.receiver.address.state}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Created: {new Date(pkg.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3" />
                              <span>${pkg.payment.amount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPackage(pkg);
                            setIsTrackingDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Track
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{getStatusProgress(pkg.status)}%</span>
                      </div>
                      <Progress value={getStatusProgress(pkg.status)} className="h-1" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Package Tracking</CardTitle>
              <CardDescription>
                Enter your tracking number to get real-time updates on your package.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter tracking number (e.g., KX123456789)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={() => {
                  const pkg = userPackages.find(p => p.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()));
                  if (pkg) {
                    setSelectedPackage(pkg);
                    setIsTrackingDialogOpen(true);
                  }
                }}>
                  Track
                </Button>
              </div>
              
              {searchTerm && (
                <div className="space-y-2">
                  {userPackages
                    .filter(pkg => pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(pkg => (
                      <div
                        key={pkg.id}
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setIsTrackingDialogOpen(true);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(pkg.status)}`} />
                          <div>
                            <p className="font-medium">{pkg.trackingNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatStatus(pkg.status)} • To: {pkg.receiver.name}
                            </p>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Manage your account details and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profileName">Full Name</Label>
                    <Input id="profileName" value={user?.name || ''} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="profileEmail">Email</Label>
                    <Input id="profileEmail" value={user?.email || ''} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="profilePhone">Phone</Label>
                    <Input id="profilePhone" value={user?.phone || ''} readOnly />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Account Type</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">{user?.role.toUpperCase()}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Member Since</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label>Account Status</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{packageStats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Packages</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{packageStats.delivered}</div>
                    <div className="text-sm text-muted-foreground">Delivered</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">
                      ${userPackages.reduce((sum, pkg) => sum + pkg.payment.amount, 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Package Tracking Dialog */}
      <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
        {selectedPackage && <PackageTrackingDialog package={selectedPackage} />}
      </Dialog>
    </div>
  );
}