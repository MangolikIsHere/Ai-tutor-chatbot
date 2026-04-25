'use client';

import React from 'react';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import { Message } from './message';
import { useChatContext } from '@/lib/chat-context';

import {
  Sparkles,
  BookOpen,
  Code2,
  BrainCircuit,
  Lightbulb,
} from 'lucide-react';

import { cn } from '@/lib/utils';

/* ───────────────────────────── */

const SUGGESTIONS = [
  {
    icon: BrainCircuit,
    label: 'Explain a concept',
    prompt:
      'Explain the difference between supervised and unsupervised learning with examples.',
  },
  {
    icon: Code2,
    label: 'Write code',
    prompt:
      'Show me a Python implementation of a neural network from scratch using NumPy.',
  },
  {
    icon: BookOpen,
    label: 'Interview prep',
    prompt:
      'What are the most important machine learning interview questions and how should I answer them?',
  },
  {
    icon: Lightbulb,
    label: 'Explain intuitively',
    prompt:
      'Explain how the Transformer architecture works in simple terms.',
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────────────────────────── */

function TypingIndicator() {
  return (
    <motion.div
      className="flex gap-4 px-4 sm:px-6 py-3 max-w-[820px] mx-auto w-full"
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
      }}
    >
      <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center mt-1">
        <Sparkles className="w-4 h-4 text-white" />
      </div>

      <div className="rounded-2xl rounded-tl-md px-5 py-3 border border-border bg-card flex gap-1.5">
        <span className="typing-dot bg-primary" />
        <span className="typing-dot bg-primary opacity-60" />
        <span className="typing-dot bg-primary opacity-30" />
      </div>
    </motion.div>
  );
}

/* ───────────────────────────── */

function WelcomeScreen({
  onSend,
}: {
  onSend: (
    text: string
  ) => void;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="w-20 h-20 rounded-[28px] btn-gradient flex items-center justify-center mb-8 shadow-xl">
        <Sparkles className="w-9 h-9 text-white" />
      </div>

      <h1 className="text-[30px] font-semibold mb-3">
        How can I help you today?
      </h1>

      <p className="text-sm opacity-70 max-w-md mb-10">
        Ask me anything about machine learning, coding, or interviews.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[560px]">
        {SUGGESTIONS.map(
          (
            item,
            i
          ) => {
            const Icon =
              item.icon;

            return (
              <motion.button
                key={
                  item.label
                }
                onClick={() =>
                  onSend(
                    item.prompt
                  )
                }
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay:
                    i * 0.05,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className={cn(
                  'rounded-2xl border border-border bg-card text-left px-5 py-5 hover:shadow-md transition-all'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-lg btn-gradient flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  <span className="font-semibold text-sm">
                    {
                      item.label
                    }
                  </span>
                </div>

                <p className="text-xs opacity-65 pl-10">
                  Tap to ask
                </p>
              </motion.button>
            );
          }
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────── */

export function MessageList() {
  const {
    currentChat,
    isLoading,
    sendChatMessage,
  } =
    useChatContext();

  const endRef =
    React.useRef<HTMLDivElement>(
      null
    );

  React.useEffect(() => {
    endRef.current?.scrollIntoView(
      {
        behavior:
          'smooth',
      }
    );
  }, [
    currentChat?.messages,
    isLoading,
  ]);

  if (!currentChat)
    return null;

  const visibleMessages =
    currentChat.messages.filter(
      (m) =>
        m.content.trim() !==
        ''
    );

  const isEmpty =
    visibleMessages.length === 0;

  return (
    <div className="flex-1 overflow-y-auto h-full">
      <AnimatePresence mode="wait">
        {isEmpty ? (
          <WelcomeScreen
            key="welcome"
            onSend={
              sendChatMessage
            }
          />
        ) : (
          <motion.div
            key="thread"
            className="pt-4 pb-6"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
          >
            <AnimatePresence initial={false}>
              {visibleMessages.map(
                (
                  message
                ) => (
                  <Message
                    key={
                      message.id
                    }
                    id={
                      message.id
                    }
                    content={
                      message.content
                    }
                    role={
                      message.role
                    }
                    timestamp={
                      message.timestamp
                    }
                  />
                )
              )}
            </AnimatePresence>

            {isLoading && (
              <TypingIndicator />
            )}

            <div
              ref={
                endRef
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}