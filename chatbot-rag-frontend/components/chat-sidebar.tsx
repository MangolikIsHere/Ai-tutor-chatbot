'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Plus,
  Trash2,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
} from 'lucide-react';
import { useChatContext } from '@/lib/chat-context';
import { cn } from '@/lib/utils';

export function ChatSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { chats, currentChat, createNewChat, switchChat, deleteCurrentChat } =
    useChatContext();

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          'relative flex flex-col h-full border-r border-border bg-sidebar transition-[width] duration-300 ease-in-out shrink-0',
          isCollapsed ? 'w-[60px]' : 'w-[260px]'
        )}
      >
        {/* ── Logo / Brand header ── */}
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-4 border-b border-sidebar-border',
            isCollapsed && 'justify-center px-2'
          )}
        >
          {/* Icon mark */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg btn-gradient flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          {!isCollapsed && (
            <span className="font-semibold text-sm tracking-tight text-sidebar-foreground truncate">
              NeuralChat
            </span>
          )}
        </div>

        {/* ── New Chat button ── */}
        <div className={cn('px-3 py-3', isCollapsed && 'px-2')}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={createNewChat}
                size={isCollapsed ? 'icon' : 'sm'}
                className={cn(
                  'w-full gap-2 btn-gradient text-white shadow-sm hover:opacity-90 transition-opacity',
                  !isCollapsed && 'justify-start'
                )}
              >
                <Plus className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>New chat</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">New chat</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* ── Chat history list ── */}
        <ScrollArea className="flex-1 px-2">
          {chats.length === 0 ? (
            !isCollapsed && (
              <div className="py-8 px-3 text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">No chats yet</p>
              </div>
            )
          ) : (
            <div className="space-y-0.5 py-1">
              {chats.map((chat) => {
                const isActive = currentChat?.id === chat.id;
                return (
                  <div key={chat.id} className="group relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => switchChat(chat.id)}
                          className={cn(
                            'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                            isCollapsed && 'justify-center px-2'
                          )}
                        >
                          <MessageSquare
                            className={cn(
                              'w-3.5 h-3.5 shrink-0',
                              isActive
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            )}
                          />
                          {!isCollapsed && (
                            <span className="truncate flex-1">{chat.title}</span>
                          )}
                        </button>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right">{chat.title}</TooltipContent>
                      )}
                    </Tooltip>

                    {/* Delete button — visible on hover when active */}
                    {!isCollapsed && isActive && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteCurrentChat(); }}
                            className={cn(
                              'absolute right-2 top-1/2 -translate-y-1/2',
                              'p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity',
                              'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                            )}
                            aria-label="Delete chat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Delete chat</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* ── Footer / status ── */}
        <div
          className={cn(
            'mt-auto border-t border-sidebar-border px-3 py-3 flex items-center gap-2',
            isCollapsed && 'justify-center px-2'
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs text-muted-foreground truncate">Connected</span>
            </div>
          )}

          {/* Collapse toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-7 h-7 text-muted-foreground hover:text-foreground"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <PanelLeft className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
