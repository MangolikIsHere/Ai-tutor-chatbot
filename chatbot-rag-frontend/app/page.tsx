'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatSidebar } from '@/components/chat-sidebar';
import { MessageList } from '@/components/message-list';
import { MessageInput } from '@/components/message-input';
import { ProfileMenu } from '@/components/profile-menu';
import { ChatProvider } from '@/lib/chat-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Menu, Sparkles } from 'lucide-react';

// ─── Animation variants ───────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const; // Custom ease — fast-out, stays crisp

const sidebarVariants = {
  hidden:  { x: -16, opacity: 0, filter: 'blur(4px)' },
  visible: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.42, ease: EASE, delay: 0.08 },
  },
};

const mainVariants = {
  hidden:  { opacity: 0, y: 8, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.44, ease: EASE, delay: 0.14 },
  },
};

const composerVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.40, ease: EASE, delay: 0.22 },
  },
};

const mobileNavVariants = {
  hidden:  { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: EASE, delay: 0.10 },
  },
};

// ─── Mobile navbar ────────────────────────────────────────────────────────────

function MobileNavbar({
  onMenuClick,
  onSignIn,
  onSignUp,
}: {
  onMenuClick: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
}) {
  return (
    <motion.div
      variants={mobileNavVariants}
      initial="hidden"
      animate="visible"
      className="md:hidden flex items-center justify-between gap-2 h-12 px-4 shrink-0"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Button
          id="mobile-menu-btn"
          size="icon"
          variant="ghost"
          onClick={onMenuClick}
          className="w-8 h-8 text-muted-foreground hover:text-foreground"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </Button>
        <span
          className="font-semibold"
          style={{ fontSize: '14px', letterSpacing: '-0.020em' }}
        >
          NeuralChat
        </span>
      </div>

      <ProfileMenu onSignIn={onSignIn} onSignUp={onSignUp} />
    </motion.div>
  );
}

// ─── Chat Interface ───────────────────────────────────────────────────────────

function ChatInterface() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appState, setAppState] = useState<'initial' | 'splash' | 'app'>('initial');

  const handleSignIn = React.useCallback(() => {
    // Placeholder hook for Firebase auth modal/routing.
    console.info('Sign in clicked');
  }, []);

  const handleSignUp = React.useCallback(() => {
    // Placeholder hook for Firebase auth modal/routing.
    console.info('Sign up clicked');
  }, []);

  useEffect(() => {
    // Show splash screen after hydration
    setAppState('splash');
    // Transition to app
    const timer = setTimeout(() => {
      setAppState('app');
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {appState === 'splash' && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.05,
              filter: 'blur(10px)',
              transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: 'blur(12px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: EASE }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative w-24 h-24 rounded-[32px] btn-gradient flex items-center justify-center shadow-2xl">
                {/* Outer Glow Ring */}
                <motion.div
                  className="absolute inset-0 rounded-[32px] btn-gradient opacity-40 blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 180, 270, 360],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <Sparkles className="w-11 h-11 text-white relative z-10" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col items-center gap-1"
              >
                <span
                  className="font-bold text-[26px] text-foreground tracking-tighter"
                >
                  NeuralChat
                </span>
                <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-[0.2em] opacity-50">
                  Advanced RAG Assistant
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex h-[100dvh] overflow-hidden bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: appState === 'app' ? 1 : 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        {/* ── Desktop sidebar ─────────────────────────────────────── */}
        <motion.div
          className="hidden md:flex"
          variants={sidebarVariants}
          initial="hidden"
          animate={appState === 'app' ? 'visible' : 'hidden'}
        >
          <ChatSidebar />
        </motion.div>

        {/* ── Mobile sidebar sheet ─────────────────────────────────── */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="p-0 w-[260px] border-r border-sidebar-border bg-sidebar"
            aria-describedby={undefined}
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="h-full">
              <ChatSidebar />
            </div>
          </SheetContent>
        </Sheet>

        {/* ── Main area ────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
          {/* Mobile navbar */}
          <MobileNavbar
            onMenuClick={() => setMobileOpen(true)}
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
          />

          {/* Desktop top bar */}
          <motion.div
            className="hidden md:flex items-center justify-end h-12 px-5 shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: appState === 'app' ? 1 : 0, y: appState === 'app' ? 0 : -6 }}
            transition={{ duration: 0.24, ease: EASE, delay: 0.1 }}
          >
            <ProfileMenu onSignIn={handleSignIn} onSignUp={handleSignUp} />
          </motion.div>

          {/* Message thread */}
          <motion.div
            className="flex-1 min-h-0 overflow-hidden"
            variants={mainVariants}
            initial="hidden"
            animate={appState === 'app' ? 'visible' : 'hidden'}
          >
            <MessageList />
          </motion.div>

          {/* Composer */}
          <motion.div
            variants={composerVariants}
            initial="hidden"
            animate={appState === 'app' ? 'visible' : 'hidden'}
          >
            <MessageInput />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <ChatProvider>
      <ChatInterface />
    </ChatProvider>
  );
}
