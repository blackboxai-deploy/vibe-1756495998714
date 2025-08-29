'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Package, Driver, Route, Notification, Analytics, AppState, PackageStatus, UserRole } from '@/types';

interface AppContextType extends AppState {
  // Package operations
  createPackage: (packageData: Omit<Package, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt' | 'timeline'>) => Promise<Package>;
  updatePackageStatus: (packageId: string, status: PackageStatus, location?: string, notes?: string) => Promise<void>;
  getPackagesByUser: (userId: string, role: UserRole) => Package[];
  
  // Driver operations
  assignPackageToDriver: (packageId: string, driverId: string) => Promise<void>;
  updateDriverLocation: (driverId: string, coordinates: { lat: number; lng: number }) => Promise<void>;
  
  // Route operations
  optimizeRoute: (driverId: string, packageIds: string[]) => Promise<Route>;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  
  // Analytics
  refreshAnalytics: () => Promise<void>;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_PACKAGE'; payload: Package }
  | { type: 'UPDATE_PACKAGE'; payload: Package }
  | { type: 'SET_PACKAGES'; payload: Package[] }
  | { type: 'SET_DRIVERS'; payload: Driver[] }
  | { type: 'UPDATE_DRIVER'; payload: Driver }
  | { type: 'SET_ROUTES'; payload: Route[] }
  | { type: 'ADD_ROUTE'; payload: Route }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: Notification }
  | { type: 'SET_ANALYTICS'; payload: Analytics };

const initialState: AppState = {
  packages: [],
  drivers: [],
  routes: [],
  notifications: [],
  analytics: null,
  isLoading: false,
  error: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_PACKAGE':
      return { ...state, packages: [...state.packages, action.payload] };
    case 'UPDATE_PACKAGE':
      return {
        ...state,
        packages: state.packages.map(pkg =>
          pkg.id === action.payload.id ? action.payload : pkg
        ),
      };
    case 'SET_PACKAGES':
      return { ...state, packages: action.payload };
    case 'SET_DRIVERS':
      return { ...state, drivers: action.payload };
    case 'UPDATE_DRIVER':
      return {
        ...state,
        drivers: state.drivers.map(driver =>
          driver.id === action.payload.id ? action.payload : driver
        ),
      };
    case 'SET_ROUTES':
      return { ...state, routes: action.payload };
    case 'ADD_ROUTE':
      return { ...state, routes: [...state.routes, action.payload] };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload.id ? action.payload : notif
        ),
      };
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload };
    default:
      return state;
  }
}

// Mock data generator functions
function generateTrackingNumber(): string {
  return 'KX' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function generateMockPackages(): Package[] {
  return [
    {
      id: '1',
      trackingNumber: generateTrackingNumber(),
      sender: {
        name: 'Alice Johnson',
        phone: '+1234567890',
        email: 'alice@example.com',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        }
      },
      receiver: {
        name: 'Bob Smith',
        phone: '+1234567891',
        email: 'bob@example.com',
        address: {
          street: '456 Oak Ave',
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
        description: 'Smartphone',
        fragile: true,
        insurance: true
      },
      delivery: {
        type: 'express' as any,
        priority: 'high' as any,
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
        instructions: 'Leave at front door'
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
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          location: 'New York, NY'
        },
        {
          id: '2',
          status: PackageStatus.PICKED_UP,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          location: 'New York, NY'
        },
        {
          id: '3',
          status: PackageStatus.IN_TRANSIT,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          location: 'Queens, NY'
        }
      ],
      driverId: '2',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize mock data
  useEffect(() => {
    const packages = generateMockPackages();
    dispatch({ type: 'SET_PACKAGES', payload: packages });
  }, []);

  const createPackage = async (packageData: Omit<Package, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt' | 'timeline'>): Promise<Package> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newPackage: Package = {
        ...packageData,
        id: Date.now().toString(),
        trackingNumber: generateTrackingNumber(),
        timeline: [{
          id: '1',
          status: PackageStatus.CREATED,
          timestamp: new Date().toISOString(),
          location: packageData.sender.address.city + ', ' + packageData.sender.address.state
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dispatch({ type: 'ADD_PACKAGE', payload: newPackage });
      
      // Add notification
      addNotification({
        userId: packageData.sender.email, // Using email as userId for demo
        type: 'package_update' as any,
        title: 'Package Created',
        message: `Your package ${newPackage.trackingNumber} has been created and is awaiting pickup.`,
        read: false
      });

      return newPackage;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create package';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updatePackageStatus = async (packageId: string, status: PackageStatus, location?: string, notes?: string): Promise<void> => {
    try {
      const packageToUpdate = state.packages.find(pkg => pkg.id === packageId);
      if (!packageToUpdate) {
        throw new Error('Package not found');
      }

      const newTimelineEntry = {
        id: Date.now().toString(),
        status,
        timestamp: new Date().toISOString(),
        location,
        notes
      };

      const updatedPackage: Package = {
        ...packageToUpdate,
        status,
        timeline: [...packageToUpdate.timeline, newTimelineEntry],
        updatedAt: new Date().toISOString()
      };

      dispatch({ type: 'UPDATE_PACKAGE', payload: updatedPackage });

      // Add notification
      addNotification({
        userId: packageToUpdate.sender.email,
        type: 'package_update' as any,
        title: 'Package Status Updated',
        message: `Your package ${packageToUpdate.trackingNumber} is now ${status.replace('_', ' ')}.`,
        data: { packageId, status },
        read: false
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update package status';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const getPackagesByUser = (userId: string, role: UserRole): Package[] => {
    switch (role) {
      case UserRole.CUSTOMER:
        return state.packages.filter(pkg => 
          pkg.sender.email === userId || pkg.receiver.email === userId
        );
      case UserRole.DRIVER:
        return state.packages.filter(pkg => pkg.driverId === userId);
      case UserRole.ADMIN:
        return state.packages;
      default:
        return [];
    }
  };

  const assignPackageToDriver = async (packageId: string, driverId: string): Promise<void> => {
    try {
      const packageToUpdate = state.packages.find(pkg => pkg.id === packageId);
      if (!packageToUpdate) {
        throw new Error('Package not found');
      }

      const updatedPackage: Package = {
        ...packageToUpdate,
        driverId,
        status: PackageStatus.PICKED_UP,
        updatedAt: new Date().toISOString()
      };

      dispatch({ type: 'UPDATE_PACKAGE', payload: updatedPackage });

      // Add notifications
      addNotification({
        userId: driverId,
        type: 'delivery_assigned' as any,
        title: 'New Delivery Assigned',
        message: `You have been assigned package ${packageToUpdate.trackingNumber}.`,
        data: { packageId },
        read: false
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign package to driver';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateDriverLocation = async (driverId: string, coordinates: { lat: number; lng: number }): Promise<void> => {
    try {
      const driverToUpdate = state.drivers.find(driver => driver.id === driverId);
      if (!driverToUpdate) {
        throw new Error('Driver not found');
      }

      const updatedDriver = {
        ...driverToUpdate,
        currentLocation: coordinates
      };

      dispatch({ type: 'UPDATE_DRIVER', payload: updatedDriver });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update driver location';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const optimizeRoute = async (driverId: string, packageIds: string[]): Promise<Route> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Simulate AI route optimization API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get packages for route
      const routePackages = state.packages.filter(pkg => packageIds.includes(pkg.id));
      
      // Create optimized route stops
      const stops = routePackages.map((pkg, index) => ({
        packageId: pkg.id,
        address: pkg.receiver.address,
        coordinates: pkg.receiver.address.coordinates || { lat: 40.7128, lng: -74.0060 },
        estimatedArrival: new Date(Date.now() + (index + 1) * 1800000).toISOString(),
        status: 'pending' as any,
        order: index + 1
      }));

      const newRoute: Route = {
        id: Date.now().toString(),
        driverId,
        packages: packageIds,
        startLocation: { lat: 40.7128, lng: -74.0060 }, // Driver's current location
        stops,
        status: 'planned' as any,
        estimatedDuration: packageIds.length * 30, // 30 minutes per stop
        distance: packageIds.length * 5, // 5 km per stop
        optimized: true,
        createdAt: new Date().toISOString()
      };

      dispatch({ type: 'ADD_ROUTE', payload: newRoute });

      return newRoute;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to optimize route';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): void => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const markNotificationAsRead = (notificationId: string): void => {
    const notification = state.notifications.find(n => n.id === notificationId);
    if (notification) {
      const updatedNotification = { ...notification, read: true };
      dispatch({ type: 'UPDATE_NOTIFICATION', payload: updatedNotification });
    }
  };

  const refreshAnalytics = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate analytics from current data
      const mockAnalytics: Analytics = {
        packages: {
          total: state.packages.length,
          delivered: state.packages.filter(p => p.status === PackageStatus.DELIVERED).length,
          inTransit: state.packages.filter(p => p.status === PackageStatus.IN_TRANSIT).length,
          pending: state.packages.filter(p => p.status === PackageStatus.CREATED).length,
          cancelled: state.packages.filter(p => p.status === PackageStatus.CANCELLED).length,
          averageDeliveryTime: 24, // hours
          deliverySuccessRate: 95.5
        },
        drivers: {
          total: state.drivers.length,
          active: state.drivers.filter(d => d.availability.isOnline).length,
          available: state.drivers.filter(d => d.availability.isOnline).length,
          averageRating: 4.7,
          totalDeliveries: state.drivers.reduce((sum, d) => sum + d.totalDeliveries, 0)
        },
        revenue: {
          today: 1250.75,
          thisWeek: 8750.50,
          thisMonth: 35200.25,
          thisYear: 425000.00,
          averageOrderValue: 28.50,
          topPaymentMethods: [
            { method: 'credit_card' as any, count: 150, revenue: 4500.00, percentage: 60 },
            { method: 'digital_wallet' as any, count: 75, revenue: 2250.00, percentage: 30 },
            { method: 'cash_on_delivery' as any, count: 25, revenue: 750.00, percentage: 10 }
          ]
        },
        customer: {
          total: 5000,
          active: 3500,
          new: 250,
          retention: 85.5,
          averageOrdersPerCustomer: 3.2
        }
      };

      dispatch({ type: 'SET_ANALYTICS', payload: mockAnalytics });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh analytics';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value: AppContextType = {
    ...state,
    createPackage,
    updatePackageStatus,
    getPackagesByUser,
    assignPackageToDriver,
    updateDriverLocation,
    optimizeRoute,
    addNotification,
    markNotificationAsRead,
    refreshAnalytics,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}