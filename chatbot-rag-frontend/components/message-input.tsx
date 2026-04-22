'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ArrowUp, Trash2, AlertCircle, X, Paperclip } from 'lucide-react';
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
    el.style.height = Math.min(el.scrollHeight, 168) + 'px';
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
      <div className="relative w-full shrink-0">
        {/* Gradient fade from bottom of chat area into composer */}
        <div
          className="absolute inset-x-0 -top-10 h-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, var(--background))',
          }}
        />

        {/* ── Top utility bar ────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-1.5 px-4 sm:px-6 pt-3 pb-1.5">
          {/* Session badge */}
          {sessionId && (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono font-medium"
              style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                color: 'var(--muted-foreground)',
                letterSpacing: '-0.01em',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
              />
              {sessionId.slice(0, 8)}
            </span>
          )}
          <Button
            id="clear-chat-btn"
            variant="ghost"
            size="icon"
            onClick={clearCurrentChat}
            disabled={isLoading}
            className="w-7 h-7 rounded-lg transition-all duration-150"
            style={{ color: 'var(--muted-foreground)', opacity: 0.65 }}
            title="Clear conversation"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--destructive)';
              (e.currentTarget as HTMLElement).style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)';
              (e.currentTarget as HTMLElement).style.opacity = '0.65';
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <ThemeToggle />
        </div>

        {/* ── Error banner ────────────────────────────────────── */}
        {error && (
          <div
            className="mx-4 sm:mx-6 mb-2.5 flex items-start gap-2.5 rounded-xl px-3.5 py-2.5"
            style={{
              background: 'oklch(from var(--destructive) l c h / 0.07)',
              border: '1px solid oklch(from var(--destructive) l c h / 0.22)',
            }}
          >
            <AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
            <p className="flex-1 text-[13px] text-destructive leading-snug font-medium">{error}</p>
            <button
              onClick={clearError}
              aria-label="Dismiss error"
              className="text-destructive/50 hover:text-destructive transition-colors mt-0.5 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Floating composer ─────────────────────────────────── */}
        <div className="px-3 sm:px-5 pb-4">
          <form onSubmit={handleSubmit}>
            {/* Composer card */}
            <div
              className={cn(
                'relative flex items-end gap-2 rounded-[20px] px-3 py-2.5',
                'transition-all duration-200',
              )}
              style={{
                background: 'var(--card)',
                border: '1.5px solid var(--border-strong)',
                boxShadow: '0 4px 24px -4px rgba(0,0,0,0.10), 0 1px 6px 0 rgba(0,0,0,0.06)',
              }}
              onFocus={() => {}}
            >
              {/* Inner focus ring handled via CSS below */}
              <style>{`
                .composer-card:focus-within {
                  border-color: var(--primary) !important;
                  box-shadow: 0 4px 32px -4px rgba(0,0,0,0.12), 0 0 0 3px var(--primary-glow) !important;
                }
              `}</style>
              <div
                className="composer-card absolute inset-0 rounded-[20px] pointer-events-none"
                style={{ transition: 'box-shadow 0.2s ease, border-color 0.2s ease' }}
              />

              {/* Attach button */}
              <Button
                id="attach-doc-btn"
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setUploadOpen(true)}
                title="Upload document"
                className="w-8 h-8 shrink-0 mb-0.5 rounded-xl transition-all duration-150"
                style={{ color: 'var(--muted-foreground)' }}
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
                className="flex-1 resize-none bg-transparent outline-none disabled:opacity-50 py-0.5"
                style={{
                  fontSize: '14px',
                  lineHeight: '1.65',
                  letterSpacing: '-0.008em',
                  minHeight: '28px',
                  color: 'var(--foreground)',
                  caretColor: 'var(--primary)',
                }}
              />

              {/* Send button */}
              <Button
                id="send-message-btn"
                type="submit"
                size="icon"
                disabled={!canSend}
                className={cn(
                  'w-9 h-9 shrink-0 mb-0.5 rounded-full transition-all duration-200',
                  canSend
                    ? 'btn-gradient text-white shadow-sm hover:opacity-90 hover:scale-[1.06] active:scale-[0.94]'
                    : 'cursor-not-allowed'
                )}
                style={!canSend ? {
                  background: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                  opacity: 0.45,
                } : {}}
                title="Send message"
              >
                {isLoading
                  ? <Spinner className="w-3.5 h-3.5" />
                  : <ArrowUp className="w-4 h-4" />
                }
              </Button>
            </div>

            {/* Composer placeholder hint */}
            {!input && (
              <style>{`
                #message-input::placeholder {
                  color: var(--muted-foreground);
                  opacity: 0.55;
                }
              `}</style>
            )}

            {/* Bottom caption */}
            <div className="flex items-center justify-between mt-2 px-1">
              <p
                className="text-[11.5px] tracking-tight select-none"
                style={{ color: 'var(--muted-foreground)', opacity: 0.55 }}
              >
                <span>↵ send</span>
                <span className="mx-1.5" style={{ opacity: 0.4 }}>·</span>
                <span>⇧↵ new line</span>
                <span className="mx-1.5" style={{ opacity: 0.4 }}>·</span>
                <button
                  type="button"
                  onClick={() => setUploadOpen(true)}
                  className="transition-colors duration-150 hover:underline underline-offset-2"
                  style={{ color: 'var(--primary)', opacity: 0.75 }}
                >
                  attach a doc
                </button>
              </p>
              {charCount > LIMIT * 0.8 && (
                <span
                  className="text-[11px] tabular-nums font-medium transition-colors"
                  style={{
                    color: charCount >= LIMIT ? 'var(--destructive)' : 'var(--muted-foreground)',
                  }}
                >
                  {charCount}/{LIMIT}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
