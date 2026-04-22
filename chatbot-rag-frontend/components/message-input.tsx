'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Send, Trash2, AlertCircle, X, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useChatContext } from '@/lib/chat-context';
import { cn } from '@/lib/utils';

export function MessageInput() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isLoading, sendChatMessage, clearCurrentChat, error, clearError } =
    useChatContext();

  /* Auto-resize textarea */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 140) + 'px';
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendChatMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e as any);
    }
  };

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div className="w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* ── Topbar (title + theme) ── */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h1 className="text-sm font-semibold tracking-tight">NeuralChat</h1>
          <span className="hidden sm:inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
            AI-powered
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearCurrentChat}
            disabled={isLoading}
            className="w-8 h-8 text-muted-foreground hover:text-destructive"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="mx-4 mb-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">
          <AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
          <p className="flex-1 text-xs text-destructive">{error}</p>
          <button
            onClick={clearError}
            className="text-destructive/70 hover:text-destructive transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Input area ── */}
      <form onSubmit={handleSubmit} className="px-4 pb-4">
        <div
          className={cn(
            'flex items-end gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm transition-all',
            'focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10'
          )}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message NeuralChat…"
            disabled={isLoading}
            rows={1}
            className={cn(
              'flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none',
              'placeholder:text-muted-foreground/50',
              'disabled:opacity-50 min-h-[24px]'
            )}
          />

          {/* Send button */}
          <Button
            type="submit"
            size="icon"
            disabled={!canSend}
            className={cn(
              'rounded-xl w-8 h-8 shrink-0 transition-all',
              canSend
                ? 'btn-gradient text-white shadow-sm hover:opacity-90'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {isLoading ? (
              <Spinner className="w-3.5 h-3.5" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>

        <p className="mt-2 text-center text-[11px] text-muted-foreground/40">
          Press <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for new line
        </p>
      </form>
    </div>
  );
}
