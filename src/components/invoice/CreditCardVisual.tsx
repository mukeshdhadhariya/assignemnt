'use client';

import React from 'react';
import { CreditCard, Cpu, Wifi } from 'lucide-react';

interface CreditCardVisualProps {
  cardNumber?: string;
  cardholderName?: string;
  cardExpiry?: string;
  cardType?: string;
}

export function CreditCardVisual({
  cardNumber = '•••• •••• •••• ••••',
  cardholderName = 'CARDHOLDER NAME',
  cardExpiry = 'MM/YY',
}: CreditCardVisualProps) {
  // Format card number with spaces every 4 chars
  const formatDisplayNumber = (num: string) => {
    if (!num) return '4242 •••• •••• 4242';
    const cleaned = num.replace(/\s+/g, '');
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.substring(i, i + 4));
    }
    return parts.join(' ') || '4242 •••• •••• 4242';
  };

  return (
    <div className="relative w-full max-w-sm h-48 sm:h-52 rounded-2xl p-5 sm:p-6 bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/30 overflow-hidden flex flex-col justify-between select-none mx-auto transform transition-transform hover:scale-[1.02]">
      {/* Decorative Glow & Lines */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/20 blur-2xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 blur-xl rounded-full pointer-events-none" />

      {/* Top Card Row */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {/* Gold EMV Chip */}
          <div className="h-8 w-11 rounded-md bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 p-0.5 shadow-inner border border-amber-600/40 flex items-center justify-center">
            <Cpu className="h-5 w-5 text-amber-900/70" />
          </div>
          <Wifi className="h-4 w-4 text-slate-400 rotate-90" />
        </div>

        <div className="text-right">
          <span className="font-extrabold tracking-wider text-sm bg-gradient-to-r from-indigo-300 to-white bg-clip-text text-transparent">
            BillFlow Pay
          </span>
          <span className="block text-[9px] uppercase font-mono tracking-widest text-slate-400">
            TEST MODE
          </span>
        </div>
      </div>

      {/* Center Number */}
      <div className="z-10 my-auto">
        <p className="font-mono text-base sm:text-lg tracking-[0.2em] text-slate-100 font-semibold drop-shadow-sm">
          {formatDisplayNumber(cardNumber)}
        </p>
      </div>

      {/* Bottom Name & Expiry */}
      <div className="flex items-end justify-between z-10 text-xs uppercase tracking-wider">
        <div className="min-w-0 pr-2">
          <span className="block text-[8px] text-slate-400 font-mono">Cardholder</span>
          <p className="font-mono font-bold truncate text-slate-200">
            {cardholderName || 'VALUED CLIENT'}
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="block text-[8px] text-slate-400 font-mono">Expires</span>
          <p className="font-mono font-bold text-slate-200">
            {cardExpiry || '12/28'}
          </p>
        </div>
      </div>
    </div>
  );
}
