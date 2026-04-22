'use client';

import React, { useState } from 'react';
import { ChatSidebar } from '@/components/chat-sidebar';
import { MessageList } from '@/components/message-list';
import { MessageInput } from '@/components/message-input';
import { ChatProvider } from '@/lib/chat-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

// ─── Mobile navbar (visible < md) ───────────────────────────────────────────

function MobileNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="md:hidden flex items-center gap-2 h-12 px-4 border-b border-border bg-background/95 shrink-0">
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
      <span className="text-[14px] font-semibold tracking-tight">NeuralChat</span>
    </div>
  );
}

// ─── Chat Interface ───────────────────────────────────────────────────────────

function ChatInterface() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* ── Desktop sidebar (hidden on mobile) ─────────────────── */}
      <div className="hidden md:flex">
        <ChatSidebar />
      </div>

      {/* ── Mobile sidebar in Sheet drawer ─────────────────────── */}
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

      {/* ── Main area ───────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
        {/* Mobile navbar */}
        <MobileNavbar onMenuClick={() => setMobileOpen(true)} />

        {/* Message thread */}
        <MessageList />

        {/* Composer */}
        <MessageInput />
      </div>
    </div>
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
