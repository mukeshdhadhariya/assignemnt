'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/icon.png"
            alt="BillFlow Logo"
            className="h-8 w-8 rounded-lg shadow-sm group-hover:scale-105 transition-transform object-cover"
          />
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
            BillFlow
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Features
          </a>
          <a href="#interactive-demo" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Calculator
          </a>
          <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Pricing
          </a>
          <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>

          <Link href="/signup">
            <Button size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
