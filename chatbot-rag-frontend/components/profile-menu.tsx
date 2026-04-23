'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import {
  LogIn,
  LogOut,
  UserPlus,
  UserCircle2
} from 'lucide-react'

import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useFirebaseAuth } from '@/lib/firebase-auth'

export function ProfileMenu() {
  const router = useRouter()
  const { user, logout } = useFirebaseAuth()

  const displayName =
    user?.displayName ||
    user?.email ||
    'Guest'

  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
          <Button
            variant="ghost"
            className="h-9 rounded-xl px-2.5 gap-2 border"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-semibold bg-primary text-white">
              {initials || 'N'}
            </span>

            <span className="hidden sm:inline text-[12.5px] font-medium opacity-80">
              {displayName}
            </span>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
        <DropdownMenuLabel className="px-2.5 py-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[12.5px] font-semibold">
              {displayName}
            </span>

            <span className="text-[11px] text-muted-foreground">
              {user?.email || 'Guest session'}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {!user ? (
          <>
            <DropdownMenuItem onClick={() => router.push('/auth?tab=signin')}>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push('/auth?tab=signup')}>
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem>
              <UserCircle2 className="h-4 w-4 mr-2" />
              Account
            </DropdownMenuItem>

            <DropdownMenuItem onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}