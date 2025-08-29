'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { getUserNotifications } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userNotifications = user ? getUserNotifications(user.id) : [];
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="font-bold text-xl text-gray-900">KingX</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated ? (
              <>
                <Link href="/tracking" className="text-gray-700 hover:text-blue-600 font-medium">
                  Track Package
                </Link>
                <Link href="/send-package" className="text-gray-700 hover:text-blue-600 font-medium">
                  Send Package
                </Link>
                <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 font-medium">
                  Sign In
                </Link>
                <Link href="/auth/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            ) : (
              <>
                {/* Role-based navigation */}
                {user?.role === UserRole.CUSTOMER && (
                  <>
                    <Link href="/send-package" className="text-gray-700 hover:text-blue-600 font-medium">
                      Send Package
                    </Link>
                    <Link href="/dashboard/customer" className="text-gray-700 hover:text-blue-600 font-medium">
                      My Packages
                    </Link>
                  </>
                )}
                
                {user?.role === UserRole.DRIVER && (
                  <>
                    <Link href="/dashboard/driver" className="text-gray-700 hover:text-blue-600 font-medium">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/driver/routes" className="text-gray-700 hover:text-blue-600 font-medium">
                      Routes
                    </Link>
                  </>
                )}
                
                {user?.role === UserRole.ADMIN && (
                  <>
                    <Link href="/dashboard/admin" className="text-gray-700 hover:text-blue-600 font-medium">
                      Admin Panel
                    </Link>
                    <Link href="/dashboard/admin/analytics" className="text-gray-700 hover:text-blue-600 font-medium">
                      Analytics
                    </Link>
                  </>
                )}

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
                      </div>
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userNotifications.length === 0 ? (
                      <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
                    ) : (
                      userNotifications.slice(0, 5).map((notification) => (
                        <DropdownMenuItem key={notification.id} className="flex-col items-start p-4">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium text-sm">{notification.title}</span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <span className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </span>
                          <span className="text-xs text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </DropdownMenuItem>
                      ))
                    )}
                    {userNotifications.length > 5 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-center text-blue-600 font-medium">
                          View All Notifications
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-700 font-medium text-sm">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-700 font-medium">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/help">Help & Support</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className={`w-5 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`w-5 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></div>
                <div className={`w-5 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/tracking"
                    className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Track Package
                  </Link>
                  <Link
                    href="/send-package"
                    className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Send Package
                  </Link>
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <div className="px-4">
                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-700 font-medium">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user?.name}</div>
                        <div className="text-sm text-gray-600">{user?.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Role-based mobile navigation */}
                  {user?.role === UserRole.CUSTOMER && (
                    <>
                      <Link
                        href="/send-package"
                        className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Send Package
                      </Link>
                      <Link
                        href="/dashboard/customer"
                        className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Packages
                      </Link>
                    </>
                  )}
                  
                  {user?.role === UserRole.DRIVER && (
                    <>
                      <Link
                        href="/dashboard/driver"
                        className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/driver/routes"
                        className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Routes
                      </Link>
                    </>
                  )}
                  
                  {user?.role === UserRole.ADMIN && (
                    <>
                      <Link
                        href="/dashboard/admin"
                        className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                      <Link
                        href="/dashboard/admin/analytics"
                        className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Analytics
                      </Link>
                    </>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <Link
                      href="/profile"
                      className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <Link
                      href="/help"
                      className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Help & Support
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 font-medium px-4 py-2 text-left w-full"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}