'use client';

import React from 'react';
import { Star } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Full-Stack Freelance Engineer',
      quote:
        'BillFlow saved me hours each month. My clients love the public payment link, and I get paid 3x faster without sending awkward follow-up emails manually.',
      rating: 5,
    },
    {
      name: 'David Rossi',
      role: 'Founder, Studio Lumina',
      quote:
        'The invoices look genuinely bespoke. Clients constantly compliment how professional our billing experience is compared to messy PDF attachments.',
      rating: 5,
    },
    {
      name: 'Elena Rostova',
      role: 'Product Designer & Consultant',
      quote:
        'The auto-overdue tracking and revenue dashboard give me complete visibility into my studio cash flow. It is indispensable for my freelance business.',
      rating: 5,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
            Testimonials
          </h2>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Loved by 5,000+ modern freelancers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 italic mb-6 leading-relaxed">
                  "{t.quote}"
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{t.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
