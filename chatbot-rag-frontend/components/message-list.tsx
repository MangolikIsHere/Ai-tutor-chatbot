'use client';

import React, { useEffect, useRef } from 'react';
import { Message } from './message';
import { useChatContext } from '@/lib/chat-context';
import { Sparkles, BookOpen, Code2, BrainCircuit, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Suggestion chips ────────────────────────────────────────────────────────

const SUGGESTIONS = [
  {
    icon: BrainCircuit,
    label: 'Explain a concept',
    sublabel: 'Supervised vs unsupervised',
    prompt: 'Explain the difference between supervised and unsupervised learning with examples.',
  },
  {
    icon: Code2,
    label: 'Write code',
    sublabel: 'Neural net from scratch',
    prompt: 'Show me a Python implementation of a neural network from scratch using NumPy.',
  },
  {
    icon: BookOpen,
    label: 'Interview prep',
    sublabel: 'ML interview questions',
    prompt: 'What are the most important machine learning interview questions and how should I answer them?',
  },
  {
    icon: Lightbulb,
    label: 'Explain intuitively',
    sublabel: 'How transformers work',
    prompt: 'Explain how the Transformer architecture works in simple terms.',
  },
] as const;

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 px-4 sm:px-6 py-2 msg-animate">
      {/* AI avatar */}
      <div className="flex-shrink-0 w-7 h-7 rounded-lg btn-gradient flex items-center justify-center shadow-sm mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      {/* Bubble */}
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

// ─── Message List ─────────────────────────────────────────────────────────────

export function MessageList() {
  const { currentChat, isLoading, sendChatMessage } = useChatContext();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages, isLoading]);

  if (!currentChat) return null;

  const visibleMessages = currentChat.messages.filter((m) => m.content.trim() !== '');
  const isEmpty = visibleMessages.length === 0;

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth">
      {isEmpty ? (
        /* ── Empty / Welcome ─────────────────────────────────────── */
        <div className="h-full flex flex-col items-center justify-center px-5 py-12 text-center select-none">
          {/* Glow backdrop */}
          <div className="relative mb-6">
            <div
              className="absolute inset-0 rounded-3xl blur-2xl opacity-20 btn-gradient scale-150"
              aria-hidden
            />
            <div className="relative w-14 h-14 rounded-2xl btn-gradient flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-[22px] sm:text-2xl font-semibold tracking-tight text-foreground mb-2">
            How can I help you today?
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs sm:max-w-sm leading-relaxed mb-8">
            Ask me anything about machine learning, deep learning, or technical
            interview preparation.
          </p>

          {/* Suggestion grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md">
            {SUGGESTIONS.map(({ icon: Icon, label, sublabel, prompt }) => (
              <button
                key={label}
                onClick={() => sendChatMessage(prompt)}
                className={cn(
                  'group text-left rounded-xl border border-border bg-card px-4 py-3',
                  'hover:border-primary/40 hover:bg-accent/50 hover:shadow-md',
                  'transition-all duration-200 hover-lift press-active',
                  'shadow-sm'
                )}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <span className="text-[13px] font-medium text-foreground">{label}</span>
                </div>
                <p className="text-[12px] text-muted-foreground pl-[26px] leading-snug">{sublabel}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ── Thread ──────────────────────────────────────────────── */
        <div className="pt-2 pb-4">
          {visibleMessages.map((message) => (
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
