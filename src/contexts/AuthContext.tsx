'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, UserRole, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: User }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    email: 'customer@kingx.com',
    name: 'John Doe',
    phone: '+1234567890',
    role: UserRole.CUSTOMER,
    status: 'active' as any,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'driver@kingx.com',
    name: 'Mike Johnson',
    phone: '+1234567891',
    role: UserRole.DRIVER,
    status: 'active' as any,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    email: 'admin@kingx.com',
    name: 'Sarah Wilson',
    phone: '+1234567892',
    role: UserRole.ADMIN,
    status: 'active' as any,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('kingx_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (error) {
        localStorage.removeItem('kingx_user');
      }
    }
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication - find user by email
      const user = mockUsers.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // If role is specified, check if it matches
      if (role && user.role !== role) {
        throw new Error('Invalid role for this account');
      }

      // Mock password validation (in real app, this would be handled by backend)
      if (password !== 'password123') {
        throw new Error('Invalid email or password');
      }

      // Save user to localStorage
      localStorage.setItem('kingx_user', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        status: 'active' as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to mock users array (in real app, this would be handled by backend)
      mockUsers.push(newUser);

      // Save user to localStorage
      localStorage.setItem('kingx_user', JSON.stringify(newUser));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: newUser });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('kingx_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    if (!state.user) {
      throw new Error('No user logged in');
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedUser: User = {
        ...state.user,
        ...userData,
        updatedAt: new Date().toISOString(),
      };

      // Update localStorage
      localStorage.setItem('kingx_user', JSON.stringify(updatedUser));
      
      dispatch({ type: 'UPDATE_PROFILE', payload: updatedUser });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}