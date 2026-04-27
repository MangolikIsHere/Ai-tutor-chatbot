'use client';

import React, {
  useState,
  useEffect,
} from 'react';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  Menu,
  Sparkles,
} from 'lucide-react';

import { ChatSidebar } from '@/components/chat-sidebar';
import { MessageList } from '@/components/message-list';
import { MessageInput } from '@/components/message-input';
import { ProfileMenu } from '@/components/profile-menu';
import { ThemeToggle } from '@/components/theme-toggle';

import {
  Button,
} from '@/components/ui/button';

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────────────────────────── */

function Splash({
  visible,
}: {
  visible: boolean;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
            scale: 1.03,
            filter:
              'blur(10px)',
          }}
          transition={{
            duration: 0.55,
            ease: EASE,
          }}
        >
          <motion.div
            initial={{
              scale: 0.8,
              opacity: 0,
              y: 10,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              ease: EASE,
            }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="absolute inset-0 blur-3xl opacity-30 btn-gradient rounded-full scale-[1.8]" />

              <div className="relative w-24 h-24 rounded-[32px] btn-gradient flex items-center justify-center shadow-2xl">
                <Sparkles className="w-11 h-11 text-white" />
              </div>
            </div>

            <div className="text-center">
              <div className="text-[28px] font-bold tracking-tight">
                NeuralChat
              </div>

              <div className="text-[11px] uppercase tracking-[0.22em] opacity-50 mt-1">
                Premium AI Workspace
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────────────────────────── */

function MobileHeader({
  onMenu,
}: {
  onMenu: () => void;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        ease: EASE,
      }}
      className="md:hidden h-14 px-4 flex items-center justify-between shrink-0 backdrop-blur-xl border-b"
      style={{
        background:
          'color-mix(in oklch, var(--background) 86%, transparent)',
        borderColor:
          'var(--border)',
      }}
    >
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={onMenu}
          className="w-9 h-9 rounded-xl"
        >
          <Menu className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl btn-gradient flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>

          <span className="font-semibold text-sm tracking-tight">
            NeuralChat
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </motion.div>
  );
}

/* ───────────────────────────── */

function DesktopHeader() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.32,
        ease: EASE,
      }}
      className="hidden md:flex h-14 px-5 items-center justify-between shrink-0 border-b backdrop-blur-xl"
      style={{
        background:
          'color-mix(in oklch, var(--background) 82%, transparent)',
        borderColor:
          'var(--border)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>

        <div>
          <p className="text-sm font-semibold tracking-tight">
            NeuralChat
          </p>

          <p className="text-[11px] opacity-55">
            Smart AI Assistant
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </motion.div>
  );
}

/* ───────────────────────────── */

function ChatInterface() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [showSplash, setShowSplash] =
    useState(true);

  useEffect(() => {
    const timer =
      setTimeout(() => {
        setShowSplash(false);
      }, 1050);

    return () =>
      clearTimeout(timer);
  }, []);

  return (
    <>
      <Splash
        visible={
          showSplash
        }
      />

      <div className="h-[100dvh] flex overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <ChatSidebar />
        </div>

        {/* Mobile Sidebar */}
        <Sheet
          open={mobileOpen}
          onOpenChange={
            setMobileOpen
          }
        >
          <SheetContent
            side="left"
            className="p-0 w-[280px] border-r bg-sidebar"
          >
            <SheetTitle className="sr-only">
              Sidebar
            </SheetTitle>

            <ChatSidebar />
          </SheetContent>
        </Sheet>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
          {/* subtle background depth */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[420px] h-[420px] rounded-full blur-3xl opacity-[0.05] btn-gradient" />

            <div className="absolute bottom-0 right-1/4 w-[360px] h-[360px] rounded-full blur-3xl opacity-[0.04] btn-gradient" />
          </div>

          <MobileHeader
            onMenu={() =>
              setMobileOpen(
                true
              )
            }
          />

          <DesktopHeader />

          {/* Messages */}
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity:
                showSplash
                  ? 0
                  : 1,
              y:
                showSplash
                  ? 8
                  : 0,
            }}
            transition={{
              duration: 0.4,
              ease: EASE,
            }}
            className="relative flex-1 min-h-0 overflow-hidden"
          >
            <MessageList />
          </motion.div>

          {/* Composer */}
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity:
                showSplash
                  ? 0
                  : 1,
              y:
                showSplash
                  ? 18
                  : 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.08,
              ease: EASE,
            }}
            className="relative"
          >
            <div
              className="absolute inset-x-0 top-0 h-14 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, var(--background))',
              }}
            />

            <div className="backdrop-blur-xl">
              <MessageInput />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

/* ───────────────────────────── */

export default function Home() {
  return (
    <ChatInterface />
  );
}