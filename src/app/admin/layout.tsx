'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Général', icon: LayoutDashboard },
  { href: '/admin/reservations', label: 'Réservations', icon: CalendarDays },
  { href: '/admin/properties', label: 'Propriétés', icon: Building2 },
  { href: '/admin/invoices', label: 'Factures', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} bg-blue-900 text-white flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className="flex items-center justify-between px-4 py-5 border-b border-blue-800">
          {sidebarOpen && <span className="text-xl font-bold">Avero</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:text-amber-400 transition">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                  isActive ? 'bg-amber-500 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 py-4 border-t border-blue-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Voir le site</span>}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}