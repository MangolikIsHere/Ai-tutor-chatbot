'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

export function Message({ content, role, timestamp }: MessageProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const isUser = role === 'user';
  const timeStr = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(content);
    setCopied('message');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      className={cn(
        'group flex gap-3 px-4 py-3 msg-animate',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Avatar — AI side */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg btn-gradient flex items-center justify-center shadow-sm mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Bubble */}
      <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start', 'max-w-[75%] lg:max-w-[68%]')}>
        <div
          className={cn(
            'relative rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-card border border-border text-card-foreground rounded-tl-sm'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div className="prose-custom">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Inline code
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : 'text';
                    const codeStr = String(children).replace(/\n$/, '');
                    const codeKey = `${language}-${codeStr.slice(0, 20)}`;

                    if (inline) {
                      return (
                        <code
                          className="bg-muted text-foreground/90 px-1.5 py-0.5 rounded text-[0.8em] font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return (
                      <div className="relative mt-3 mb-3 rounded-xl overflow-hidden border border-border bg-[#0d0d10] dark:bg-[#09090c]">
                        {/* Code header */}
                        <div className="flex items-center justify-between px-4 py-2 bg-[#13131a] border-b border-border/50">
                          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                            {language}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyCode(codeStr, codeKey)}
                            className="h-6 gap-1 text-muted-foreground hover:text-foreground px-2"
                          >
                            {copied === codeKey ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-[11px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[11px]">Copy</span>
                              </>
                            )}
                          </Button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
                          <code className="font-mono text-gray-200">{codeStr}</code>
                        </pre>
                      </div>
                    );
                  },
                  p({ children }) {
                    return <p className="mb-2 last:mb-0">{children}</p>;
                  },
                  a({ children, href }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                      >
                        {children}
                      </a>
                    );
                  },
                  ul({ children }) {
                    return <ul className="list-disc list-outside ml-4 my-2 space-y-0.5">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal list-outside ml-4 my-2 space-y-0.5">{children}</ol>;
                  },
                  li({ children }) {
                    return <li className="text-sm">{children}</li>;
                  },
                  h1({ children }) {
                    return <h1 className="text-lg font-semibold mt-4 mb-2">{children}</h1>;
                  },
                  h2({ children }) {
                    return <h2 className="text-base font-semibold mt-3 mb-1.5">{children}</h2>;
                  },
                  h3({ children }) {
                    return <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>;
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-2 border-primary/50 pl-3 my-2 text-muted-foreground italic">
                        {children}
                      </blockquote>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-2">
                        <table className="text-xs border-collapse w-full">{children}</table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return (
                      <th className="border border-border px-3 py-1.5 bg-muted text-left font-medium">
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td className="border border-border px-3 py-1.5">{children}</td>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer: time + copy */}
        <div
          className={cn(
            'flex items-center gap-2 px-1',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <span className="text-[11px] text-muted-foreground/60">{timeStr}</span>
          {!isUser && (
            <button
              onClick={handleCopyMessage}
              className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
              title="Copy response"
            >
              {copied === 'message' ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Avatar — user side */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center mt-0.5">
          <User className="w-3.5 h-3.5 text-foreground/70" />
        </div>
      )}
    </div>
  );
}
