'use client';

import { ChatSidebar } from '@/components/chat-sidebar';
import { MessageList } from '@/components/message-list';
import { MessageInput } from '@/components/message-input';
import { ChatProvider } from '@/lib/chat-context';

function ChatInterface() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar />
      <div className="flex flex-col flex-1 min-w-0 relative">
        <MessageList />
        <MessageInput />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ChatProvider>
      <ChatInterface />
    </ChatProvider>
  );
}
