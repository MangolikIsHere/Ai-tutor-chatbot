'use client';

import React, {
  useState,
  useRef,
  useEffect,
} from 'react';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  ArrowUp,
  AlertCircle,
  X,
  Paperclip,
  CornerUpLeft,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useChatContext } from '@/lib/chat-context';
import { DocumentUploadDialog } from '@/components/document-upload-dialog';

const EASE = [0.22, 1, 0.36, 1] as const;

function preview(
  text: string,
  max = 120
) {
  const clean = text
    .replace(/\n/g, ' ')
    .trim();

  if (clean.length <= max)
    return clean;

  return (
    clean.slice(0, max) +
    '...'
  );
}

export function MessageInput() {
  const [input, setInput] =
    useState('');

  const [uploadOpen, setUploadOpen] =
    useState(false);

  const [isFocused, setIsFocused] =
    useState(false);

  const textareaRef =
    useRef<HTMLTextAreaElement>(
      null
    );

  const {
    isLoading,
    sendChatMessage,
    error,
    clearError,
    sessionId,
    replyTarget,
    setReplyTarget,
  } = useChatContext();

  /* auto resize */
  useEffect(() => {
    const el =
      textareaRef.current;

    if (!el) return;

    el.style.height =
      'auto';

    el.style.height = `${Math.min(
      el.scrollHeight,
      168
    )}px`;
  }, [input]);

  /* keep focus */
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit =
    async (
      e?: React.FormEvent
    ) => {
      e?.preventDefault();

      const text =
        input.trim();

      if (
        !text ||
        isLoading
      )
        return;

      let finalPrompt =
        text;

      if (replyTarget) {
        finalPrompt = `Regarding this previous message:

"${replyTarget.content}"

${text}`;
      }

      setInput('');

      textareaRef.current?.focus();

      await sendChatMessage(
        finalPrompt
      );

      setReplyTarget(null);

      requestAnimationFrame(
        () => {
          textareaRef.current?.focus();
        }
      );
    };

  const handleKeyDown =
    (
      e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
      if (
        e.key ===
          'Enter' &&
        !e.shiftKey
      ) {
        e.preventDefault();
        handleSubmit();
      }
    };

  const canSend =
    input.trim().length >
      0 &&
    !isLoading;

  const LIMIT = 2000;

  return (
    <>
      <div className="relative w-full shrink-0">
        {/* top fade */}
        <div
          className="absolute inset-x-0 -top-10 h-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--background))',
          }}
        />

        {/* session */}
        <div className="flex items-center justify-end px-4 sm:px-6 pt-2 pb-1">
          <AnimatePresence>
            {sessionId && (
              <motion.span
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="hidden sm:inline-flex rounded-full px-2.5 py-1 text-[11px] font-mono"
                style={{
                  background:
                    'var(--muted)',
                  color:
                    'var(--muted-foreground)',
                }}
              >
                {sessionId.slice(
                  0,
                  8
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -6,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
              }}
              className="mx-4 sm:mx-6 mb-2"
            >
              <div className="flex items-start gap-2 rounded-xl px-3 py-2 border border-red-300/30 bg-red-500/5">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />

                <p className="flex-1 text-sm text-red-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    clearError
                  }
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* reply preview */}
        <AnimatePresence>
          {replyTarget && (
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
              }}
              className="mx-3 sm:mx-5 mb-2"
            >
              <div className="rounded-2xl border border-border bg-card px-3 py-2 flex items-start gap-2">
                <CornerUpLeft className="w-4 h-4 mt-0.5 shrink-0 text-primary" />

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium opacity-70 mb-0.5">
                    Replying to message
                  </p>

                  <p className="text-[12px] opacity-75 truncate">
                    {preview(
                      replyTarget.content
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setReplyTarget(
                      null
                    )
                  }
                >
                  <X className="w-4 h-4 opacity-60" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* composer */}
        <div className="px-3 sm:px-5 pb-4">
          <form
            onSubmit={
              handleSubmit
            }
          >
            <motion.div
              className="relative flex items-end gap-2 rounded-[24px] px-3.5 py-3 border"
              animate={{
                boxShadow:
                  isFocused
                    ? 'var(--shadow-lg)'
                    : 'var(--shadow-md)',
              }}
              style={{
                background:
                  'var(--card)',
                borderColor:
                  'var(--border)',
              }}
            >
              {/* upload */}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() =>
                  setUploadOpen(
                    true
                  )
                }
                className="w-9 h-9 rounded-xl shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              {/* textarea */}
              <textarea
                ref={
                  textareaRef
                }
                value={input}
                onChange={(e) =>
                  setInput(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                onFocus={() =>
                  setIsFocused(
                    true
                  )
                }
                onBlur={() =>
                  setIsFocused(
                    false
                  )
                }
                rows={1}
                maxLength={LIMIT}
                readOnly={
                  isLoading
                }
                placeholder="Message NeuralChat…"
                className="flex-1 resize-none bg-transparent outline-none py-1"
              />

              {/* send */}
              <Button
                type="submit"
                size="icon"
                disabled={
                  !canSend
                }
                className="w-9 h-9 rounded-xl shrink-0"
              >
                <AnimatePresence
                  mode="wait"
                  initial={
                    false
                  }
                >
                  {isLoading ? (
                    <Spinner className="w-4 h-4" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </form>
        </div>
      </div>

      <DocumentUploadDialog
        open={
          uploadOpen
        }
        onOpenChange={
          setUploadOpen
        }
      />
    </>
  );
}