'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useChatContext } from '@/lib/chat-context';
import { DocumentUploadDialog } from '@/components/document-upload-dialog';
import { cn } from '@/lib/utils';

// ─── Animation presets ────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;

const chatItemVariants = {
  hidden:  { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.22, ease: EASE, delay: i * 0.035 },
  }),
  exit: { opacity: 0, x: -6, transition: { duration: 0.14, ease: 'easeIn' } },
};

const titleVariants = {
  hidden:  { opacity: 0, filter: 'blur(3px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.30, ease: EASE },
  },
};

export function ChatSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { chats, currentChat, createNewChat, switchChat, deleteCurrentChat } =
    useChatContext();

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          'relative flex flex-col h-full shrink-0 overflow-hidden bg-sidebar',
          'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width]',
          isCollapsed ? 'w-[56px]' : 'w-[248px]'
        )}
        style={{ borderRight: '1px solid var(--sidebar-border)' }}
      >
        {/* ── Brand header ──────────────────────────────────────── */}
        <div
          className={cn(
            'flex items-center gap-2.5 px-3.5 shrink-0',
            isCollapsed && 'justify-center px-0',
          )}
          style={{ height: '54px' }}
        >
          <motion.div
            className="flex-shrink-0 w-7 h-7 rounded-[10px] btn-gradient flex items-center justify-center"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.18)' }}
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </motion.div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                key="wordmark"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.20, ease: EASE }}
                className="font-semibold text-[15px] select-none"
                style={{ color: 'var(--sidebar-foreground)', letterSpacing: '-0.024em' }}
              >
                NeuralChat
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Hairline separator */}
        <div style={{ height: '1px', background: 'var(--sidebar-border)', flexShrink: 0 }} />

        {/* ── Action buttons ─────────────────────────────────────── */}
        <div
          className={cn(
            'flex flex-col gap-1.5 px-2.5 py-3',
            isCollapsed && 'px-2 items-center'
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                <Button
                  id="new-chat-btn"
                  onClick={createNewChat}
                  size={isCollapsed ? 'icon' : 'sm'}
                  className={cn(
                    'btn-gradient text-white transition-opacity duration-150 hover:opacity-90',
                    isCollapsed
                      ? 'w-9 h-9 rounded-xl shadow-sm'
                      : 'w-full h-9 justify-start gap-2.5 rounded-xl shadow-sm'
                  )}
                  style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '-0.010em' }}
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  {!isCollapsed && <span>New chat</span>}
                </Button>
              </motion.div>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">New chat</TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                <Button
                  id="upload-docs-btn"
                  variant="ghost"
                  size={isCollapsed ? 'icon' : 'sm'}
                  onClick={() => setUploadOpen(true)}
                  className={cn(
                    'hover:bg-sidebar-accent transition-all duration-150',
                    isCollapsed
                      ? 'w-9 h-9 rounded-xl'
                      : 'w-full h-9 justify-start gap-2.5 rounded-xl'
                  )}
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    letterSpacing: '-0.010em',
                    color: 'var(--sidebar-foreground)',
                    opacity: 0.62,
                  }}
                >
                  <FileUp className="w-3.5 h-3.5 shrink-0" />
                  {!isCollapsed && <span>Upload docs</span>}
                </Button>
              </motion.div>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Upload documents</TooltipContent>}
          </Tooltip>
        </div>

        {/* ── Section label ─────────────────────────────────────── */}
        <AnimatePresence>
          {!isCollapsed && chats.length > 0 && (
            <motion.div
              key="section-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="px-3.5 pb-1.5"
            >
              <p
                className="text-[10px] font-semibold uppercase select-none"
                style={{ color: 'var(--muted-foreground)', opacity: 0.42, letterSpacing: '0.09em' }}
              >
                Chats
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Chat list ─────────────────────────────────────────── */}
        <ScrollArea className="flex-1 px-2">
          {chats.length === 0 && !isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.30, delay: 0.1 }}
              className="py-10 flex flex-col items-center gap-2 text-center px-4"
            >
              <MessageSquare
                className="w-5 h-5"
                style={{ color: 'var(--muted-foreground)', opacity: 0.18 }}
              />
              <p
                className="text-[12px]"
                style={{ color: 'var(--muted-foreground)', opacity: 0.38, letterSpacing: '-0.01em' }}
              >
                No chats yet
              </p>
            </motion.div>
          ) : (
            <div className="space-y-0.5 pb-2">
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
                      layout="position"
                      className="group/item relative"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            id={`chat-item-${chat.id}`}
                            onClick={() => switchChat(chat.id)}
                            className={cn(
                              'w-full flex items-center gap-2 rounded-xl text-left outline-none',
                              'focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                              isCollapsed ? 'justify-center p-2 h-9' : 'px-2.5 py-2 h-9',
                            )}
                            style={{
                              fontSize: '13px',
                              letterSpacing: '-0.012em',
                              fontWeight: isActive ? 500 : 400,
                              borderLeft: isActive
                                ? '2px solid var(--primary)'
                                : '2px solid transparent',
                              background: isActive ? 'var(--sidebar-accent)' : 'transparent',
                              color: 'var(--sidebar-foreground)',
                              opacity: isActive ? 1 : 0.55,
                            }}
                            whileHover={!isActive ? {
                              backgroundColor: 'var(--sidebar-accent)',
                              opacity: 0.88,
                            } : {}}
                            transition={{ duration: 0.12 }}
                          >
                            <MessageSquare
                              className="shrink-0 transition-colors"
                              style={{
                                width: isCollapsed ? '16px' : '13px',
                                height: isCollapsed ? '16px' : '13px',
                                color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                                opacity: isActive ? 1 : 0.40,
                              }}
                            />
                            {!isCollapsed && (
                              <AnimatePresence mode="wait">
                                <motion.span
                                  key={chat.title}
                                  variants={titleVariants}
                                  initial="hidden"
                                  animate="visible"
                                  className="truncate flex-1 leading-snug"
                                >
                                  {chat.title}
                                </motion.span>
                              </AnimatePresence>
                            )}
                          </motion.button>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right" className="max-w-[180px] text-xs">
                            {chat.title}
                          </TooltipContent>
                        )}
                      </Tooltip>

                      {/* Delete button — hover, active only */}
                      {!isCollapsed && isActive && (
                        <motion.div
                          className="absolute right-1.5 top-1/2 -translate-y-1/2"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 0 }}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.button
                                id={`delete-chat-${chat.id}`}
                                onClick={(e) => { e.stopPropagation(); deleteCurrentChat(); }}
                                aria-label="Delete chat"
                                className={cn(
                                  'p-1 rounded-lg transition-colors duration-150',
                                  'opacity-0 group-hover/item:opacity-100',
                                )}
                                style={{ color: 'var(--muted-foreground)' }}
                                whileHover={{
                                  color: 'var(--destructive)',
                                  backgroundColor: 'oklch(from var(--destructive) l c h / 0.10)',
                                }}
                                whileTap={{ scale: 0.90 }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </motion.button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="text-xs">Delete</TooltipContent>
                          </Tooltip>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div style={{ height: '1px', background: 'var(--sidebar-border)', flexShrink: 0 }} />
        <div
          className={cn(
            'flex items-center px-3 gap-2 shrink-0',
            isCollapsed && 'justify-center px-0'
          )}
          style={{ height: '52px' }}
        >
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                key="footer-status"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.18, ease: EASE }}
                className="flex items-center gap-2 flex-1 min-w-0"
              >
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-55" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span
                  className="text-[12px] truncate font-medium"
                  style={{ color: 'var(--sidebar-foreground)', opacity: 0.42, letterSpacing: '-0.012em' }}
                >
                  Connected
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.10 }} whileTap={{ scale: 0.92 }}>
                <Button
                  id="sidebar-collapse-btn"
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  className="w-7 h-7 shrink-0 rounded-lg hover:bg-sidebar-accent transition-colors"
                  style={{ color: 'var(--sidebar-foreground)', opacity: 0.35 }}
                >
                  {isCollapsed
                    ? <PanelLeft className="w-3.5 h-3.5" />
                    : <PanelLeftClose className="w-3.5 h-3.5" />
                  }
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {isCollapsed ? 'Expand' : 'Collapse'}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </TooltipProvider>
  );
}
