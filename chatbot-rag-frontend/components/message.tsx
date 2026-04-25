'use client';

import React, {
  useState,
  useCallback,
} from 'react';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  Copy,
  Check,
  User,
  Sparkles,
  CornerUpLeft,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChatContext } from '@/lib/chat-context';

interface MessageProps {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────────────────────────── */

function AIAvatar() {
  return (
    <div
      className="flex-shrink-0 w-8 h-8 rounded-xl btn-gradient flex items-center justify-center mt-1"
      style={{
        boxShadow:
          '0 2px 6px var(--primary-glow)',
      }}
    >
      <Sparkles className="w-4 h-4 text-white" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div
      className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-1"
      style={{
        background:
          'var(--surface-02)',
        border:
          '1px solid var(--border)',
      }}
    >
      <User className="w-4 h-4 opacity-60" />
    </div>
  );
}

function trimPreview(
  text: string,
  max = 90
) {
  const clean = text
    .replace(/\n/g, ' ')
    .trim();

  if (clean.length <= max)
    return clean;

  return clean.slice(0, max) + '...';
}

/* ───────────────────────────── */

export function Message({
  id,
  content,
  role,
  timestamp,
}: MessageProps) {
  const isUser =
    role === 'user';

  const [copied, setCopied] =
    useState(false);

  const {
    setReplyTarget,
  } = useChatContext();

  const timeStr =
    new Date(
      timestamp
    ).toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );

  const handleCopy =
    useCallback(() => {
      navigator.clipboard.writeText(
        content
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    }, [content]);

  const handleReply =
    useCallback(() => {
      setReplyTarget({
        id,
        content,
      });
    }, [id, content]);

  return (
    <motion.div
      className={cn(
        'group/msg flex gap-3 px-4 sm:px-6 py-2 max-w-[780px] mx-auto',
        isUser
          ? 'justify-end'
          : 'justify-start'
      )}
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.22,
        ease: EASE,
      }}
    >
      {!isUser && <AIAvatar />}

      <div
        className={cn(
          'flex flex-col gap-1.5 min-w-0',
          isUser
            ? 'items-end max-w-[72%] sm:max-w-[60%]'
            : 'items-start max-w-[90%] sm:max-w-[82%]'
        )}
      >
        {/* Bubble */}
        <motion.div
          className={cn(
            'relative px-5 py-4 break-words rounded-2xl transition-all duration-200',
            isUser
              ? 'rounded-tr-md text-white'
              : 'rounded-tl-md border border-border'
          )}
          style={{
            fontSize: '14.5px',
            lineHeight: '1.82',
            letterSpacing:
              '-0.01em',
            ...(isUser
              ? {
                  background:
                    'linear-gradient(140deg, color-mix(in oklch, var(--primary) 85%, white 15%) 0%, color-mix(in oklch, var(--primary) 72%, black 28%) 100%)',
                }
              : {
                  background:
                    'var(--surface-01)',
                  color:
                    'var(--foreground)',
                }),
          }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">
              {content}
            </p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
              ]}
            >
              {content}
            </ReactMarkdown>
          )}
        </motion.div>

        {/* Meta row */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-0.5',
            isUser
              ? 'flex-row-reverse'
              : 'flex-row'
          )}
        >
          <time
            className="text-[11px] opacity-65"
            style={{
              color:
                'var(--muted-foreground)',
            }}
          >
            {timeStr}
          </time>

          {/* Copy */}
          {!isUser && (
            <motion.button
              type="button"
              onClick={
                handleCopy
              }
              whileTap={{
                scale: 0.9,
              }}
              className="opacity-0 group-hover/msg:opacity-100 transition-opacity text-[11px] px-1.5 py-0.5 rounded-md"
              style={{
                color:
                  copied
                    ? 'rgb(52,211,153)'
                    : 'var(--muted-foreground)',
              }}
            >
              <AnimatePresence
                mode="wait"
                initial={
                  false
                }
              >
                {copied ? (
                  <motion.span
                    key="done"
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Copied
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {/* Reply */}
          {!isUser && (
            <motion.button
              type="button"
              onClick={
                handleReply
              }
              whileTap={{
                scale: 0.9,
              }}
              className="opacity-0 group-hover/msg:opacity-100 transition-opacity text-[11px] px-1.5 py-0.5 rounded-md flex items-center gap-1"
              style={{
                color:
                  'var(--muted-foreground)',
              }}
            >
              <CornerUpLeft className="w-3 h-3" />
              Ask about this
            </motion.button>
          )}
        </div>

        {/* Hidden preview support */}
        {!isUser && (
          <div className="hidden">
            {trimPreview(
              content
            )}
          </div>
        )}
      </div>

      {isUser && <UserAvatar />}
    </motion.div>
  );
}