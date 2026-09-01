'use client';

import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Pricing() {
  const tiers = [
    {
      name: 'Starter',
      price: '$0',
      period: 'forever free',
      description: 'Ideal for independent contractors starting out.',
      features: [
        'Up to 5 active clients',
        'Unlimited PDF downloads',
        'Direct shareable payment links',
        'Standard invoice numbering',
        'Automatic overdue calculations',
      ],
      cta: 'Get Started Free',
      href: '/signup',
      highlighted: false,
    },
    {
      name: 'Pro Studio',
      price: '$15',
      period: 'per month',
      description: 'For growing freelancers, agencies, and creative studios.',
      features: [
        'Unlimited clients & invoices',
        'Custom business logo & branding',
        'Multi-currency billing (USD, EUR, GBP, etc.)',
        'Real-time cash flow & revenue trends',
        'Audit trail & client view activity logs',
        'CSV export & priority email support',
      ],
      cta: 'Start Pro Trial',
      href: '/signup',
      highlighted: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
          Transparent Pricing
        </h2>
        <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Simple plans that scale with your studio
        </p>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3">
          No hidden transaction cuts on your earnings. Keep 100% of what you bill.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {tiers.map((tier, i) => (
          <div
            key={i}
            className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 ${
              tier.highlighted
                ? 'bg-slate-900 text-white shadow-2xl ring-2 ring-indigo-500'
                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-800 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    tier.highlighted
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tier.name}
                </span>
              </div>

              <div className="mb-4">
                <span className="text-4xl sm:text-5xl font-black tracking-tight">{tier.price}</span>
                <span
                  className={`text-xs ml-2 ${
                    tier.highlighted ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  /{tier.period}
                </span>
              </div>

              <p
                className={`text-sm mb-6 ${
                  tier.highlighted ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {tier.description}
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-200/40 dark:border-slate-800 mb-8">
                {tier.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <Check
                      className={`h-4 w-4 shrink-0 ${
                        tier.highlighted ? 'text-indigo-400' : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    />
                    <span className={tier.highlighted ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'}>
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link href={tier.href}>
              <Button
                variant={tier.highlighted ? 'primary' : 'outline'}
                className="w-full justify-center font-bold"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {tier.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
