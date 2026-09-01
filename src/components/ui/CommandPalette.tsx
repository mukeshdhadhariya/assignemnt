'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  FileText,
  Users,
  LayoutDashboard,
  Settings,
  Sparkles,
  DollarSign,
  ArrowRight,
  Receipt,
  Download,
  ExternalLink,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/components/providers/AuthProvider';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
  onNewInvoice?: () => void;
  onNewClient?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigateTab,
  onNewInvoice,
  onNewClient,
}: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme, isDark } = useTheme();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'new-invoice',
      title: 'Create New Invoice',
      subtitle: 'Open the live invoice builder studio',
      icon: Plus,
      category: 'Actions',
      run: () => {
        if (onNewInvoice) onNewInvoice();
        else router.push('/invoices/new');
        onClose();
      },
    },
    {
      id: 'new-client',
      title: 'Add New Client',
      subtitle: 'Add a new client or company contact',
      icon: Users,
      category: 'Actions',
      run: () => {
        if (onNewClient) onNewClient();
        onClose();
      },
    },
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      subtitle: 'View real-time revenue and KPIs',
      icon: LayoutDashboard,
      category: 'Navigation',
      run: () => {
        if (onNavigateTab) onNavigateTab('dashboard');
        else router.push('/dashboard');
        onClose();
      },
    },
    {
      id: 'nav-invoices',
      title: 'Go to Invoices',
      subtitle: 'Manage, search, and filter all invoices',
      icon: FileText,
      category: 'Navigation',
      run: () => {
        if (onNavigateTab) onNavigateTab('invoices');
        else router.push('/invoices');
        onClose();
      },
    },
    {
      id: 'nav-clients',
      title: 'Go to Clients Directory',
      subtitle: 'View client CRM & billing balances',
      icon: Users,
      category: 'Navigation',
      run: () => {
        if (onNavigateTab) onNavigateTab('clients');
        else router.push('/clients');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings',
      subtitle: 'Customize branding, logo, and currency',
      icon: Settings,
      category: 'Navigation',
      run: () => {
        if (onNavigateTab) onNavigateTab('settings');
        else router.push('/settings');
        onClose();
      },
    },
    {
      id: 'theme-toggle',
      title: isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      subtitle: 'Toggle workspace appearance',
      icon: isDark ? Sun : Moon,
      category: 'Preferences',
      run: () => {
        setTheme(isDark ? 'light' : 'dark');
        onClose();
      },
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search (e.g. 'new invoice', 'dashboard', 'theme')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            autoFocus
            className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching commands or pages found.
            </div>
          ) : (
            filtered.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.run}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {action.title}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {action.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                    {action.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd></span>
            <span>Select: <kbd className="font-mono">↵</kbd></span>
          </div>
          <span>BillFlow Pro Command Center</span>
        </div>
      </div>
    </div>
  );
}
