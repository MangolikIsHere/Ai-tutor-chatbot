'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ArrowUp, AlertCircle, X, Paperclip } from 'lucide-react';
import { useChatContext } from '@/lib/chat-context';
import { DocumentUploadDialog } from '@/components/document-upload-dialog';

const EASE = [0.22, 1, 0.36, 1] as const;

export function MessageInput() {
  const [input, setInput] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isLoading,
    sendChatMessage,
    error,
    clearError,
    sessionId,
  } = useChatContext();

  /* Auto resize */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [input]);

  /* Keep focus on first render */
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  /* Submit */
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const text = input.trim();

    if (!text || isLoading) return;

    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }

    await sendChatMessage(text);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(0, 0);
    });
  };

  /* Enter to send */
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend =
    input.trim().length > 0 && !isLoading;

  const charCount = input.length;
  const LIMIT = 2000;

  return (
    <>
      <div className="relative w-full shrink-0">
        {/* Top fade */}
        <div
          className="absolute inset-x-0 -top-10 h-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--background))',
          }}
        />

        {/* Session bar */}
        <div className="flex items-center justify-end px-4 sm:px-6 pt-2 pb-1">
          <AnimatePresence>
            {sessionId && (
              <motion.span
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                }}
                transition={{
                  duration: 0.2,
                  ease: EASE,
                }}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono font-medium"
                style={{
                  fontSize: '11px',
                  background: 'var(--muted)',
                  border:
                    '1px solid var(--border)',
                  color:
                    'var(--muted-foreground)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                {sessionId.slice(0, 8)}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -6,
                height: 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
                height: 'auto',
              }}
              exit={{
                opacity: 0,
                y: -4,
                height: 0,
              }}
              transition={{
                duration: 0.22,
                ease: EASE,
              }}
              className="mx-4 sm:mx-6 mb-2.5 overflow-hidden"
            >
              <div
                className="flex items-start gap-2.5 rounded-xl px-3.5 py-2.5"
                style={{
                  background:
                    'oklch(from var(--destructive) l c h / 0.07)',
                  border:
                    '1px solid oklch(from var(--destructive) l c h / 0.22)',
                }}
              >
                <AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />

                <p className="flex-1 text-[13px] text-destructive leading-snug font-medium">
                  {error}
                </p>

                <motion.button
                  type="button"
                  onClick={clearError}
                  whileTap={{
                    scale: 0.85,
                  }}
                  aria-label="Dismiss error"
                  className="text-destructive/50 hover:text-destructive transition-colors mt-0.5 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Composer */}
        <div className="px-3 sm:px-5 pb-4">
          <form onSubmit={handleSubmit}>
            <motion.div
              className="relative flex items-end gap-2 rounded-[24px] px-3.5 py-3 transition-all duration-300"
              animate={{
                borderColor: isFocused
                  ? 'color-mix(in oklch, var(--primary) 55%, var(--border-strong) 45%)'
                  : 'var(--border-strong)',
                boxShadow: isFocused
                  ? 'var(--shadow-lg), 0 0 0 2px var(--primary-glow)'
                  : 'var(--shadow-md)',
              }}
              transition={{
                duration: 0.3,
                ease: EASE,
              }}
              style={{
                background:
                  'var(--card)',
                border:
                  '1px solid var(--border-strong)',
              }}
            >
              {/* Upload */}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() =>
                  setUploadOpen(true)
                }
                className="w-9 h-9 shrink-0 mb-0.5 rounded-xl"
              >
                <Paperclip className="w-4.5 h-4.5" />
              </Button>

              {/* Input */}
              <textarea
                ref={textareaRef}
                id="message-input"
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
                  setIsFocused(true)
                }
                onBlur={() =>
                  setIsFocused(false)
                }
                placeholder="Message NeuralChat…"
                readOnly={isLoading}
                rows={1}
                maxLength={LIMIT}
                aria-label="Message input"
                className="flex-1 resize-none bg-transparent outline-none py-1"
                style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  minHeight: '28px',
                  color:
                    'var(--foreground)',
                  caretColor:
                    'var(--primary)',
                }}
              />

              {/* Send */}
              <Button
                type="submit"
                size="icon"
                disabled={!canSend}
                className="w-9 h-9 shrink-0 mb-0.5 rounded-xl"
              >
                <AnimatePresence
                  mode="wait"
                  initial={false}
                >
                  {isLoading ? (
                    <motion.span
                      key="loading"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                    >
                      <Spinner className="w-4 h-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="arrow"
                      initial={{
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -5,
                      }}
                    >
                      <ArrowUp className="w-4.5 h-4.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2 px-1">
              <p
                className="text-[11.5px]"
                style={{
                  color:
                    'var(--muted-foreground)',
                  opacity: 0.52,
                }}
              >
                ↵ send · ⇧↵ new line
              </p>

              <AnimatePresence>
                {charCount >
                  LIMIT * 0.8 && (
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
                    className="text-[11px] tabular-nums font-medium"
                  >
                    {charCount}/{LIMIT}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>
      </div>

      <DocumentUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />
    </>
  );
}