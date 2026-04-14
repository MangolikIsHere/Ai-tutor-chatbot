'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Send, Trash2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useChatContext } from '@/lib/chat-context';

export function MessageInput() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isLoading, sendChatMessage, clearCurrentChat, error, clearError } =
    useChatContext();

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(
        textareaRef.current.scrollHeight,
        120
      ) + 'px';
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendChatMessage(input);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Chatbot
        </h1>
        <ThemeToggle />
      </div>

      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg flex items-start justify-between">
          <span className="text-sm">{error}</span>
          <button
            onClick={clearError}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 px-4 pb-4">
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question... (Ctrl+Enter to send)"
            disabled={isLoading}
            className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            rows={1}
          />
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white h-auto px-4 py-2"
            >
              {isLoading ? (
                <Spinner className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={clearCurrentChat}
              disabled={isLoading}
              className="h-auto px-4 py-2"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
