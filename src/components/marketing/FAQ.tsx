'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do my clients need to create an account to view and pay an invoice?',
      a: 'No! When you generate a shareable invoice link, your client can open it directly in any browser, download the PDF, or make an instant payment without creating any login or password.',
    },
    {
      q: 'How does overdue tracking work?',
      a: 'BillFlow automatically evaluates due dates in real time. If an unpaid invoice passes its due date, its status dynamically shifts to Overdue across your dashboard, triggering alerts and 1-click reminders without you needing to do manual bookkeeping.',
    },
    {
      q: 'Can I customize my invoice numbers, currency, and business logo?',
      a: 'Yes! In your Business Settings, you can configure your business logo, custom invoice prefix (e.g. INV- or STUDIO-), default currency (USD, EUR, GBP, CAD, AUD, INR, etc.), default payment terms, and bank details.',
    },
    {
      q: 'How does the AI invoice assistant work?',
      a: 'Simply type or paste a description of what you did (e.g. "30 hours React dev at $100/hr and $500 hosting setup"). Our AI automatically identifies deliverables, rates, quantities, and due dates, populating the invoice form in seconds.',
    },
    {
      q: 'Can I export my data or print invoices?',
      a: 'Yes. Every invoice includes a dedicated high-fidelity print/PDF engine and clean styling suitable for physical paper or digital PDF archiving.',
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Got questions? We have answers.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-indigo-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
