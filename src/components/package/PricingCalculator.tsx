'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Package, Truck, Shield, Clock, MapPin } from 'lucide-react';
import { PackageCategory, DeliveryType, DeliveryPriority, PriceBreakdown } from '@/types';

interface PricingCalculatorProps {
  onPriceCalculated?: (breakdown: PriceBreakdown) => void;
  initialData?: {
    weight?: number;
    distance?: number;
    category?: PackageCategory;
    deliveryType?: DeliveryType;
    priority?: DeliveryPriority;
    insurance?: boolean;
    fragile?: boolean;
  };
}

interface PricingInputs {
  weight: number;
  distance: number;
  category: PackageCategory;
  deliveryType: DeliveryType;
  priority: DeliveryPriority;
  insurance: boolean;
  fragile: boolean;
  packageValue: number;
}

const PRICING_CONFIG = {
  basePrice: 8.99,
  weightRates: {
    [PackageCategory.DOCUMENTS]: 0.5,
    [PackageCategory.ELECTRONICS]: 1.2,
    [PackageCategory.CLOTHING]: 0.8,
    [PackageCategory.FOOD]: 1.0,
    [PackageCategory.FRAGILE]: 1.5,
    [PackageCategory.BULK]: 2.0,
    [PackageCategory.OTHER]: 1.0,
  },
  distanceRate: 0.75, // per km
  deliveryTypeMultipliers: {
    [DeliveryType.STANDARD]: 1.0,
    [DeliveryType.EXPRESS]: 1.5,
    [DeliveryType.SAME_DAY]: 2.0,
    [DeliveryType.SCHEDULED]: 1.2,
  },
  priorityFees: {
    [DeliveryPriority.LOW]: 0,
    [DeliveryPriority.MEDIUM]: 2.99,
    [DeliveryPriority.HIGH]: 5.99,
    [DeliveryPriority.URGENT]: 9.99,
  },
  insuranceRate: 0.02, // 2% of package value
  fragileFee: 3.99,
  serviceFeeRate: 0.08, // 8% of subtotal
  taxRate: 0.08, // 8% tax
};

export function PricingCalculator({ onPriceCalculated, initialData }: PricingCalculatorProps) {
  const [inputs, setInputs] = useState<PricingInputs>({
    weight: initialData?.weight || 1,
    distance: initialData?.distance || 5,
    category: initialData?.category || PackageCategory.OTHER,
    deliveryType: initialData?.deliveryType || DeliveryType.STANDARD,
    priority: initialData?.priority || DeliveryPriority.MEDIUM,
    insurance: initialData?.insurance || false,
    fragile: initialData?.fragile || false,
    packageValue: 100,
  });

  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);

  const calculatePrice = () => {
    const basePrice = PRICING_CONFIG.basePrice;
    
    // Weight-based fee
    const weightRate = PRICING_CONFIG.weightRates[inputs.category];
    const weightFee = inputs.weight * weightRate;
    
    // Distance-based fee
    const distanceFee = inputs.distance * PRICING_CONFIG.distanceRate;
    
    // Delivery type multiplier
    const deliveryMultiplier = PRICING_CONFIG.deliveryTypeMultipliers[inputs.deliveryType];
    const adjustedBasePrice = basePrice * deliveryMultiplier;
    
    // Priority fee
    const priorityFee = PRICING_CONFIG.priorityFees[inputs.priority];
    
    // Insurance fee
    const insuranceFee = inputs.insurance ? inputs.packageValue * PRICING_CONFIG.insuranceRate : 0;
    
    // Fragile handling fee
    const fragileFee = inputs.fragile ? PRICING_CONFIG.fragileFee : 0;
    
    // Subtotal before service fee and tax
    const subtotal = adjustedBasePrice + weightFee + distanceFee + priorityFee + insuranceFee + fragileFee;
    
    // Service fee
    const serviceFee = subtotal * PRICING_CONFIG.serviceFeeRate;
    
    // Tax calculation
    const taxableAmount = subtotal + serviceFee;
    const tax = taxableAmount * PRICING_CONFIG.taxRate;
    
    // Total
    const total = taxableAmount + tax;

    const priceBreakdown: PriceBreakdown = {
      basePrice: adjustedBasePrice,
      distanceFee,
      weightFee,
      priorityFee,
      insuranceFee,
      serviceFee,
      tax,
      discount: 0, // No discounts in this basic calculator
      total: Math.round(total * 100) / 100, // Round to 2 decimal places
    };

    setBreakdown(priceBreakdown);
    onPriceCalculated?.(priceBreakdown);
  };

  useEffect(() => {
    calculatePrice();
  }, [inputs]);

  const updateInput = (key: keyof PricingInputs, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const getDeliveryTypeIcon = (type: DeliveryType) => {
    switch (type) {
      case DeliveryType.SAME_DAY:
        return <Clock className="h-4 w-4" />;
      case DeliveryType.EXPRESS:
        return <Truck className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: DeliveryPriority) => {
    switch (priority) {
      case DeliveryPriority.URGENT:
        return 'destructive';
      case DeliveryPriority.HIGH:
        return 'default';
      case DeliveryPriority.MEDIUM:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Pricing Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Package Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              min="0.1"
              step="0.1"
              value={inputs.weight}
              onChange={(e) => updateInput('weight', parseFloat(e.target.value) || 0.1)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="distance">Distance (km)</Label>
            <Input
              id="distance"
              type="number"
              min="1"
              value={inputs.distance}
              onChange={(e) => updateInput('distance', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        {/* Package Category */}
        <div className="space-y-2">
          <Label>Package Category</Label>
          <Select value={inputs.category} onValueChange={(value) => updateInput('category', value)}>
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

        {/* Delivery Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Delivery Type</Label>
            <Select value={inputs.deliveryType} onValueChange={(value) => updateInput('deliveryType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DeliveryType.STANDARD}>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Standard (2-3 days)
                  </div>
                </SelectItem>
                <SelectItem value={DeliveryType.EXPRESS}>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Express (1-2 days)
                  </div>
                </SelectItem>
                <SelectItem value={DeliveryType.SAME_DAY}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Same Day
                  </div>
                </SelectItem>
                <SelectItem value={DeliveryType.SCHEDULED}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Scheduled
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority Level</Label>
            <Select value={inputs.priority} onValueChange={(value) => updateInput('priority', value)}>
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
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="insurance"
              checked={inputs.insurance}
              onCheckedChange={(checked) => updateInput('insurance', checked)}
            />
            <Label htmlFor="insurance" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Insurance Coverage (2% of package value)
            </Label>
          </div>

          {inputs.insurance && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="packageValue">Package Value ($)</Label>
              <Input
                id="packageValue"
                type="number"
                min="1"
                value={inputs.packageValue}
                onChange={(e) => updateInput('packageValue', parseFloat(e.target.value) || 1)}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="fragile"
              checked={inputs.fragile}
              onCheckedChange={(checked) => updateInput('fragile', checked)}
            />
            <Label htmlFor="fragile">Fragile Handling (+$3.99)</Label>
          </div>
        </div>

        {/* Price Breakdown */}
        {breakdown && (
          <div className="space-y-4">
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getDeliveryTypeIcon(inputs.deliveryType)}
                  Base Price ({inputs.deliveryType})
                </span>
                <span>${breakdown.basePrice.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Distance Fee ({inputs.distance} km)</span>
                <span>${breakdown.distanceFee.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Weight Fee ({inputs.weight} kg)</span>
                <span>${breakdown.weightFee.toFixed(2)}</span>
              </div>

              {breakdown.priorityFee > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Priority Fee
                    <Badge variant={getPriorityColor(inputs.priority) as any} className="text-xs">
                      {inputs.priority}
                    </Badge>
                  </span>
                  <span>${breakdown.priorityFee.toFixed(2)}</span>
                </div>
              )}

              {breakdown.insuranceFee > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Insurance
                  </span>
                  <span>${breakdown.insuranceFee.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Service Fee</span>
                <span>${breakdown.serviceFee.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span>${breakdown.tax.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">${breakdown.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}