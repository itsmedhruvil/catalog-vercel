'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Bell,
  Users,
  BarChart3,
  Truck,
  ChevronLeft,
} from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/catalog', label: 'Products', icon: Package },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/delivery', label: 'Delivery', icon: Truck },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Admin Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={20} className="text-blue-600" />
          <span className="font-bold text-gray-900">Admin Panel</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href || 
            (link.href !== '/admin' && pathname?.startsWith(link.href));
          const Icon = link.icon;

          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-full"
        >
          <ChevronLeft size={16} />
          Back to Site
        </button>
      </div>
    </aside>
  );
}