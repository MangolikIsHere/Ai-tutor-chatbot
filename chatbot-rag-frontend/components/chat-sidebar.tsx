'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
      delay: i * 0.03,
      ease: EASE,
    },
  }),
};

export function ChatSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <aside
        className={cn(
          'relative flex flex-col h-full shrink-0 bg-sidebar border-r border-sidebar-border transition-all duration-300',
          isCollapsed ? 'w-[60px]' : 'w-[265px]'
        )}
      >
        {/* Header */}
        <div className="h-16 px-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl btn-gradient flex items-center justify-center shadow-md shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <div className="font-semibold text-[15px] leading-none">
                NeuralChat
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] opacity-45 mt-1">
                PRO AI
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-3 pb-3 space-y-2">
          <Button
            onClick={createNewChat}
            className={cn(
              'btn-gradient text-white rounded-xl h-10',
              isCollapsed
                ? 'w-10 p-0'
                : 'w-full justify-start gap-2 px-3'
            )}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>New chat</span>}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setUploadOpen(true)}
            className={cn(
              'rounded-xl h-10',
              isCollapsed
                ? 'w-10 p-0'
                : 'w-full justify-start gap-2 px-3'
            )}
          >
            <FileUp className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Upload docs</span>}
          </Button>
        </div>

        {/* Chats */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-3">
            {chats.map((chat, idx) => {
              const active = currentChat?.id === chat.id;

              return (
                <motion.div
                  key={chat.id}
                  custom={idx}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  layout
                  className="relative group"
                >
                  <button
                    onClick={() => switchChat(chat.id)}
                    className={cn(
                      'w-full h-10 rounded-xl text-sm flex items-center gap-2 px-3 transition',
                      active
                        ? 'bg-sidebar-accent'
                        : 'hover:bg-sidebar-accent/60',
                      isCollapsed && 'justify-center px-0'
                    )}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />

                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">
                        {chat.title}
                      </span>
                    )}
                  </button>

                  {!isCollapsed && active && (
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
          </div>
        </ScrollArea>

        {/* Footer */}
        <div
          ref={panelRef}
          className="border-t border-sidebar-border p-3 relative"
        >
          {/* Elite Menu */}
          <AnimatePresence>
            {!isCollapsed && profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute bottom-[74px] left-3 right-3 rounded-2xl border border-sidebar-border bg-background shadow-2xl p-2 z-50"
              >
                <button className="w-full h-10 px-3 rounded-xl flex items-center gap-3 hover:bg-sidebar-accent text-sm">
                  <UserCircle2 className="w-4 h-4 shrink-0" />
                  <span>My Account</span>
                </button>

                <button className="w-full h-10 px-3 rounded-xl flex items-center gap-3 hover:bg-sidebar-accent text-sm">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Subscription</span>
                </button>

                <button className="w-full h-10 px-3 rounded-xl flex items-center gap-3 hover:bg-sidebar-accent text-sm">
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span>Usage</span>
                </button>

                <button className="w-full h-10 px-3 rounded-xl flex items-center gap-3 hover:bg-sidebar-accent text-sm">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={logout}
                  className="w-full h-10 px-3 rounded-xl flex items-center gap-3 hover:bg-red-500/10 text-red-400 text-sm"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Button */}
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={cn(
              'w-full rounded-2xl px-2 py-2 flex items-center gap-3 hover:bg-sidebar-accent transition',
              isCollapsed && 'justify-center px-0'
            )}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 bg-muted">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full btn-gradient flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {avatarInitial}
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[14px] font-semibold truncate">
                    {displayName}
                  </div>

                  <div className="text-[11px] opacity-50 truncate">
                    {user?.email || 'Guest'}
                  </div>
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

          {/* Collapse */}
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
    </>
  );
}