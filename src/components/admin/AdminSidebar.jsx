'use client';

import Link from 'next/link';
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
    <aside className="hidden lg:sticky lg:top-16 lg:z-20 lg:w-64 lg:min-h-[calc(100vh-4rem)] lg:border-r lg:flex lg:flex-col lg:shrink-0">
      {/* Admin Header */}
      <div className="hidden p-4 border-b border-gray-200 lg:block">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={20} className="text-blue-600" />
          <span className="font-bold text-gray-900">Admin Panel</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col space-y-1 p-3">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href || 
            (link.href !== '/admin' && pathname?.startsWith(link.href));
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              <span className="max-w-full truncate leading-tight">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="hidden p-4 border-t border-gray-200 lg:block">
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
