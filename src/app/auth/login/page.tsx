'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Package, Truck, Shield, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isLoading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !role) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(email, password, role as UserRole);
      
      // Redirect based on role
      switch (role) {
        case UserRole.CUSTOMER:
          router.push('/dashboard/customer');
          break;
        case UserRole.DRIVER:
          router.push('/dashboard/driver');
          break;
        case UserRole.ADMIN:
          router.push('/dashboard/admin');
          break;
        default:
          router.push('/');
      }
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoAccounts = [
    {
      role: UserRole.CUSTOMER,
      email: 'customer@kingx.com',
      icon: Package,
      title: 'Customer Account',
      description: 'Send packages and track deliveries'
    },
    {
      role: UserRole.DRIVER,
      email: 'driver@kingx.com',
      icon: Truck,
      title: 'Driver Account',
      description: 'Manage deliveries and routes'
    },
    {
      role: UserRole.ADMIN,
      email: 'admin@kingx.com',
      icon: Shield,
      title: 'Admin Account',
      description: 'System management and analytics'
    }
  ];

  const fillDemoAccount = (demoRole: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setRole(demoRole);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-600 text-white p-3 rounded-lg">
                  <Package className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Welcome to KingX</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading || isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading || isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading || isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Account Type</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as UserRole)} disabled={isLoading || isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.CUSTOMER}>Customer</SelectItem>
                      <SelectItem value={UserRole.DRIVER}>Driver</SelectItem>
                      <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || isSubmitting || !email || !password || !role}
                >
                  {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
                
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                    Sign up
                  </Link>
                </div>
                
                <div className="text-center text-sm">
                  <Link href="/" className="text-muted-foreground hover:underline">
                    ← Back to home
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
        
        {/* Demo Accounts */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Try Demo Accounts</h2>
              <p className="text-gray-600">Click any account below to auto-fill login credentials</p>
            </div>
            
            <div className="space-y-4">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <Card 
                    key={account.role}
                    className="cursor-pointer transition-all hover:shadow-md hover:scale-105 border-2 hover:border-blue-200"
                    onClick={() => fillDemoAccount(account.role, account.email)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{account.title}</h3>
                          <p className="text-sm text-gray-600">{account.description}</p>
                          <p className="text-xs text-blue-600 mt-1">{account.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-100 text-yellow-600 p-1 rounded">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800">Demo Credentials</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    All demo accounts use the password: <code className="bg-yellow-100 px-1 rounded">password123</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}