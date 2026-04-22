'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Send, Trash2, AlertCircle, X, Sparkles, Paperclip } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useChatContext } from '@/lib/chat-context';
import { DocumentUploadDialog } from '@/components/document-upload-dialog';
import { cn } from '@/lib/utils';

export function MessageInput() {
  const [input, setInput] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isLoading, sendChatMessage, clearCurrentChat, error, clearError, sessionId } =
    useChatContext();

  /* ── Auto-resize textarea ───────────────────────────────────── */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [input]);

  /* ── Submit ────────────────────────────────────────────────── */
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
      <div
        className={cn(
          'relative w-full bg-background/95',
          'border-t border-border',
          'backdrop-blur-sm supports-[backdrop-filter]:bg-background/80'
        )}
      >
        {/* ── Topbar ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-6 h-12 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden />
            <span className="text-[13px] font-semibold tracking-tight">NeuralChat</span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-90" />
              <span className="text-[10px] font-medium text-muted-foreground">AI Tutor</span>
            </span>
            <span className="hidden md:inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
              session: {sessionId ? `${sessionId.slice(0, 8)}...` : 'none'}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              id="clear-chat-btn"
              variant="ghost"
              size="icon"
              onClick={clearCurrentChat}
              disabled={isLoading}
              className="w-8 h-8 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* ── Error banner ────────────────────────────────────── */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-3 flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/8 px-3.5 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
            <p className="flex-1 text-[12.5px] text-destructive leading-snug">{error}</p>
            <button
              onClick={clearError}
              aria-label="Dismiss error"
              className="text-destructive/60 hover:text-destructive transition-colors mt-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Composer ─────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 pt-3 pb-3">
          <form onSubmit={handleSubmit}>
            <div
              className={cn(
                'relative flex items-end gap-2 rounded-2xl border bg-card px-3 py-2.5',
                'shadow-sm transition-all duration-200',
                'focus-within:border-primary/60 focus-within:shadow-[0_0_0_3px_oklch(from_var(--primary)_l_c_h_/_0.12)]',
                isLoading ? 'border-border' : 'border-border hover:border-border-strong'
              )}
            >
              {/* Attach button */}
              <Button
                id="attach-doc-btn"
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setUploadOpen(true)}
                title="Upload document"
                className={cn(
                  'w-8 h-8 shrink-0 mb-0.5 text-muted-foreground/50',
                  'hover:text-primary hover:bg-primary/10 transition-all rounded-xl'
                )}
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                id="message-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message NeuralChat…"
                disabled={isLoading}
                rows={1}
                maxLength={LIMIT}
                aria-label="Message input"
                className={cn(
                  'flex-1 resize-none bg-transparent text-[14px] leading-relaxed outline-none',
                  'placeholder:text-muted-foreground/40 min-h-[26px]',
                  'disabled:opacity-50 py-0.5'
                )}
              />

              {/* Send button */}
              <Button
                id="send-message-btn"
                type="submit"
                size="icon"
                disabled={!canSend}
                className={cn(
                  'w-8 h-8 shrink-0 mb-0.5 rounded-xl transition-all duration-200',
                  canSend
                    ? 'btn-gradient text-white shadow-sm hover:opacity-90 active:scale-95'
                    : 'bg-muted text-muted-foreground/40 cursor-not-allowed'
                )}
                title="Send message"
              >
                {isLoading
                  ? <Spinner className="w-3.5 h-3.5" />
                  : <Send className="w-3.5 h-3.5" />
                }
              </Button>
            </div>

            {/* Hints row */}
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-[11px] text-muted-foreground/40">
                <kbd className="font-sans">Enter</kbd> to send
                &nbsp;·&nbsp;
                <kbd className="font-sans">Shift+Enter</kbd> for new line
                &nbsp;·&nbsp;
                <button
                  type="button"
                  onClick={() => setUploadOpen(true)}
                  className="text-primary/60 hover:text-primary transition-colors"
                >
                  attach a document
                </button>
              </p>
              {charCount > LIMIT * 0.8 && (
                <span
                  className={cn(
                    'text-[11px] tabular-nums transition-colors',
                    charCount >= LIMIT ? 'text-destructive' : 'text-muted-foreground/60'
                  )}
                >
                  {charCount}/{LIMIT}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Upload dialog */}
      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
