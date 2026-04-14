'use client';

import React, { useEffect, useRef } from 'react';
import { Message } from './message';
import { useChatContext } from '@/lib/chat-context';

export function MessageList() {
  const { currentChat } = useChatContext();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom with smooth behavior
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  if (!currentChat) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {currentChat.messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Start a Conversation</h2>
            <p className="text-sm">
              Ask me anything about machine learning or interview preparation
            </p>
          </div>
        </div>
      ) : (
        <>
          {currentChat.messages.map((message) => (
            <Message
              key={message.id}
              content={message.content}
              role={message.role}
              timestamp={message.timestamp}
            />
          ))}
          <div ref={endRef} />
        </>
      )}
    </div>
  );
}
