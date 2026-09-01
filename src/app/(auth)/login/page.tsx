'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please provide both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      toast.success('Signed in successfully.');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <img
            src="/icon.png"
            alt="BillFlow"
            className="h-10 w-10 rounded-xl shadow-md group-hover:scale-105 transition-transform object-cover"
          />
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
            BillFlow
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Sign in to your account
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Manage your clients, invoices, and studio payments
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@studio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                required
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full justify-center font-bold text-sm shadow-md shadow-indigo-500/20"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Sign In
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Create one free
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
