'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatSidebar } from '@/components/chat-sidebar';
import { MessageList } from '@/components/message-list';
import { MessageInput } from '@/components/message-input';
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

function MobileNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <motion.div
      variants={mobileNavVariants}
      initial="hidden"
      animate="visible"
      className="md:hidden flex items-center gap-2 h-12 px-4 shrink-0"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}
    >
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
    </motion.div>
  );
}

// ─── Chat Interface ───────────────────────────────────────────────────────────

function ChatInterface() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appState, setAppState] = useState<'initial' | 'splash' | 'app'>('initial');

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
            exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: EASE }}
              className="flex flex-col items-center gap-5"
            >
              <div className="relative w-20 h-20 rounded-[28px] btn-gradient flex items-center justify-center shadow-2xl">
                <div className="absolute inset-0 rounded-[28px] btn-gradient opacity-40 blur-xl scale-110" />
                <Sparkles className="w-9 h-9 text-white relative z-10" />
              </div>
              <span
                className="font-semibold text-[22px] text-foreground"
                style={{ letterSpacing: '-0.03em' }}
              >
                NeuralChat
              </span>
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
          <MobileNavbar onMenuClick={() => setMobileOpen(true)} />

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
