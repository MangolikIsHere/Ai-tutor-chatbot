'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import {
  Shield,
  CreditCard,
  BarChart3,
  LogOut,
  Crown,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useAuthUser } from '@/lib/auth-user';
import { useFirebaseAuth } from '@/lib/firebase-auth';

export default function AccountPage() {
  const router = useRouter();

  const { user, displayName } = useAuthUser();
  const { logout } = useFirebaseAuth();

  const initials =
    displayName?.charAt(0)?.toUpperCase() || 'N';

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl btn-gradient flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              My Account
            </h1>
            <p className="text-sm opacity-60">
              Manage your NeuralChat profile and plan
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="rounded-3xl border-border bg-card">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-5">
            <div className="w-20 h-20 rounded-3xl overflow-hidden bg-muted shrink-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full btn-gradient flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold truncate">
                {displayName}
              </h2>

              <p className="text-sm opacity-60 truncate">
                {user?.email || 'Guest'}
              </p>

              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium">
                <Shield className="w-3.5 h-3.5" />
                Verified Account
              </div>
            </div>

            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => router.push('/')}
            >
              Back to Chat
            </Button>
          </CardContent>
        </Card>

        {/* Plan + Usage */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Plan */}
          <Card className="rounded-3xl border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl btn-gradient flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">
                    Current Plan
                  </h3>
                  <p className="text-sm opacity-60">
                    Your subscription tier
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                <div className="text-sm opacity-70">
                  Active Plan
                </div>

                <div className="text-2xl font-bold mt-1">
                  Free Plan
                </div>

                <p className="text-sm opacity-60 mt-2">
                  Upgrade to unlock GPT-4, memory, priority speed and advanced tools.
                </p>

                <Button className="mt-4 rounded-xl btn-gradient text-white">
                  Upgrade to Pro
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage */}
          <Card className="rounded-3xl border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl btn-gradient flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">
                    Usage
                  </h3>
                  <p className="text-sm opacity-60">
                    This month
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-muted/40 p-4">
                  <div className="text-sm opacity-60">
                    Messages Sent
                  </div>
                  <div className="text-2xl font-bold">
                    127
                  </div>
                </div>

                <div className="rounded-2xl bg-muted/40 p-4">
                  <div className="text-sm opacity-60">
                    Chats Created
                  </div>
                  <div className="text-2xl font-bold">
                    18
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security */}
        <Card className="rounded-3xl border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl btn-gradient flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>

              <div>
                <h3 className="font-semibold text-lg">
                  Security & Access
                </h3>
                <p className="text-sm opacity-60">
                  Manage account safety
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-xl">
                Change Password
              </Button>

              <Button variant="outline" className="rounded-xl">
                Login Devices
              </Button>

              <Button
                variant="destructive"
                className="rounded-xl"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}