'use client';

import { ChatSidebar } from '@/components/chat-sidebar';
import { MessageList } from '@/components/message-list';
import { MessageInput } from '@/components/message-input';
import { ChatProvider } from '@/lib/chat-context';

function ChatInterface() {
  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <ChatSidebar />
      <div className="flex flex-col flex-1">
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
