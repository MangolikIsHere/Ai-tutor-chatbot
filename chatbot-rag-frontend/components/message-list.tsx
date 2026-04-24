'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from './message';
import { useChatContext } from '@/lib/chat-context';
import { Sparkles, BookOpen, Code2, BrainCircuit, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Suggestion chips ────────────────────────────────────────────────────────

const SUGGESTIONS = [
  {
    icon: BrainCircuit,
    label: 'Explain a concept',
    sublabels: [
      'Supervised vs unsupervised learning',
      'Bias-variance tradeoff explained simply',
      'When to use cross-validation in practice',
      'Overfitting vs underfitting with examples',
    ],
    prompt: 'Explain the difference between supervised and unsupervised learning with examples.',
  },
  {
    icon: Code2,
    label: 'Write code',
    sublabels: [
      'Neural network from scratch',
      'Train-test split and model evaluation',
      'Logistic regression in NumPy',
      'Build a mini transformer block',
    ],
    prompt: 'Show me a Python implementation of a neural network from scratch using NumPy.',
  },
  {
    icon: BookOpen,
    label: 'Interview prep',
    sublabels: [
      'Top ML interview questions',
      'System design for ML products',
      'Model metrics quick revision',
      'Feature engineering interview round',
    ],
    prompt: 'What are the most important machine learning interview questions and how should I answer them?',
  },
  {
    icon: Lightbulb,
    label: 'Explain intuitively',
    sublabels: [
      'How Transformers work',
      'Attention mechanism in plain English',
      'Why embeddings matter in LLMs',
      'Intuition behind gradient descent',
    ],
    prompt: 'Explain how the Transformer architecture works in simple terms.',
  },
] as const;

function hashText(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickSublabel(chatId: string, itemIndex: number, choices: readonly string[]): string {
  if (choices.length === 0) return '';
  const base = hashText(chatId) + itemIndex * 97;
  return choices[base % choices.length] ?? choices[0];
}

// ─── Animation presets ────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;

const welcomeContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.10 } },
};

const welcomeItem = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.40, ease: EASE } },
};

const chipItem = {
  hidden:  { opacity: 0, y: 10, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.32, ease: EASE, delay: 0.28 + i * 0.06 },
  }),
};

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      className="flex gap-4 px-4 sm:px-6 py-3 max-w-[820px] mx-auto w-full"
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 6, filter: 'blur(2px)' }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-xl btn-gradient flex items-center justify-center mt-1 shadow-md"
        style={{ boxShadow: '0 2px 6px var(--primary-glow)' }}
      >
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div
        className="rounded-2xl rounded-tl-md px-5 py-3.5 flex items-center gap-2 surface-raised"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <span className="typing-dot bg-primary" />
        <span className="typing-dot bg-primary opacity-60" />
        <span className="typing-dot bg-primary opacity-30" />
      </div>
    </motion.div>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────

function WelcomeScreen({
  onSend,
  chatId,
}: {
  onSend: (prompt: string) => void;
  chatId: string;
}) {
  return (
    <motion.div
      className="h-full flex flex-col items-center justify-center px-5 py-16 text-center select-none"
      variants={welcomeContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Hero icon */}
      <motion.div className="relative mb-10" variants={welcomeItem}>
        <div
          className="absolute inset-0 rounded-[32px] btn-gradient opacity-20 blur-3xl scale-[2]"
          aria-hidden
        />
        <motion.div
          className="relative w-20 h-20 rounded-[28px] btn-gradient flex items-center justify-center shadow-2xl"
          whileHover={{ scale: 1.08, rotate: 8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          <Sparkles className="w-9 h-9 text-white" />
        </motion.div>
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="text-[28px] sm:text-[34px] font-semibold text-foreground mb-3"
        style={{ letterSpacing: '-0.035em' }}
        variants={welcomeItem}
      >
        How can I help you today?
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-[15px] max-w-[340px] sm:max-w-[400px] leading-[1.65] mb-10"
        style={{ color: 'var(--muted-foreground)', opacity: 0.75 }}
        variants={welcomeItem}
      >
        Ask me anything about machine learning, deep learning, or technical interview preparation.
      </motion.p>

      {/* Suggestion chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[560px]">
        {SUGGESTIONS.map(({ icon: Icon, label, sublabels, prompt }, i) => {
          const sublabel = pickSublabel(chatId, i, sublabels);
          return (
          <motion.button
            key={label}
            custom={i}
            variants={chipItem}
            initial="hidden"
            animate="visible"
            onClick={() => onSend(prompt)}
            className={cn(
              'group text-left rounded-2xl border border-border bg-card text-card-foreground',
              'px-5 py-5 min-h-[84px] transition-all duration-200',
              'hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:scale-[1.02] hover:border-primary/40'
            )}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-lg btn-gradient flex items-center justify-center shrink-0 shadow-sm">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span
                className="font-bold text-foreground"
                style={{ fontSize: '14px', letterSpacing: '-0.02em' }}
              >
                {label}
              </span>
            </div>
            <p
              className="leading-snug pl-[40px]"
              style={{ fontSize: '12.5px', color: 'var(--muted-foreground)', opacity: 0.7 }}
            >
              {sublabel}
            </p>
          </motion.button>
          );
        })}
      </div>
    </motion.div>
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
    .filter((m, idx, arr) => arr.findIndex((x) => x.id === m.id) === idx);

  const isEmpty = visibleMessages.length === 0;

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth h-full">
      <AnimatePresence mode="wait">
        {isEmpty ? (
          <WelcomeScreen key={`welcome-${currentChat.id}`} onSend={sendChatMessage} chatId={currentChat.id} />
        ) : (
          <motion.div
            key="thread"
            className="pt-4 pb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.20, ease: 'easeOut' }}
          >
            <AnimatePresence initial={false}>
              {visibleMessages.map((message) => (
                <Message
                  key={message.id}
                  content={message.content}
                  role={message.role}
                  timestamp={message.timestamp}
                />
              ))}
            </AnimatePresence>
            {isLoading && <TypingIndicator key="typing" />}
            <div ref={endRef} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
