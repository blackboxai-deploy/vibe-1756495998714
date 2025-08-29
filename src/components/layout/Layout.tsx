'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  className?: string;
}

export default function Layout({ 
  children, 
  showNavbar = true, 
  showFooter = true, 
  className = '' 
}: LayoutProps) {
  return (
    <AuthProvider>
      <AppProvider>
        <div className={`min-h-screen flex flex-col ${className}`}>
          {showNavbar && <Navbar />}
          <main className="flex-1">
            {children}
          </main>
          {showFooter && <Footer />}
        </div>
      </AppProvider>
    </AuthProvider>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </Layout>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout showNavbar={false} showFooter={false}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          {children}
        </div>
      </div>
    </Layout>
  );
}