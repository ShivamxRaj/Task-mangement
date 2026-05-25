'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, User, CheckSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tasks/new', label: 'New Task', icon: PlusCircle },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 hidden md:flex flex-col p-4 transition-colors z-30">
      <div className="flex-1 space-y-1.5 mt-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon
                size={18}
                className={`${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/20 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-bold mb-1 text-slate-700 dark:text-slate-300">
          <CheckSquare size={13} className="text-blue-600" />
          <span>TaskFlow Workspace</span>
        </div>
        <span>Manage collaborative projects and team assignments in real-time.</span>
      </div>
    </aside>
  );
};
export default Sidebar;
