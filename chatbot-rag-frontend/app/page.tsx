'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { ChatSidebar } from '@/components/chat-sidebar';
import { MessageList } from '@/components/message-list';
import { MessageInput } from '@/components/message-input';
import { ProfileMenu } from '@/components/profile-menu';
import { ThemeToggle } from '@/components/theme-toggle';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

import { Menu, Sparkles } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

const sidebarVariants = {
  hidden: { x: -16, opacity: 0, filter: 'blur(4px)' },
  visible: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.42,
      ease: EASE,
      delay: 0.08,
    },
  },
};

const mainVariants = {
  hidden: { opacity: 0, y: 8, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.44,
      ease: EASE,
      delay: 0.14,
    },
  },
};

const composerVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: EASE,
      delay: 0.22,
    },
  },
};

const mobileNavVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: EASE,
      delay: 0.1,
    },
  },
};

function MobileNavbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  return (
    <motion.div
      variants={mobileNavVariants}
      initial="hidden"
      animate="visible"
      className="md:hidden flex items-center justify-between gap-2 h-12 px-4 shrink-0"
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--background)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Button
          size="icon"
          variant="ghost"
          onClick={onMenuClick}
          className="w-8 h-8 text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-4 h-4" />
        </Button>

        <span
          className="font-semibold"
          style={{
            fontSize: '14px',
            letterSpacing: '-0.02em',
          }}
        >
          NeuralChat
        </span>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </motion.div>
  );
}

function ChatInterface() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [appState, setAppState] = useState<
    'initial' | 'splash' | 'app'
  >('initial');

  useEffect(() => {
    setAppState('splash');

    const timer = setTimeout(() => {
      setAppState('app');
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Splash Screen */}
      <AnimatePresence>
        {appState === 'splash' && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.05,
              filter: 'blur(10px)',
              transition: {
                duration: 0.6,
                ease: EASE,
              },
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: EASE,
              }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative w-24 h-24 rounded-[32px] btn-gradient flex items-center justify-center shadow-2xl">
                <Sparkles className="w-11 h-11 text-white" />
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-[26px] tracking-tighter">
                  NeuralChat
                </span>

                <span className="text-[12px] uppercase tracking-[0.2em] opacity-50 text-muted-foreground">
                  Advanced RAG Assistant
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App */}
      <motion.div
        className="flex h-[100dvh] overflow-hidden bg-background"
        initial={{ opacity: 0 }}
        animate={{
          opacity: appState === 'app' ? 1 : 0,
        }}
        transition={{ duration: 0.28 }}
      >
        {/* Desktop Sidebar */}
        <motion.div
          className="hidden md:flex"
          variants={sidebarVariants}
          initial="hidden"
          animate={
            appState === 'app'
              ? 'visible'
              : 'hidden'
          }
        >
          <ChatSidebar />
        </motion.div>

        {/* Mobile Sidebar */}
        <Sheet
          open={mobileOpen}
          onOpenChange={setMobileOpen}
        >
          <SheetContent
            side="left"
            className="p-0 w-[260px] border-r border-sidebar-border bg-sidebar"
          >
            <SheetTitle className="sr-only">
              Navigation
            </SheetTitle>

            <div className="h-full">
              <ChatSidebar />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
          {/* Mobile Header */}
          <MobileNavbar
            onMenuClick={() =>
              setMobileOpen(true)
            }
          />

          {/* Desktop Header */}
          <motion.div
            className="hidden md:flex items-center justify-end h-12 px-5 shrink-0"
            style={{
              borderBottom:
                '1px solid var(--border)',
              background:
                'var(--background)',
            }}
            initial={{
              opacity: 0,
              y: -6,
            }}
            animate={{
              opacity:
                appState === 'app'
                  ? 1
                  : 0,
              y:
                appState === 'app'
                  ? 0
                  : -6,
            }}
            transition={{
              duration: 0.24,
              ease: EASE,
              delay: 0.1,
            }}
          >
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <ProfileMenu />
            </div>
          </motion.div>

          {/* Messages */}
          <motion.div
            className="flex-1 min-h-0 overflow-hidden"
            variants={mainVariants}
            initial="hidden"
            animate={
              appState === 'app'
                ? 'visible'
                : 'hidden'
            }
          >
            <MessageList />
          </motion.div>

          {/* Input */}
          <motion.div
            variants={composerVariants}
            initial="hidden"
            animate={
              appState === 'app'
                ? 'visible'
                : 'hidden'
            }
          >
            <MessageInput />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

export default function Home() {
  return <ChatInterface />;
}
