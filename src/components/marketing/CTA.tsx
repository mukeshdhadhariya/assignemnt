'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CTA() {
  return (
    <section className="py-20 sm:py-24 bg-indigo-600 dark:bg-indigo-950 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
          Ready to streamline your billing?
        </h2>
        <p className="text-base sm:text-lg text-indigo-100 max-w-2xl mx-auto mb-8">
          Join independent developers, designers, and consultants who get paid on time with BillFlow.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full bg-white text-indigo-700 hover:bg-indigo-50 border-0 font-bold shadow-xl"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Get Started Free
            </Button>
          </Link>

          <Link href="/login" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full text-white border-white/40 hover:bg-white/10"
            >
              Sign In to Account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
