'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Package, Truck, MapPin, CreditCard, Calendar, Shield, Clock, Calculator } from 'lucide-react';
import { PackageCategory, DeliveryType, DeliveryPriority, PaymentMethod, UserRole } from '@/types';

interface FormData {
  sender: {
    name: string;
    phone: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  receiver: {
    name: string;
    phone: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  packageDetails: {
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
  };
  delivery: {
    type: DeliveryType;
    priority: DeliveryPriority;
    scheduledDate: string;
    scheduledTimeSlot: string;
    instructions: string;
  };
  payment: {
    method: PaymentMethod;
  };
}

const initialFormData: FormData = {
  sender: {
    name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
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
      country: 'USA',
    },
  },
  packageDetails: {
    category: PackageCategory.OTHER,
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
    value: 0,
    description: '',
    fragile: false,
    insurance: false,
  },
  delivery: {
    type: DeliveryType.STANDARD,
    priority: DeliveryPriority.MEDIUM,
    scheduledDate: '',
    scheduledTimeSlot: '',
    instructions: '',
  },
  payment: {
    method: PaymentMethod.CREDIT_CARD,
  },
};

export default function SendPackagePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { createPackage, isLoading } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pricing, setPricing] = useState({
    basePrice: 0,
    distanceFee: 0,
    weightFee: 0,
    priorityFee: 0,
    insuranceFee: 0,
    serviceFee: 0,
    tax: 0,
    discount: 0,
    total: 0,
  });

  // Redirect if not authenticated or not a customer
  React.useEffect(() => {
    if (!isAuthenticated || (user && user.role !== UserRole.CUSTOMER)) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  // Auto-fill sender information from user profile
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        sender: {
          ...prev.sender,
          name: user.name,
          phone: user.phone,
          email: user.email,
        },
      }));
    }
  }, [user]);

  // Calculate pricing when relevant fields change
  React.useEffect(() => {
    calculatePricing();
  }, [formData.packageDetails, formData.delivery, formData.sender.address, formData.receiver.address]);

  const calculatePricing = () => {
    const basePrice = 10.00;
    const distanceFee = Math.random() * 15 + 5; // Mock distance calculation
    const weightFee = formData.packageDetails.weight * 2.5;
    const priorityMultiplier = {
      [DeliveryPriority.LOW]: 0.8,
      [DeliveryPriority.MEDIUM]: 1.0,
      [DeliveryPriority.HIGH]: 1.5,
      [DeliveryPriority.URGENT]: 2.0,
    };
    const priorityFee = basePrice * (priorityMultiplier[formData.delivery.priority] - 1);
    const insuranceFee = formData.packageDetails.insurance ? formData.packageDetails.value * 0.02 : 0;
    const serviceFee = 2.50;
    const subtotal = basePrice + distanceFee + weightFee + priorityFee + insuranceFee + serviceFee;
    const tax = subtotal * 0.08;
    const discount = 0;
    const total = subtotal + tax - discount;

    setPricing({
      basePrice,
      distanceFee,
      weightFee,
      priorityFee,
      insuranceFee,
      serviceFee,
      tax,
      discount,
      total,
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Sender Information
        if (!formData.sender.name) newErrors.senderName = 'Name is required';
        if (!formData.sender.phone) newErrors.senderPhone = 'Phone is required';
        if (!formData.sender.email) newErrors.senderEmail = 'Email is required';
        if (!formData.sender.address.street) newErrors.senderStreet = 'Street address is required';
        if (!formData.sender.address.city) newErrors.senderCity = 'City is required';
        if (!formData.sender.address.state) newErrors.senderState = 'State is required';
        if (!formData.sender.address.zipCode) newErrors.senderZipCode = 'ZIP code is required';
        break;

      case 2: // Receiver Information
        if (!formData.receiver.name) newErrors.receiverName = 'Name is required';
        if (!formData.receiver.phone) newErrors.receiverPhone = 'Phone is required';
        if (!formData.receiver.email) newErrors.receiverEmail = 'Email is required';
        if (!formData.receiver.address.street) newErrors.receiverStreet = 'Street address is required';
        if (!formData.receiver.address.city) newErrors.receiverCity = 'City is required';
        if (!formData.receiver.address.state) newErrors.receiverState = 'State is required';
        if (!formData.receiver.address.zipCode) newErrors.receiverZipCode = 'ZIP code is required';
        break;

      case 3: // Package Details
        if (!formData.packageDetails.description) newErrors.description = 'Description is required';
        if (formData.packageDetails.weight <= 0) newErrors.weight = 'Weight must be greater than 0';
        if (formData.packageDetails.dimensions.length <= 0) newErrors.length = 'Length must be greater than 0';
        if (formData.packageDetails.dimensions.width <= 0) newErrors.width = 'Width must be greater than 0';
        if (formData.packageDetails.dimensions.height <= 0) newErrors.height = 'Height must be greater than 0';
        if (formData.packageDetails.value <= 0) newErrors.value = 'Value must be greater than 0';
        break;

      case 4: // Delivery Options
        if (!formData.delivery.scheduledDate) newErrors.scheduledDate = 'Delivery date is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    try {
      const packageData = {
        sender: {
          ...formData.sender,
          address: {
            ...formData.sender.address,
            coordinates: { lat: 40.7128, lng: -74.0060 }, // Mock coordinates
          },
        },
        receiver: {
          ...formData.receiver,
          address: {
            ...formData.receiver.address,
            coordinates: { lat: 40.6892, lng: -73.9442 }, // Mock coordinates
          },
        },
        packageDetails: formData.packageDetails,
        delivery: {
          ...formData.delivery,
          estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
        },
        payment: {
          ...formData.payment,
          amount: pricing.total,
          currency: 'USD',
          status: 'pending' as any,
          breakdown: pricing,
        },
        status: 'created' as any,
      };

      const newPackage = await createPackage(packageData);
      router.push(`/tracking/${newPackage.trackingNumber}`);
    } catch (error) {
      console.error('Failed to create package:', error);
    }
  };

  const updateFormData = (section: keyof FormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateNestedFormData = (section: keyof FormData, subsection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value,
        },
      },
    }));
  };

  const steps = [
    { number: 1, title: 'Sender Info', icon: MapPin },
    { number: 2, title: 'Receiver Info', icon: MapPin },
    { number: 3, title: 'Package Details', icon: Package },
    { number: 4, title: 'Delivery Options', icon: Truck },
    { number: 5, title: 'Payment & Review', icon: CreditCard },
  ];

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Send a Package</h1>
          <p className="text-gray-600 mt-2">Fast, reliable, and secure package delivery</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted ? 'bg-blue-600 border-blue-600 text-white' :
                    isActive ? 'border-blue-600 text-blue-600' :
                    'border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
                  {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription>
                  Step {currentStep} of {steps.length}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Sender Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="senderName">Full Name</Label>
                        <Input
                          id="senderName"
                          value={formData.sender.name}
                          onChange={(e) => updateFormData('sender', 'name', e.target.value)}
                          className={errors.senderName ? 'border-red-500' : ''}
                        />
                        {errors.senderName && <p className="text-red-500 text-sm mt-1">{errors.senderName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="senderPhone">Phone Number</Label>
                        <Input
                          id="senderPhone"
                          value={formData.sender.phone}
                          onChange={(e) => updateFormData('sender', 'phone', e.target.value)}
                          className={errors.senderPhone ? 'border-red-500' : ''}
                        />
                        {errors.senderPhone && <p className="text-red-500 text-sm mt-1">{errors.senderPhone}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="senderEmail">Email Address</Label>
                      <Input
                        id="senderEmail"
                        type="email"
                        value={formData.sender.email}
                        onChange={(e) => updateFormData('sender', 'email', e.target.value)}
                        className={errors.senderEmail ? 'border-red-500' : ''}
                      />
                      {errors.senderEmail && <p className="text-red-500 text-sm mt-1">{errors.senderEmail}</p>}
                    </div>
                    <div>
                      <Label htmlFor="senderStreet">Street Address</Label>
                      <Input
                        id="senderStreet"
                        value={formData.sender.address.street}
                        onChange={(e) => updateNestedFormData('sender', 'address', 'street', e.target.value)}
                        className={errors.senderStreet ? 'border-red-500' : ''}
                      />
                      {errors.senderStreet && <p className="text-red-500 text-sm mt-1">{errors.senderStreet}</p>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="senderCity">City</Label>
                        <Input
                          id="senderCity"
                          value={formData.sender.address.city}
                          onChange={(e) => updateNestedFormData('sender', 'address', 'city', e.target.value)}
                          className={errors.senderCity ? 'border-red-500' : ''}
                        />
                        {errors.senderCity && <p className="text-red-500 text-sm mt-1">{errors.senderCity}</p>}
                      </div>
                      <div>
                        <Label htmlFor="senderState">State</Label>
                        <Input
                          id="senderState"
                          value={formData.sender.address.state}
                          onChange={(e) => updateNestedFormData('sender', 'address', 'state', e.target.value)}
                          className={errors.senderState ? 'border-red-500' : ''}
                        />
                        {errors.senderState && <p className="text-red-500 text-sm mt-1">{errors.senderState}</p>}
                      </div>
                      <div>
                        <Label htmlFor="senderZipCode">ZIP Code</Label>
                        <Input
                          id="senderZipCode"
                          value={formData.sender.address.zipCode}
                          onChange={(e) => updateNestedFormData('sender', 'address', 'zipCode', e.target.value)}
                          className={errors.senderZipCode ? 'border-red-500' : ''}
                        />
                        {errors.senderZipCode && <p className="text-red-500 text-sm mt-1">{errors.senderZipCode}</p>}
                      </div>
                      <div>
                        <Label htmlFor="senderCountry">Country</Label>
                        <Select value={formData.sender.address.country} onValueChange={(value) => updateNestedFormData('sender', 'address', 'country', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USA">United States</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="Mexico">Mexico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Receiver Information */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="receiverName">Full Name</Label>
                        <Input
                          id="receiverName"
                          value={formData.receiver.name}
                          onChange={(e) => updateFormData('receiver', 'name', e.target.value)}
                          className={errors.receiverName ? 'border-red-500' : ''}
                        />
                        {errors.receiverName && <p className="text-red-500 text-sm mt-1">{errors.receiverName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="receiverPhone">Phone Number</Label>
                        <Input
                          id="receiverPhone"
                          value={formData.receiver.phone}
                          onChange={(e) => updateFormData('receiver', 'phone', e.target.value)}
                          className={errors.receiverPhone ? 'border-red-500' : ''}
                        />
                        {errors.receiverPhone && <p className="text-red-500 text-sm mt-1">{errors.receiverPhone}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="receiverEmail">Email Address</Label>
                      <Input
                        id="receiverEmail"
                        type="email"
                        value={formData.receiver.email}
                        onChange={(e) => updateFormData('receiver', 'email', e.target.value)}
                        className={errors.receiverEmail ? 'border-red-500' : ''}
                      />
                      {errors.receiverEmail && <p className="text-red-500 text-sm mt-1">{errors.receiverEmail}</p>}
                    </div>
                    <div>
                      <Label htmlFor="receiverStreet">Street Address</Label>
                      <Input
                        id="receiverStreet"
                        value={formData.receiver.address.street}
                        onChange={(e) => updateNestedFormData('receiver', 'address', 'street', e.target.value)}
                        className={errors.receiverStreet ? 'border-red-500' : ''}
                      />
                      {errors.receiverStreet && <p className="text-red-500 text-sm mt-1">{errors.receiverStreet}</p>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="receiverCity">City</Label>
                        <Input
                          id="receiverCity"
                          value={formData.receiver.address.city}
                          onChange={(e) => updateNestedFormData('receiver', 'address', 'city', e.target.value)}
                          className={errors.receiverCity ? 'border-red-500' : ''}
                        />
                        {errors.receiverCity && <p className="text-red-500 text-sm mt-1">{errors.receiverCity}</p>}
                      </div>
                      <div>
                        <Label htmlFor="receiverState">State</Label>
                        <Input
                          id="receiverState"
                          value={formData.receiver.address.state}
                          onChange={(e) => updateNestedFormData('receiver', 'address', 'state', e.target.value)}
                          className={errors.receiverState ? 'border-red-500' : ''}
                        />
                        {errors.receiverState && <p className="text-red-500 text-sm mt-1">{errors.receiverState}</p>}
                      </div>
                      <div>
                        <Label htmlFor="receiverZipCode">ZIP Code</Label>
                        <Input
                          id="receiverZipCode"
                          value={formData.receiver.address.zipCode}
                          onChange={(e) => updateNestedFormData('receiver', 'address', 'zipCode', e.target.value)}
                          className={errors.receiverZipCode ? 'border-red-500' : ''}
                        />
                        {errors.receiverZipCode && <p className="text-red-500 text-sm mt-1">{errors.receiverZipCode}</p>}
                      </div>
                      <div>
                        <Label htmlFor="receiverCountry">Country</Label>
                        <Select value={formData.receiver.address.country} onValueChange={(value) => updateNestedFormData('receiver', 'address', 'country', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USA">United States</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="Mexico">Mexico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Package Details */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category">Package Category</Label>
                      <Select value={formData.packageDetails.category} onValueChange={(value) => updateNestedFormData('packageDetails', '', 'category', value)}>
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
                      <Label htmlFor="description">Package Description</Label>
                      <Textarea
                        id="description"
                        value={formData.packageDetails.description}
                        onChange={(e) => updateNestedFormData('packageDetails', '', 'description', e.target.value)}
                        placeholder="Describe the contents of your package"
                        className={errors.description ? 'border-red-500' : ''}
                      />
                      {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="weight">Weight (lbs)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={formData.packageDetails.weight}
                          onChange={(e) => updateNestedFormData('packageDetails', '', 'weight', parseFloat(e.target.value) || 0)}
                          className={errors.weight ? 'border-red-500' : ''}
                        />
                        {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                      </div>
                      <div>
                        <Label htmlFor="length">Length (in)</Label>
                        <Input
                          id="length"
                          type="number"
                          value={formData.packageDetails.dimensions.length}
                          onChange={(e) => updateNestedFormData('packageDetails', 'dimensions', 'length', parseFloat(e.target.value) || 0)}
                          className={errors.length ? 'border-red-500' : ''}
                        />
                        {errors.length && <p className="text-red-500 text-sm mt-1">{errors.length}</p>}
                      </div>
                      <div>
                        <Label htmlFor="width">Width (in)</Label>
                        <Input
                          id="width"
                          type="number"
                          value={formData.packageDetails.dimensions.width}
                          onChange={(e) => updateNestedFormData('packageDetails', 'dimensions', 'width', parseFloat(e.target.value) || 0)}
                          className={errors.width ? 'border-red-500' : ''}
                        />
                        {errors.width && <p className="text-red-500 text-sm mt-1">{errors.width}</p>}
                      </div>
                      <div>
                        <Label htmlFor="height">Height (in)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={formData.packageDetails.dimensions.height}
                          onChange={(e) => updateNestedFormData('packageDetails', 'dimensions', 'height', parseFloat(e.target.value) || 0)}
                          className={errors.height ? 'border-red-500' : ''}
                        />
                        {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="value">Package Value ($)</Label>
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        value={formData.packageDetails.value}
                        onChange={(e) => updateNestedFormData('packageDetails', '', 'value', parseFloat(e.target.value) || 0)}
                        className={errors.value ? 'border-red-500' : ''}
                      />
                      {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="fragile"
                          checked={formData.packageDetails.fragile}
                          onCheckedChange={(checked) => updateNestedFormData('packageDetails', '', 'fragile', checked)}
                        />
                        <Label htmlFor="fragile">Fragile Item</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="insurance"
                          checked={formData.packageDetails.insurance}
                          onCheckedChange={(checked) => updateNestedFormData('packageDetails', '', 'insurance', checked)}
                        />
                        <Label htmlFor="insurance">Add Insurance</Label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Delivery Options */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Delivery Type</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {Object.values(DeliveryType).map((type) => (
                          <div
                            key={type}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              formData.delivery.type === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => updateNestedFormData('delivery', '', 'type', type)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium capitalize">{type.replace('_', ' ')}</h4>
                                <p className="text-sm text-gray-600">
                                  {type === DeliveryType.STANDARD && '3-5 business days'}
                                  {type === DeliveryType.EXPRESS && '1-2 business days'}
                                  {type === DeliveryType.SAME_DAY && 'Same day delivery'}
                                  {type === DeliveryType.SCHEDULED && 'Choose your date'}
                                </p>
                              </div>
                              {type === DeliveryType.EXPRESS && <Badge variant="secondary">Popular</Badge>}
                              {type === DeliveryType.SAME_DAY && <Badge>Fastest</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Priority Level</Label>
                      <Select value={formData.delivery.priority} onValueChange={(value) => updateNestedFormData('delivery', '', 'priority', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={DeliveryPriority.LOW}>Low Priority</SelectItem>
                          <SelectItem value={DeliveryPriority.MEDIUM}>Medium Priority</SelectItem>
                          <SelectItem value={DeliveryPriority.HIGH}>High Priority</SelectItem>
                          <SelectItem value={DeliveryPriority.URGENT}>Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scheduledDate">Preferred Delivery Date</Label>
                        <Input
                          id="scheduledDate"
                          type="date"
                          value={formData.delivery.scheduledDate}
                          onChange={(e) => updateNestedFormData('delivery', '', 'scheduledDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className={errors.scheduledDate ? 'border-red-500' : ''}
                        />
                        {errors.scheduledDate && <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>}
                      </div>
                      <div>
                        <Label htmlFor="timeSlot">Time Slot</Label>
                        <Select value={formData.delivery.scheduledTimeSlot} onValueChange={(value) => updateNestedFormData('delivery', '', 'scheduledTimeSlot', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time slot" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                            <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                            <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                            <SelectItem value="anytime">Anytime</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="instructions">Delivery Instructions</Label>
                      <Textarea
                        id="instructions"
                        value={formData.delivery.instructions}
                        onChange={(e) => updateNestedFormData('delivery', '', 'instructions', e.target.value)}
                        placeholder="Special instructions for the delivery driver"
                      />
                    </div>
                  </div>
                )}

                {/* Step 5: Payment & Review */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span>From:</span>
                          <span className="font-medium">{formData.sender.address.city}, {formData.sender.address.state}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>To:</span>
                          <span className="font-medium">{formData.receiver.address.city}, {formData.receiver.address.state}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Package:</span>
                          <span className="font-medium">{formData.packageDetails.description}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Weight:</span>
                          <span className="font-medium">{formData.packageDetails.weight} lbs</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Type:</span>
                          <span className="font-medium capitalize">{formData.delivery.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Payment Method</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {Object.values(PaymentMethod).map((method) => (
                          <div
                            key={method}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              formData.payment.method === method ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => updateFormData('payment', 'method', method)}
                          >
                            <div className="flex items-center space-x-3">
                              <CreditCard className="w-5 h-5" />
                              <span className="font-medium capitalize">{method.replace('_', ' ')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Your payment information is secure and encrypted. You will be charged after your package is successfully picked up.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  {currentStep < 5 ? (
                    <Button onClick={handleNext}>
                      Next
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={isLoading}>
                      {isLoading ? 'Creating Package...' : 'Create Package'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Pricing Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Base Price</span>
                  <span>${pricing.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Distance Fee</span>
                  <span>${pricing.distanceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Weight Fee</span>
                  <span>${pricing.weightFee.toFixed(2)}</span>
                </div>
                {pricing.priorityFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Priority Fee</span>
                    <span>${pricing.priorityFee.toFixed(2)}</span>
                  </div>
                )}
                {pricing.insuranceFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Insurance Fee</span>
                    <span>${pricing.insuranceFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Service Fee</span>
                  <span>${pricing.serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${pricing.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${pricing.total.toFixed(2)}</span>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Estimated Delivery</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    {formData.delivery.type === DeliveryType.SAME_DAY && 'Today by 8PM'}
                    {formData.delivery.type === DeliveryType.EXPRESS && '1-2 business days'}
                    {formData.delivery.type === DeliveryType.STANDARD && '3-5 business days'}
                    {formData.delivery.type === DeliveryType.SCHEDULED && formData.delivery.scheduledDate ? new Date(formData.delivery.scheduledDate).toLocaleDateString() : 'Select date'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}