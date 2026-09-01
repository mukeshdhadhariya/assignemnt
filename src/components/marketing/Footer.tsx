'use client';

import React from 'react';
import Link from 'next/link';
import { Receipt } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
          <div className="h-6 w-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Receipt className="h-3.5 w-3.5" />
          </div>
          <span>BillFlow Invoicing SaaS</span>
        </div>

        <p className="text-slate-400">
          © {new Date().getFullYear()} BillFlow. All rights reserved. Built with Next.js, TypeScript, Tailwind CSS, & Prisma.
        </p>

        <div className="flex items-center gap-6">
          <Link href="/login" className="hover:text-indigo-600 transition-colors">
            Login
          </Link>
          <Link href="/signup" className="hover:text-indigo-600 transition-colors">
            Sign Up
          </Link>
          <Link href="/i/demo-inv-0101-acme" target="_blank" className="hover:text-indigo-600 transition-colors">
            Sample Public Invoice
          </Link>
        </div>
      </div>
    </footer>
  );
}
