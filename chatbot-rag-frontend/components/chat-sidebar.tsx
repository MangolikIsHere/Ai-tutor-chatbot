'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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

export function ChatSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { chats, currentChat, createNewChat, switchChat, deleteCurrentChat } =
    useChatContext();

  return (
    <TooltipProvider delayDuration={250}>
      {/* ── Sidebar shell ────────────────────────────────────────── */}
      <aside
        className={cn(
          'relative flex flex-col h-full shrink-0 overflow-hidden',
          'border-r border-sidebar-border bg-sidebar',
          'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isCollapsed ? 'w-[60px]' : 'w-[256px]'
        )}
      >
        {/* ── Brand header ─────────────────────────────────────── */}
        <div
          className={cn(
            'flex items-center gap-2.5 h-14 px-4 shrink-0',
            isCollapsed && 'justify-center px-0'
          )}
        >
          <div className="flex-shrink-0 w-7 h-7 rounded-lg btn-gradient flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-[14px] tracking-tight text-sidebar-foreground select-none">
              NeuralChat
            </span>
          )}
        </div>

        <Separator className="bg-sidebar-border" />

        {/* ── Action buttons ────────────────────────────────────── */}
        <div className={cn('flex flex-col gap-1.5 px-3 py-3', isCollapsed && 'px-2 items-center')}>
          {/* New chat */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                id="new-chat-btn"
                onClick={createNewChat}
                size={isCollapsed ? 'icon' : 'sm'}
                className={cn(
                  'btn-gradient text-white shadow-sm transition-all duration-150',
                  'hover:opacity-90 active:scale-[0.97] press-active',
                  isCollapsed ? 'w-9 h-9' : 'w-full h-8 justify-start gap-2 text-[13px]'
                )}
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span>New chat</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">New chat</TooltipContent>}
          </Tooltip>

          {/* Upload documents */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                id="upload-docs-btn"
                variant="outline"
                size={isCollapsed ? 'icon' : 'sm'}
                onClick={() => setUploadOpen(true)}
                className={cn(
                  'border-sidebar-border bg-transparent text-sidebar-foreground/70',
                  'hover:bg-sidebar-accent hover:text-sidebar-foreground hover:border-sidebar-border',
                  'transition-all duration-150 active:scale-[0.97]',
                  isCollapsed ? 'w-9 h-9' : 'w-full h-8 justify-start gap-2 text-[13px]'
                )}
              >
                <FileUp className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span>Upload docs</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Upload documents</TooltipContent>}
          </Tooltip>
        </div>

        {/* ── Section label ─────────────────────────────────────── */}
        {!isCollapsed && chats.length > 0 && (
          <div className="px-4 pb-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
              Recent
            </p>
          </div>
        )}

        {/* ── Chat list ─────────────────────────────────────────── */}
        <ScrollArea className={cn('flex-1', isCollapsed ? 'px-2' : 'px-2')}>
          {chats.length === 0 && !isCollapsed ? (
            <div className="py-10 flex flex-col items-center gap-2 text-center px-4">
              <MessageSquare className="w-6 h-6 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground/60">No chats yet</p>
            </div>
          ) : (
            <div className="space-y-0.5 pb-2">
              {chats.map((chat, idx) => {
                const isActive = currentChat?.id === chat.id;
                return (
                  <div
                    key={chat.id}
                    className="group/item relative sidebar-item-enter"
                    style={{ animationDelay: `${idx * 20}ms` }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          id={`chat-item-${chat.id}`}
                          onClick={() => switchChat(chat.id)}
                          className={cn(
                            'w-full flex items-center gap-2 rounded-lg text-[13px] text-left',
                            'transition-all duration-150 outline-none',
                            'focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                            isCollapsed ? 'justify-center p-2 h-9' : 'px-2.5 py-2 h-8',
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                              : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
                          )}
                        >
                          <MessageSquare
                            className={cn(
                              'shrink-0 transition-colors',
                              isCollapsed ? 'w-4 h-4' : 'w-3.5 h-3.5',
                              isActive ? 'text-primary' : 'text-muted-foreground/50'
                            )}
                          />
                          {!isCollapsed && (
                            <span className="truncate flex-1 leading-snug">{chat.title}</span>
                          )}
                        </button>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="max-w-[180px] text-xs">
                          {chat.title}
                        </TooltipContent>
                      )}
                    </Tooltip>

                    {/* Hover delete — only when expanded + active */}
                    {!isCollapsed && isActive && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            id={`delete-chat-${chat.id}`}
                            onClick={(e) => { e.stopPropagation(); deleteCurrentChat(); }}
                            aria-label="Delete chat"
                            className={cn(
                              'absolute right-1.5 top-1/2 -translate-y-1/2',
                              'p-1 rounded-md transition-all duration-150',
                              'opacity-0 group-hover/item:opacity-100',
                              'text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10'
                            )}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">Delete</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* ── Footer / status + collapse ────────────────────────── */}
        <Separator className="bg-sidebar-border" />
        <div
          className={cn(
            'flex items-center h-12 px-3 gap-2 shrink-0',
            isCollapsed && 'justify-center px-0'
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Animated ping dot */}
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] text-muted-foreground/70 truncate">Connected</span>
            </div>
          )}

          {/* Collapse toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                id="sidebar-collapse-btn"
                size="icon"
                variant="ghost"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className={cn(
                  'w-7 h-7 shrink-0 text-muted-foreground/50',
                  'hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all'
                )}
              >
                {isCollapsed
                  ? <PanelLeft className="w-3.5 h-3.5" />
                  : <PanelLeftClose className="w-3.5 h-3.5" />
                }
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {isCollapsed ? 'Expand' : 'Collapse'}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* ── Upload dialog (outside sidebar, in portal) ─────────── */}
      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </TooltipProvider>
  );
}
