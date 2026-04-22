'use client';

import React, { useEffect, useRef } from 'react';
import { Message } from './message';
import { useChatContext } from '@/lib/chat-context';
import { Sparkles, BookOpen, Code2, BrainCircuit } from 'lucide-react';

const SUGGESTION_PROMPTS = [
  {
    icon: BrainCircuit,
    label: 'Explain a concept',
    prompt: 'Explain the difference between supervised and unsupervised learning',
  },
  {
    icon: Code2,
    label: 'Write code',
    prompt: 'Show me a Python implementation of a neural network from scratch',
  },
  {
    icon: BookOpen,
    label: 'Interview prep',
    prompt: 'What are common machine learning interview questions?',
  },
];

function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3 msg-animate">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg btn-gradient flex items-center justify-center shadow-sm mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

export function MessageList() {
  const { currentChat, isLoading, sendChatMessage } = useChatContext();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages, isLoading]);

  if (!currentChat) return null;

  const isEmpty = currentChat.messages.length === 0;

  return (
    <div className="flex-1 overflow-y-auto">
      {isEmpty ? (
        /* ── Empty state hero ── */
        <div className="h-full flex flex-col items-center justify-center px-6 py-12 text-center select-none">
          {/* Icon mark */}
          <div className="w-14 h-14 rounded-2xl btn-gradient flex items-center justify-center shadow-lg mb-5">
            <Sparkles className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight mb-1.5">
            How can I help you today?
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mb-8">
            Ask anything about machine learning, deep learning, or interview preparation.
          </p>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-3 justify-center">
            {SUGGESTION_PROMPTS.map(({ icon: Icon, label, prompt }) => (
              <button
                key={label}
                onClick={() => sendChatMessage(prompt)}
                className="group flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:border-primary/40 hover:bg-accent/60 transition-all shadow-sm"
              >
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ── Message thread ── */
        <div className="py-4">
          {currentChat.messages
            .filter((m) => m.content.trim() !== '')
            .map((message) => (
              <Message
                key={message.id}
                content={message.content}
                role={message.role}
                timestamp={message.timestamp}
              />
            ))}
          {isLoading && <TypingIndicator />}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
}
