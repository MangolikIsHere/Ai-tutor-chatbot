'use client';

import React from 'react';
import { useChatContext } from '@/lib/chat-context';
import { Sparkles, BookOpen, Code2, BrainCircuit, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from './message';

// ─── Suggestion chips ────────────────────────────────────────────────────────

const SUGGESTIONS = [
  {
    icon: BrainCircuit,
    label: 'Explain a concept',
    sublabel: 'Supervised vs unsupervised learning',
    prompt: 'Explain the difference between supervised and unsupervised learning with examples.',
  },
  {
    icon: Code2,
    label: 'Write code',
    sublabel: 'Neural network from scratch',
    prompt: 'Show me a Python implementation of a neural network from scratch using NumPy.',
  },
  {
    icon: BookOpen,
    label: 'Interview prep',
    sublabel: 'Top ML interview questions',
    prompt: 'What are the most important machine learning interview questions and how should I answer them?',
  },
  {
    icon: Lightbulb,
    label: 'Explain intuitively',
    sublabel: 'How Transformers work',
    prompt: 'Explain how the Transformer architecture works in simple terms.',
  },
] as const;

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 sm:px-6 py-2 max-w-[780px] mx-auto w-full msg-animate">
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full btn-gradient flex items-center justify-center mt-0.5"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }}
      >
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div
        className="rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5"
        style={{
          background: 'var(--card)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────

function WelcomeScreen({ onSend }: { onSend: (prompt: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-5 py-16 text-center select-none">
      {/* Hero icon */}
      <div
        className="relative mb-8 fade-up"
        style={{ animationDelay: '0ms' }}
      >
        <div
          className="absolute inset-0 rounded-[28px] btn-gradient opacity-20 blur-2xl scale-[2]"
          aria-hidden
        />
        <div className="relative w-16 h-16 rounded-[22px] btn-gradient flex items-center justify-center shadow-lg">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Headline */}
      <h1
        className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.035em] text-foreground mb-3 fade-up"
        style={{ animationDelay: '60ms' }}
      >
        How can I help you today?
      </h1>

      {/* Subtitle */}
      <p
        className="text-[15px] max-w-[340px] sm:max-w-[400px] leading-[1.65] mb-10 fade-up"
        style={{
          color: 'var(--muted-foreground)',
          opacity: 0.75,
          animationDelay: '110ms',
        }}
      >
        Ask me anything about machine learning, deep learning, or technical interview preparation.
      </p>

      {/* Suggestion grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[560px] fade-up"
        style={{ animationDelay: '160ms' }}
      >
        {SUGGESTIONS.map(({ icon: Icon, label, sublabel, prompt }) => (
          <button
            key={label}
            onClick={() => onSend(prompt)}
            className={cn(
              'group text-left rounded-2xl border border-border bg-card',
              'px-4 py-4 min-h-[76px]',
              'hover:border-primary/35 hover:bg-accent/40',
              'transition-all duration-200 hover-lift press-active',
              'shadow-sm'
            )}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-6 h-6 rounded-lg btn-gradient flex items-center justify-center shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[13.5px] font-semibold tracking-[-0.01em] text-foreground">
                {label}
              </span>
            </div>
            <p className="text-[12.5px] text-muted-foreground pl-[34px] leading-snug">
              {sublabel}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Message List ─────────────────────────────────────────────────────────────

export function MessageList() {
  const { currentChat, isLoading, sendChatMessage } = useChatContext();
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages, isLoading]);

  if (!currentChat) return null;

  const visibleMessages = currentChat.messages
    .filter((m) => m.content.trim() !== '')
    // Deduplicate by id — keep first occurrence
    .filter((m, idx, arr) => arr.findIndex((x) => x.id === m.id) === idx);
  const isEmpty = visibleMessages.length === 0;

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth">
      {isEmpty ? (
        <WelcomeScreen onSend={sendChatMessage} />
      ) : (
        /* ── Thread ──────────────────────────────────────────────── */
        <div className="pt-4 pb-6">
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
