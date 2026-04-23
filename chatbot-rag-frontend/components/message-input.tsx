'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ArrowUp, AlertCircle, X, Paperclip } from 'lucide-react';
import { useChatContext } from '@/lib/chat-context';
import { DocumentUploadDialog } from '@/components/document-upload-dialog';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

export function MessageInput() {
  const [input, setInput] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isLoading, sendChatMessage, clearCurrentChat, error, clearError, sessionId } =
    useChatContext();

  /* ── Auto-resize textarea ───────────────────────────────────── */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 168) + 'px';
  }, [input]);

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendChatMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const canSend = input.trim().length > 0 && !isLoading;
  const charCount = input.length;
  const LIMIT = 2000;

  return (
    <>
      <div className="relative w-full shrink-0">
        {/* Gradient fade above composer */}
        <div
          className="absolute inset-x-0 -top-10 h-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--background))' }}
        />

        {/* ── Utility bar ─────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-1.5 px-4 sm:px-6 pt-3 pb-1.5">
          <AnimatePresence>
            {sessionId && (
              <motion.span
                initial={{ opacity: 0, scale: 0.90 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.90 }}
                transition={{ duration: 0.20, ease: EASE }}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono font-medium"
                style={{
                  fontSize: '11px',
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--muted-foreground)',
                  letterSpacing: '-0.01em',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                {sessionId.slice(0, 8)}
              </motion.span>
            )}
          </AnimatePresence>

          <motion.div whileHover={{ scale: 1.10 }} whileTap={{ scale: 0.88 }}>
            <Button
              id="clear-chat-btn"
              variant="ghost"
              size="icon"
              onClick={clearCurrentChat}
              disabled={isLoading}
              className="w-7 h-7 rounded-lg transition-colors duration-150"
              style={{ color: 'var(--muted-foreground)', opacity: 0.55 }}
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
          <ThemeToggle />
        </div>

        {/* ── Error banner ────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="mx-4 sm:mx-6 mb-2.5 overflow-hidden"
            >
              <div
                className="flex items-start gap-2.5 rounded-xl px-3.5 py-2.5"
                style={{
                  background: 'oklch(from var(--destructive) l c h / 0.07)',
                  border: '1px solid oklch(from var(--destructive) l c h / 0.22)',
                }}
              >
                <AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                <p className="flex-1 text-[13px] text-destructive leading-snug font-medium">{error}</p>
                <motion.button
                  onClick={clearError}
                  aria-label="Dismiss error"
                  className="text-destructive/50 hover:text-destructive transition-colors mt-0.5 shrink-0"
                  whileTap={{ scale: 0.85 }}
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Floating composer ─────────────────────────────────── */}
        <div className="px-3 sm:px-5 pb-4">
          <form onSubmit={handleSubmit}>
            {/* Composer card — Framer Motion handles focus glow */}
            <motion.div
              className="relative flex items-end gap-2 rounded-[24px] px-3.5 py-3 transition-all duration-300"
              animate={{
                borderColor: isFocused
                  ? 'color-mix(in oklch, var(--primary) 55%, var(--border-strong) 45%)'
                  : 'var(--border-strong)',
                boxShadow: isFocused
                  ? 'var(--shadow-lg), 0 0 0 2px var(--primary-glow)'
                  : 'var(--shadow-md)',
                y: isFocused ? -1 : 0,
              }}
              transition={{ duration: 0.3, ease: EASE }}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border-strong)',
              }}
            >
              {/* Attach button */}
              <motion.div whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }}>
                <Button
                  id="attach-doc-btn"
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setUploadOpen(true)}
                  title="Upload document"
                  className="w-9 h-9 shrink-0 mb-0.5 rounded-xl transition-colors duration-200"
                  style={{ 
                    color: isFocused ? 'var(--foreground)' : 'var(--muted-foreground)', 
                    opacity: isFocused ? 0.78 : 0.58 
                  }}
                >
                  <Paperclip className="w-4.5 h-4.5" />
                </Button>
              </motion.div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                id="message-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Message NeuralChat…"
                disabled={isLoading}
                rows={1}
                maxLength={LIMIT}
                aria-label="Message input"
                className="flex-1 resize-none bg-transparent outline-none disabled:opacity-50 py-1"
                style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  letterSpacing: '-0.01em',
                  minHeight: '28px',
                  color: 'var(--foreground)',
                  caretColor: 'var(--primary)',
                }}
              />
              <style>{`#message-input::placeholder { color: var(--muted-foreground); opacity: ${isFocused ? '0.66' : '0.56'}; transition: all 0.25s ease; }`}</style>

              {/* Send button */}
              <motion.div
                whileHover={canSend ? { scale: 1.1, y: -1 } : {}}
                whileTap={canSend ? { scale: 0.95 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <Button
                  id="send-message-btn"
                  type="submit"
                  size="icon"
                  disabled={!canSend}
                  className="w-9 h-9 shrink-0 mb-0.5 rounded-xl transition-all duration-300 shadow-sm"
                  style={canSend
                    ? {
                        background: 'linear-gradient(135deg, color-mix(in oklch, var(--primary) 88%, white 12%) 0%, color-mix(in oklch, var(--primary) 78%, black 22%) 100%)',
                        color: '#fff',
                        boxShadow: '0 3px 10px var(--primary-glow)',
                      }
                    : { background: 'var(--muted)', color: 'var(--muted-foreground)', opacity: 0.45 }
                  }
                  title="Send message"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isLoading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Spinner className="w-4 h-4" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="arrow"
                        initial={{ opacity: 0, scale: 0.8, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -5 }}
                        transition={{ duration: 0.2, ease: EASE }}
                      >
                        <ArrowUp className="w-4.5 h-4.5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </motion.div>

            {/* Caption row */}
            <div className="flex items-center justify-between mt-2 px-1">
              <p
                className="text-[11.5px] tracking-tight select-none"
                style={{ color: 'var(--muted-foreground)', opacity: 0.52 }}
              >
                <span>↵ send</span>
                <span className="mx-1.5" style={{ opacity: 0.4 }}>·</span>
                <span>⇧↵ new line</span>
                <span className="mx-1.5" style={{ opacity: 0.4 }}>·</span>
                <motion.button
                  type="button"
                  onClick={() => setUploadOpen(true)}
                  className="hover:underline underline-offset-2 transition-colors duration-150"
                  style={{ color: 'var(--muted-foreground)', opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  attach a doc
                </motion.button>
              </p>
              <AnimatePresence>
                {charCount > LIMIT * 0.8 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.16 }}
                    className="text-[11px] tabular-nums font-medium"
                    style={{ color: charCount >= LIMIT ? 'var(--destructive)' : 'var(--muted-foreground)' }}
                  >
                    {charCount}/{LIMIT}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>
      </div>

      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
