'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import {
  Package,
  Truck,
  BarChart3,
  Users,
  Settings,
  Bell,
  MapPin,
  CreditCard,
  FileText,
  Home,
  Plus,
  Search,
  Calendar,
  Star,
  DollarSign,
  Route,
  Shield,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

const customerNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard/customer',
    icon: Home,
  },
  {
    title: 'Send Package',
    href: '/send-package',
    icon: Plus,
  },
  {
    title: 'My Packages',
    href: '/dashboard/customer/packages',
    icon: Package,
    badge: 3,
  },
  {
    title: 'Track Package',
    href: '/dashboard/customer/track',
    icon: Search,
  },
  {
    title: 'Scheduled Deliveries',
    href: '/dashboard/customer/scheduled',
    icon: Calendar,
  },
  {
    title: 'Payment Methods',
    href: '/dashboard/customer/payments',
    icon: CreditCard,
  },
  {
    title: 'Order History',
    href: '/dashboard/customer/history',
    icon: FileText,
  },
  {
    title: 'Notifications',
    href: '/dashboard/customer/notifications',
    icon: Bell,
    badge: 5,
  },
];

const driverNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard/driver',
    icon: Home,
  },
  {
    title: 'Active Deliveries',
    href: '/dashboard/driver/deliveries',
    icon: Package,
    badge: 2,
  },
  {
    title: 'Route Optimization',
    href: '/dashboard/driver/routes',
    icon: Route,
  },
  {
    title: 'Live Tracking',
    href: '/dashboard/driver/tracking',
    icon: MapPin,
  },
  {
    title: 'Earnings',
    href: '/dashboard/driver/earnings',
    icon: DollarSign,
  },
  {
    title: 'Performance',
    href: '/dashboard/driver/performance',
    icon: Star,
  },
  {
    title: 'Schedule',
    href: '/dashboard/driver/schedule',
    icon: Calendar,
  },
  {
    title: 'Vehicle Info',
    href: '/dashboard/driver/vehicle',
    icon: Truck,
  },
  {
    title: 'Notifications',
    href: '/dashboard/driver/notifications',
    icon: Bell,
    badge: 3,
  },
];

const adminNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard/admin',
    icon: Home,
  },
  {
    title: 'Analytics',
    href: '/dashboard/admin/analytics',
    icon: BarChart3,
    children: [
      {
        title: 'Overview',
        href: '/dashboard/admin/analytics/overview',
        icon: BarChart3,
      },
      {
        title: 'Revenue',
        href: '/dashboard/admin/analytics/revenue',
        icon: DollarSign,
      },
      {
        title: 'Performance',
        href: '/dashboard/admin/analytics/performance',
        icon: Star,
      },
    ],
  },
  {
    title: 'Package Management',
    href: '/dashboard/admin/packages',
    icon: Package,
    badge: 15,
  },
  {
    title: 'User Management',
    href: '/dashboard/admin/users',
    icon: Users,
    children: [
      {
        title: 'Customers',
        href: '/dashboard/admin/users/customers',
        icon: Users,
      },
      {
        title: 'Drivers',
        href: '/dashboard/admin/users/drivers',
        icon: Truck,
      },
      {
        title: 'Admins',
        href: '/dashboard/admin/users/admins',
        icon: Shield,
      },
    ],
  },
  {
    title: 'Route Management',
    href: '/dashboard/admin/routes',
    icon: Route,
  },
  {
    title: 'Financial Reports',
    href: '/dashboard/admin/financial',
    icon: CreditCard,
  },
  {
    title: 'System Settings',
    href: '/dashboard/admin/settings',
    icon: Settings,
  },
  {
    title: 'Support Tickets',
    href: '/dashboard/admin/support',
    icon: HelpCircle,
    badge: 7,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case UserRole.CUSTOMER:
        return customerNavItems;
      case UserRole.DRIVER:
        return driverNavItems;
      case UserRole.ADMIN:
        return adminNavItems;
      default:
        return [];
    }
  };

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const active = isActive(item.href);

    return (
      <div key={item.title}>
        <div className="relative">
          {hasChildren ? (
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start h-10 px-3',
                level > 0 && 'ml-4 w-[calc(100%-1rem)]',
                active && 'bg-accent text-accent-foreground'
              )}
              onClick={() => toggleExpanded(item.title)}
            >
              <item.icon className="mr-3 h-4 w-4" />
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto mr-2 h-5 px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start h-10 px-3',
                level > 0 && 'ml-4 w-[calc(100%-1rem)]',
                active && 'bg-accent text-accent-foreground'
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-4 w-4" />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </Button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className={cn('flex h-full w-64 flex-col border-r bg-background', className)}>
      {/* Logo and User Info */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">KingX</span>
        </Link>
      </div>

      {/* User Profile Section */}
      <div className="border-b p-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {getNavItems().map(item => renderNavItem(item))}
        </div>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="border-t p-3 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start h-10 px-3"
          asChild
        >
          <Link href="/help">
            <HelpCircle className="mr-3 h-4 w-4" />
            Help & Support
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start h-10 px-3"
          asChild
        >
          <Link href="/settings">
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Link>
        </Button>

        <Separator className="my-2" />
        
        <Button
          variant="ghost"
          className="w-full justify-start h-10 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}