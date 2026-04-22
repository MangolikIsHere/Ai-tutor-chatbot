'use client';

import React, { useState } from 'react';
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

export function ChatSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { chats, currentChat, createNewChat, switchChat, deleteCurrentChat } =
    useChatContext();

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          'relative flex flex-col h-full shrink-0 overflow-hidden',
          'bg-sidebar',
          'transition-[width] duration-280 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width]',
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
          <div
            className="flex-shrink-0 w-7 h-7 rounded-[10px] btn-gradient flex items-center justify-center"
            style={{
              boxShadow: '0 1px 4px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          {!isCollapsed && (
            <span
              className="font-semibold text-[15px] select-none"
              style={{
                color: 'var(--sidebar-foreground)',
                letterSpacing: '-0.024em',
              }}
            >
              NeuralChat
            </span>
          )}
        </div>

        {/* Hairline separator */}
        <div style={{ height: '1px', background: 'var(--sidebar-border)', flexShrink: 0 }} />

        {/* ── Action buttons ────────────────────────────────────── */}
        <div
          className={cn(
            'flex flex-col gap-1.5 px-2.5 py-3',
            isCollapsed && 'px-2 items-center'
          )}
        >
          {/* New chat */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                id="new-chat-btn"
                onClick={createNewChat}
                size={isCollapsed ? 'icon' : 'sm'}
                className={cn(
                  'btn-gradient text-white press-active',
                  'transition-all duration-150',
                  isCollapsed
                    ? 'w-9 h-9 rounded-xl shadow-sm hover:opacity-90 hover:scale-[1.04] active:scale-95'
                    : 'w-full h-9 justify-start gap-2.5 rounded-xl shadow-sm hover:opacity-90 active:scale-[0.97]'
                )}
                style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '-0.01em' }}
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
                variant="ghost"
                size={isCollapsed ? 'icon' : 'sm'}
                onClick={() => setUploadOpen(true)}
                className={cn(
                  'hover:bg-sidebar-accent transition-all duration-150 active:scale-[0.97]',
                  isCollapsed
                    ? 'w-9 h-9 rounded-xl'
                    : 'w-full h-9 justify-start gap-2.5 rounded-xl'
                )}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: 'var(--sidebar-foreground)',
                  opacity: 0.65,
                }}
              >
                <FileUp className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span>Upload docs</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Upload documents</TooltipContent>}
          </Tooltip>
        </div>

        {/* ── Section label ──────────────────────────────────────── */}
        {!isCollapsed && chats.length > 0 && (
          <div className="px-3.5 pb-1.5">
            <p
              className="text-[10px] font-semibold uppercase select-none"
              style={{
                color: 'var(--muted-foreground)',
                opacity: 0.45,
                letterSpacing: '0.09em',
              }}
            >
              Chats
            </p>
          </div>
        )}

        {/* ── Chat list ─────────────────────────────────────────── */}
        <ScrollArea className="flex-1 px-2">
          {chats.length === 0 && !isCollapsed ? (
            <div className="py-10 flex flex-col items-center gap-2 text-center px-4">
              <MessageSquare
                className="w-5 h-5"
                style={{ color: 'var(--muted-foreground)', opacity: 0.2 }}
              />
              <p
                className="text-[12px]"
                style={{
                  color: 'var(--muted-foreground)',
                  opacity: 0.4,
                  letterSpacing: '-0.01em',
                }}
              >
                No chats yet
              </p>
            </div>
          ) : (
            <div className="space-y-0.5 pb-2">
              {chats.map((chat, idx) => {
                const isActive = currentChat?.id === chat.id;
                return (
                  <div
                    key={chat.id}
                    className="group/item relative sidebar-item-enter"
                    style={{ animationDelay: `${idx * 16}ms` }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          id={`chat-item-${chat.id}`}
                          onClick={() => switchChat(chat.id)}
                          className={cn(
                            'w-full flex items-center gap-2 rounded-xl text-left',
                            'transition-all duration-150 outline-none',
                            'focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                            isCollapsed
                              ? 'justify-center p-2 h-9'
                              : 'px-2.5 py-2 h-9',
                          )}
                          style={{
                            fontSize: '13px',
                            letterSpacing: '-0.012em',
                            fontWeight: isActive ? 500 : 400,
                            borderLeft: isActive
                              ? '2px solid var(--primary)'
                              : '2px solid transparent',
                            background: isActive
                              ? 'var(--sidebar-accent)'
                              : 'transparent',
                            color: isActive
                              ? 'var(--sidebar-foreground)'
                              : 'var(--sidebar-foreground)',
                            opacity: isActive ? 1 : 0.55,
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-accent)';
                              (e.currentTarget as HTMLElement).style.opacity = '0.85';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              (e.currentTarget as HTMLElement).style.background = 'transparent';
                              (e.currentTarget as HTMLElement).style.opacity = '0.55';
                            }
                          }}
                        >
                          <MessageSquare
                            className="shrink-0 transition-colors"
                            style={{
                              width: isCollapsed ? '16px' : '13px',
                              height: isCollapsed ? '16px' : '13px',
                              color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                              opacity: isActive ? 1 : 0.45,
                            }}
                          />
                          {!isCollapsed && (
                            <span className="truncate flex-1 leading-snug">
                              {chat.title}
                            </span>
                          )}
                        </button>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="max-w-[180px] text-xs">
                          {chat.title}
                        </TooltipContent>
                      )}
                    </Tooltip>

                    {/* Delete — hover, active only */}
                    {!isCollapsed && isActive && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            id={`delete-chat-${chat.id}`}
                            onClick={(e) => { e.stopPropagation(); deleteCurrentChat(); }}
                            aria-label="Delete chat"
                            className={cn(
                              'absolute right-1.5 top-1/2 -translate-y-1/2',
                              'p-1 rounded-lg transition-all duration-150',
                              'opacity-0 group-hover/item:opacity-100',
                            )}
                            style={{
                              color: 'var(--muted-foreground)',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.color = 'var(--destructive)';
                              (e.currentTarget as HTMLElement).style.background = 'oklch(from var(--destructive) l c h / 0.10)';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)';
                              (e.currentTarget as HTMLElement).style.background = 'transparent';
                            }}
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

        {/* ── Footer ────────────────────────────────────────────── */}
        <div style={{ height: '1px', background: 'var(--sidebar-border)', flexShrink: 0 }} />
        <div
          className={cn(
            'flex items-center px-3 gap-2 shrink-0',
            isCollapsed && 'justify-center px-0'
          )}
          style={{ height: '52px' }}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-55" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span
                className="text-[12px] truncate font-medium"
                style={{
                  color: 'var(--sidebar-foreground)',
                  opacity: 0.45,
                  letterSpacing: '-0.012em',
                }}
              >
                Connected
              </span>
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
                className="w-7 h-7 shrink-0 rounded-lg hover:bg-sidebar-accent transition-all"
                style={{ color: 'var(--sidebar-foreground)', opacity: 0.38 }}
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

      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </TooltipProvider>
  );
}
