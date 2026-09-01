'use client';

import React from 'react';
import {
  FileText,
  CreditCard,
  Clock,
  BarChart3,
  Globe2,
  Printer,
} from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: FileText,
      title: 'Itemized Invoice Engine',
      description:
        'Create itemized invoices with dynamic line items, quantity, rates, tax calculations, and customized payment terms.',
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      icon: CreditCard,
      title: 'Public Client Portal',
      description:
        'Clients open secure invoice links in any web browser without creating an account and can complete payment directly.',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      icon: Clock,
      title: 'Automated Overdue Detection',
      description:
        'Invoices past their due date automatically update to overdue status across your dashboard with 1-click reminders.',
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60',
    },
    {
      icon: BarChart3,
      title: 'Cash Velocity & Revenue Trends',
      description:
        'Gain full visibility into collected capital, pending balances, and monthly revenue trends over time.',
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60',
    },
    {
      icon: Globe2,
      title: 'Multi-Currency & Custom Branding',
      description:
        'Bill global clients in USD, EUR, GBP, CAD, AUD, INR, and more. Customize your logo, prefix, and banking details.',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60',
    },
    {
      icon: Printer,
      title: 'Print-Ready PDF Exports',
      description:
        'Download clean, agency-grade PDF invoices or print physical copies with dedicated print stylesheets.',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
          Product Capabilities
        </h2>
        <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Everything required to manage client billing
        </p>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3">
          Designed for independent contractors, freelancers, and small creative studios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {f.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
