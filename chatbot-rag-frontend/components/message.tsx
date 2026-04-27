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

import { useChatContext } from '@/lib/chat-context';
import { cn } from '@/lib/utils';

interface MessageProps {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------------------------------- */

function AIAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center shadow-md shrink-0 mt-1">
      <Sparkles className="w-4 h-4 text-white" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl surface-raised flex items-center justify-center shrink-0 mt-1">
      <User className="w-4 h-4 opacity-70" />
    </div>
  );
}

/* ---------------------------------- */

function Markdown({
  children,
}: {
  children: string;
}) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-7 prose-pre:my-4 prose-p:my-3 prose-headings:mb-3 prose-headings:mt-5 prose-li:my-1 prose-code:before:hidden prose-code:after:hidden">
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
        ]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

/* ---------------------------------- */

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

  const time =
    new Date(
      timestamp
    ).toLocaleTimeString(
      [],
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
      className={cn(
        'group/msg max-w-[860px] mx-auto px-4 sm:px-6 py-3 flex gap-3',
        isUser
          ? 'justify-end'
          : 'justify-start'
      )}
    >
      {!isUser && <AIAvatar />}

      <div
        className={cn(
          'min-w-0 flex flex-col gap-1.5',
          isUser
            ? 'items-end max-w-[76%]'
            : 'items-start max-w-[92%] sm:max-w-[82%]'
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            'relative px-5 py-4 rounded-2xl break-words',
            isUser
              ? 'rounded-tr-md text-white'
              : 'rounded-tl-md border border-border bg-card'
          )}
          style={
            isUser
              ? {
                  background:
                    'linear-gradient(135deg, color-mix(in oklch, var(--primary) 88%, white 12%) 0%, color-mix(in oklch, var(--primary) 72%, black 28%) 100%)',
                }
              : {}
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-[15px] leading-7">
              {content}
            </p>
          ) : (
            <Markdown>
              {content}
            </Markdown>
          )}
        </div>

        {/* Meta */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-1',
            isUser
              ? 'flex-row-reverse'
              : ''
          )}
        >
          <span className="text-[11px] opacity-55">
            {time}
          </span>

          {!isUser && (
            <>
              <button
                onClick={
                  handleCopy
                }
                className="opacity-0 group-hover/msg:opacity-100 text-[11px] px-2 py-1 rounded-lg hover:bg-muted transition"
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
              </button>

              <button
                onClick={
                  handleReply
                }
                className="opacity-0 group-hover/msg:opacity-100 text-[11px] px-2 py-1 rounded-lg hover:bg-muted transition flex items-center gap-1"
              >
                <CornerUpLeft className="w-3 h-3" />
                Ask about this
              </button>
            </>
          )}
        </div>
      </div>

      {isUser && <UserAvatar />}
    </motion.div>
  );
}