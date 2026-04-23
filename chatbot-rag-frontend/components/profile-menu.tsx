'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, LogOut, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getDisplayName, setStoredAuthUser, useAuthUser } from '@/lib/auth-user';

interface ProfileMenuProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export function ProfileMenu({ onSignIn, onSignUp }: ProfileMenuProps) {
  const { user, displayName } = useAuthUser();

  const initials = React.useMemo(() => {
    const base = getDisplayName(user);
    const words = base.split(' ').filter(Boolean);
    const chars = words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '');
    return chars.join('') || 'N';
  }, [user]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
          <Button
            id="profile-menu-trigger"
            variant="ghost"
            className="h-9 rounded-xl px-2.5 gap-2 border"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface-01)',
              color: 'var(--foreground)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-semibold"
              style={{
                background: 'linear-gradient(135deg, color-mix(in oklch, var(--primary) 88%, white 12%) 0%, color-mix(in oklch, var(--primary) 76%, black 24%) 100%)',
                color: 'white',
              }}
            >
              {initials}
            </span>
            <span className="hidden sm:inline text-[12.5px] font-medium" style={{ opacity: 0.84 }}>
              {displayName}
            </span>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
        <DropdownMenuLabel className="px-2.5 py-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[12.5px] font-semibold leading-none">{displayName}</span>
            <span className="text-[11px] text-muted-foreground leading-none" style={{ opacity: 0.8 }}>
              {user?.email ?? 'Guest session'}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {!user ? (
          <>
            <DropdownMenuItem id="profile-signin" onClick={onSignIn} className="rounded-lg">
              <LogIn className="h-4 w-4" />
              Sign in
            </DropdownMenuItem>
            <DropdownMenuItem
              id="profile-signout"
              className="rounded-lg"
              onClick={() => setStoredAuthUser(null)}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
            <DropdownMenuItem id="profile-signup" onClick={onSignUp} className="rounded-lg">
              <UserPlus className="h-4 w-4" />
              Sign up
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem className="rounded-lg" disabled>
              <UserCircle2 className="h-4 w-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem
              id="profile-signout"
              className="rounded-lg"
              onClick={() => setStoredAuthUser(null)}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
