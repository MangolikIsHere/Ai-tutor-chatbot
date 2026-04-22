'use client';

import React, { useState, useCallback } from 'react';
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

// ─── Code Block ──────────────────────────────────────────────────────────────

interface CodeBlockProps {
  language: string;
  codeStr: string;
}

function CodeBlock({ language, codeStr }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-border/60 bg-[#0c0c12] dark:bg-[#09090e] shadow-md">
      {/* Header bar */}
      <div className="flex items-center justify-between pl-4 pr-2 py-2 bg-[#111118] border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          {/* Traffic light dots — purely decorative */}
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80" />
          <span className="ml-2 text-[10px] font-mono font-medium text-white/30 uppercase tracking-widest">
            {language}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className={cn(
            'h-6 px-2 gap-1.5 text-[11px] transition-all',
            copied
              ? 'text-emerald-400 hover:text-emerald-400'
              : 'text-white/30 hover:text-white/70'
          )}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      {/* Code body */}
      <pre className="overflow-x-auto p-4 text-[13px] leading-[1.7] text-gray-200">
        <code className="font-mono">{codeStr}</code>
      </pre>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function AIAvatar() {
  return (
    <div className="flex-shrink-0 w-7 h-7 rounded-lg btn-gradient flex items-center justify-center shadow-sm mt-0.5">
      <Sparkles className="w-3.5 h-3.5 text-white" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center mt-0.5">
      <User className="w-3.5 h-3.5 text-foreground/60" />
    </div>
  );
}

// ─── Message ──────────────────────────────────────────────────────────────────

export function Message({ content, role, timestamp }: MessageProps) {
  const [msgCopied, setMsgCopied] = useState(false);
  const isUser = role === 'user';

  const timeStr = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopyMessage = useCallback(() => {
    navigator.clipboard.writeText(content);
    setMsgCopied(true);
    setTimeout(() => setMsgCopied(false), 2000);
  }, [content]);

  return (
    <div
      className={cn(
        'group/msg flex gap-2.5 px-4 sm:px-6 py-2 msg-animate',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && <AIAvatar />}

      {/* Content column */}
      <div
        className={cn(
          'flex flex-col gap-1 min-w-0',
          isUser ? 'items-end max-w-[78%] sm:max-w-[68%]' : 'items-start max-w-[86%] sm:max-w-[75%]'
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            'relative px-4 py-3 text-[14px] leading-[1.65] break-words',
            isUser
              ? [
                  'rounded-2xl rounded-tr-sm',
                  'btn-gradient text-white shadow-sm',
                ]
              : [
                  'rounded-2xl rounded-tl-sm',
                  'bg-card border border-border text-card-foreground shadow-sm',
                ]
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="space-y-0.5">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : 'text';
                    const codeStr = String(children).replace(/\n$/, '');

                    if (inline) {
                      return (
                        <code
                          className="bg-muted/80 text-foreground px-1.5 py-0.5 rounded text-[0.82em] font-mono border border-border/50"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return <CodeBlock language={language} codeStr={codeStr} />;
                  },
                  p({ children }) {
                    return <p className="mb-2.5 last:mb-0 leading-[1.7]">{children}</p>;
                  },
                  a({ children, href }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 hover:opacity-75 transition-opacity"
                      >
                        {children}
                      </a>
                    );
                  },
                  ul({ children }) {
                    return (
                      <ul className="list-disc list-outside ml-5 my-2 space-y-1 text-[13.5px]">
                        {children}
                      </ul>
                    );
                  },
                  ol({ children }) {
                    return (
                      <ol className="list-decimal list-outside ml-5 my-2 space-y-1 text-[13.5px]">
                        {children}
                      </ol>
                    );
                  },
                  li({ children }) {
                    return <li className="leading-[1.6]">{children}</li>;
                  },
                  h1({ children }) {
                    return (
                      <h1 className="text-[17px] font-semibold tracking-tight mt-5 mb-2 first:mt-0">
                        {children}
                      </h1>
                    );
                  },
                  h2({ children }) {
                    return (
                      <h2 className="text-[15px] font-semibold tracking-tight mt-4 mb-1.5 first:mt-0">
                        {children}
                      </h2>
                    );
                  },
                  h3({ children }) {
                    return (
                      <h3 className="text-[14px] font-semibold mt-3 mb-1 first:mt-0">
                        {children}
                      </h3>
                    );
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-2 border-primary/40 pl-3.5 my-2.5 text-muted-foreground italic text-[13.5px]">
                        {children}
                      </blockquote>
                    );
                  },
                  hr() {
                    return <hr className="my-3 border-border" />;
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-3 rounded-lg border border-border">
                        <table className="text-[12.5px] border-collapse w-full">{children}</table>
                      </div>
                    );
                  },
                  thead({ children }) {
                    return <thead className="bg-muted/60">{children}</thead>;
                  },
                  th({ children }) {
                    return (
                      <th className="border-b border-border px-3.5 py-2 text-left font-medium text-foreground/80">
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td className="border-b border-border/50 px-3.5 py-2 last:border-b-0">
                        {children}
                      </td>
                    );
                  },
                  strong({ children }) {
                    return <strong className="font-semibold text-foreground">{children}</strong>;
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Meta row: timestamp + copy */}
        <div
          className={cn(
            'flex items-center gap-2 px-1',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <time className="text-[11px] tabular-nums text-muted-foreground/50">{timeStr}</time>
          {!isUser && (
            <button
              onClick={handleCopyMessage}
              aria-label="Copy message"
              className={cn(
                'flex items-center gap-1 text-[11px] transition-all',
                'opacity-0 group-hover/msg:opacity-100',
                msgCopied
                  ? 'text-emerald-400'
                  : 'text-muted-foreground/50 hover:text-muted-foreground'
              )}
            >
              {msgCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {isUser && <UserAvatar />}
    </div>
  );
}
