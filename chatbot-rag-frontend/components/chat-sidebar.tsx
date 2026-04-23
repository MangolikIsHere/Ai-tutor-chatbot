'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  Plus,
  Trash2,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  FileUp,
  UserCircle2,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronUp,
} from 'lucide-react';

import { useChatContext } from '@/lib/chat-context';
import { useAuthUser } from '@/lib/auth-user';
import { useFirebaseAuth } from '@/lib/firebase-auth';
import { DocumentUploadDialog } from '@/components/document-upload-dialog';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

const chatItemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.22,
      ease: EASE,
      delay: index * 0.035,
    },
  }),
  exit: {
    opacity: 0,
    x: -6,
    transition: {
      duration: 0.14,
      ease: 'easeInOut',
    },
  },
};

export function ChatSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { user, displayName } = useAuthUser();
  const { logout } = useFirebaseAuth();

  const {
    chats,
    currentChat,
    createNewChat,
    switchChat,
    deleteCurrentChat,
  } = useChatContext();

  const avatarInitial = useMemo(() => {
    const first = displayName?.trim()?.charAt(0);
    return first ? first.toUpperCase() : 'N';
  }, [displayName]);

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          'relative flex flex-col h-full shrink-0 overflow-hidden bg-sidebar',
          'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isCollapsed ? 'w-[56px]' : 'w-[248px]'
        )}
        style={{ borderRight: '1px solid var(--sidebar-border)' }}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center gap-3 px-4 shrink-0',
            isCollapsed && 'justify-center px-0'
          )}
          style={{ height: '64px' }}
        >
          <motion.div
            className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.08, rotate: 5 }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                key="brand"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col min-w-0"
              >
                <span className="font-bold text-[15px] tracking-tight">
                  NeuralChat
                </span>
                <span className="text-[10px] uppercase tracking-widest opacity-40">
                  Pro AI
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-b border-sidebar-border" />

        {/* Actions */}
        <div
          className={cn(
            'flex flex-col gap-1.5 px-2.5 py-3',
            isCollapsed && 'px-2'
          )}
        >
          <Button
            onClick={createNewChat}
            size={isCollapsed ? 'icon' : 'sm'}
            className={cn(
              'btn-gradient text-white',
              isCollapsed
                ? 'w-9 h-9 rounded-xl'
                : 'w-full h-9 justify-start gap-2 rounded-xl'
            )}
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span>New chat</span>}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setUploadOpen(true)}
            size={isCollapsed ? 'icon' : 'sm'}
            className={cn(
              isCollapsed
                ? 'w-9 h-9 rounded-xl'
                : 'w-full h-9 justify-start gap-2 rounded-xl'
            )}
          >
            <FileUp className="w-4 h-4" />
            {!isCollapsed && <span>Upload docs</span>}
          </Button>
        </div>

        {/* Chats */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-3">
            <AnimatePresence initial={false}>
              {chats.map((chat, idx) => {
                const isActive = currentChat?.id === chat.id;

                return (
                  <motion.div
                    key={chat.id}
                    custom={idx}
                    variants={chatItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="group relative"
                  >
                    <button
                      onClick={() => switchChat(chat.id)}
                      className={cn(
                        'w-full flex items-center gap-2 rounded-xl text-left transition-all',
                        isCollapsed
                          ? 'justify-center p-2 h-10'
                          : 'px-3 py-2 h-[42px]',
                        isActive
                          ? 'bg-sidebar-accent'
                          : 'hover:bg-sidebar-accent/60'
                      )}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0" />

                      {!isCollapsed && (
                        <span className="truncate flex-1 text-sm">
                          {chat.title}
                        </span>
                      )}
                    </button>

                    {!isCollapsed && isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCurrentChat();
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-sidebar-border" />

        <div
          className={cn(
            'relative px-3 py-3',
            isCollapsed && 'px-2'
          )}
        >
          {/* Profile Trigger */}
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-sidebar-accent',
              isCollapsed && 'justify-center px-0'
            )}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full btn-gradient flex items-center justify-center">
                  <span className="text-white text-[13px] font-bold">
                    {avatarInitial}
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <>
                <div className="flex flex-col flex-1 min-w-0 text-left">
                  <span className="text-[13px] font-semibold truncate">
                    {displayName}
                  </span>
                  <span className="text-[11px] opacity-50 truncate">
                    {user?.email || 'Guest'}
                  </span>
                </div>

                <ChevronUp
                  className={cn(
                    'w-4 h-4 opacity-50 transition-transform',
                    profileOpen && 'rotate-180'
                  )}
                />
              </>
            )}
          </button>

          {/* Elite Panel */}
          {!isCollapsed && profileOpen && (
            <div className="absolute bottom-16 left-3 right-3 rounded-2xl border border-sidebar-border bg-sidebar shadow-2xl p-2 z-50 space-y-1">
              <button className="elite-menu-btn">
                <UserCircle2 className="w-4 h-4" />
                <span>My Account</span>
              </button>

              <button className="elite-menu-btn">
                <CreditCard className="w-4 h-4" />
                <span>Subscription</span>
              </button>

              <button className="elite-menu-btn">
                <BarChart3 className="w-4 h-4" />
                <span>Usage</span>
              </button>

              <button className="elite-menu-btn">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={logout}
                className="elite-menu-btn text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Collapse Button */}
          <div className="mt-2 flex justify-end">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-8 h-8 rounded-lg"
            >
              {isCollapsed ? (
                <PanelLeft className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>

      <DocumentUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />
    </TooltipProvider>
  );
}