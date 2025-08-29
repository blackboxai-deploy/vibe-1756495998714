'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useApp } from '@/contexts/AppContext';

export default function TrackingEntryPage() {
  const router = useRouter();
  const { packages } = useApp();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find package by tracking number
      const pkg = packages.find(p => p.trackingNumber === trackingNumber.trim());
      
      if (pkg) {
        router.push(`/tracking/${pkg.id}`);
      } else {
        setError('Package not found. Please check your tracking number and try again.');
      }
    } catch (err) {
      setError('Failed to track package. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoTrackingNumbers = packages.slice(0, 3);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Track Your Package
            </h1>
            <p className="text-gray-600">
              Enter your tracking number to get real-time updates on your delivery
            </p>
          </div>

          {/* Tracking Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Enter Tracking Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrack} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="trackingNumber">Tracking Number</Label>
                  <Input
                    id="trackingNumber"
                    type="text"
                    placeholder="Enter tracking number (e.g., KX123456789)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Tracking numbers start with "KX" followed by numbers
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? 'Tracking Package...' : 'Track Package'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Tracking Numbers */}
          {demoTrackingNumbers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Demo Tracking Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Try these demo tracking numbers to see the tracking system in action:
                  </p>
                  
                  {demoTrackingNumbers.map((pkg) => (
                    <div 
                      key={pkg.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setTrackingNumber(pkg.trackingNumber)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-blue-600">
                          {pkg.trackingNumber}
                        </div>
                        <div className="text-sm text-gray-600">
                          {pkg.sender.address.city} → {pkg.receiver.address.city}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium capitalize text-gray-900">
                          {pkg.status.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {pkg.packageDetails.category}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <p className="text-xs text-gray-500 mt-4">
                    Click on any tracking number above to use it for tracking
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <div className="mt-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium mb-2">Can't find your tracking number?</h4>
                <p className="text-gray-600 mb-3">
                  Check your email confirmation or SMS for the tracking number
                </p>
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium mb-2">Package not updating?</h4>
                <p className="text-gray-600 mb-3">
                  Tracking updates may take up to 24 hours to appear
                </p>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium mb-2">Create an account</h4>
                <p className="text-gray-600 mb-3">
                  Get faster tracking and manage all your packages
                </p>
                <Button variant="outline" size="sm" onClick={() => router.push('/auth/register')}>
                  Sign Up
                </Button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-12">
            <h3 className="text-lg font-medium text-gray-900 text-center mb-6">
              Why Track with KingX?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Real-Time Updates</h4>
                  <p className="text-sm text-gray-600">
                    Get live tracking updates as your package moves through our network
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">GPS Tracking</h4>
                  <p className="text-sm text-gray-600">
                    See exactly where your package is on an interactive map
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Delivery Notifications</h4>
                  <p className="text-sm text-gray-600">
                    Receive instant notifications via SMS and email
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Delivery Proof</h4>
                  <p className="text-sm text-gray-600">
                    Get photo proof and digital signature upon delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}