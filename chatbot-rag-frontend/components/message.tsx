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

function CodeBlock({ language, codeStr }: { language: string; codeStr: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative my-4 rounded-2xl overflow-hidden"
      style={{
        background: '#0d0d14',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: '#111119', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span
          className="font-mono font-semibold uppercase"
          style={{ fontSize: '10px', letterSpacing: '0.09em', color: 'rgba(255,255,255,0.30)' }}
        >
          {language || 'code'}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-6 px-2.5 gap-1.5 rounded-lg transition-all"
          style={{
            fontSize: '11px',
            color: copied ? 'rgb(52,211,153)' : 'rgba(255,255,255,0.35)',
          }}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      {/* Body */}
      <pre
        className="overflow-x-auto px-4 py-4"
        style={{ fontSize: '13px', lineHeight: '1.75', color: '#c9d1d9' }}
      >
        <code className="font-mono">{codeStr}</code>
      </pre>
    </div>
  );
}

// ─── Avatars ──────────────────────────────────────────────────────────────────

function AIAvatar() {
  return (
    <div
      className="flex-shrink-0 w-7 h-7 rounded-full btn-gradient flex items-center justify-center mt-0.5"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }}
    >
      <Sparkles className="w-3.5 h-3.5 text-white" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div
      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
      style={{
        background: 'var(--surface-02)',
        border: '1px solid var(--border)',
      }}
    >
      <User className="w-3.5 h-3.5" style={{ color: 'var(--foreground)', opacity: 0.55 }} />
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
        'group/msg flex gap-3 px-4 sm:px-6 py-2 max-w-[780px] mx-auto msg-animate',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && <AIAvatar />}

      <div
        className={cn(
          'flex flex-col gap-1.5 min-w-0',
          isUser
            ? 'items-end max-w-[72%] sm:max-w-[60%]'
            : 'items-start max-w-[90%] sm:max-w-[82%]'
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            'relative px-4 py-3 break-words rounded-2xl',
            isUser ? 'rounded-tr-md btn-gradient text-white' : 'rounded-tl-md'
          )}
          style={{
            fontSize: '14px',
            lineHeight: '1.72',
            letterSpacing: '-0.009em',
            ...(isUser
              ? { boxShadow: '0 2px 10px rgba(0,0,0,0.14)' }
              : {
                  background: 'var(--card)',
                  color: 'var(--card-foreground)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }),
          }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div>
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
                          className="font-mono border"
                          style={{
                            background: 'var(--muted)',
                            borderColor: 'var(--border)',
                            borderRadius: '5px',
                            padding: '1px 6px',
                            fontSize: '0.82em',
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return <CodeBlock language={language} codeStr={codeStr} />;
                  },
                  p({ children }) {
                    return <p className="mb-2.5 last:mb-0" style={{ lineHeight: '1.76' }}>{children}</p>;
                  },
                  a({ children, href }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 transition-opacity hover:opacity-70"
                        style={{ color: 'var(--primary)' }}
                      >
                        {children}
                      </a>
                    );
                  },
                  ul({ children }) {
                    return (
                      <ul className="list-disc list-outside ml-5 my-2.5 space-y-1.5" style={{ fontSize: '13.5px' }}>
                        {children}
                      </ul>
                    );
                  },
                  ol({ children }) {
                    return (
                      <ol className="list-decimal list-outside ml-5 my-2.5 space-y-1.5" style={{ fontSize: '13.5px' }}>
                        {children}
                      </ol>
                    );
                  },
                  li({ children }) {
                    return <li style={{ lineHeight: '1.7' }}>{children}</li>;
                  },
                  h1({ children }) {
                    return (
                      <h1 className="mt-5 mb-2 first:mt-0" style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.026em' }}>
                        {children}
                      </h1>
                    );
                  },
                  h2({ children }) {
                    return (
                      <h2 className="mt-4 mb-1.5 first:mt-0" style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.020em' }}>
                        {children}
                      </h2>
                    );
                  },
                  h3({ children }) {
                    return (
                      <h3 className="mt-3 mb-1 first:mt-0" style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.015em' }}>
                        {children}
                      </h3>
                    );
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote
                        className="my-3 pl-3.5 italic"
                        style={{
                          borderLeft: '2.5px solid var(--primary)',
                          opacity: 0.75,
                          fontSize: '13.5px',
                          lineHeight: '1.7',
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        {children}
                      </blockquote>
                    );
                  },
                  hr() {
                    return <hr className="my-4" style={{ borderColor: 'var(--border)' }} />;
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-4 rounded-xl" style={{ border: '1px solid var(--border)' }}>
                        <table style={{ fontSize: '12.5px', borderCollapse: 'collapse', width: '100%' }}>
                          {children}
                        </table>
                      </div>
                    );
                  },
                  thead({ children }) {
                    return <thead style={{ background: 'var(--muted)' }}>{children}</thead>;
                  },
                  th({ children }) {
                    return (
                      <th
                        className="text-left"
                        style={{
                          padding: '10px 16px',
                          fontWeight: 600,
                          fontSize: '12px',
                          letterSpacing: '-0.010em',
                          borderBottom: '1px solid var(--border)',
                          color: 'var(--foreground)',
                          opacity: 0.80,
                        }}
                      >
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td style={{ padding: '9px 16px', borderBottom: '1px solid var(--border)', opacity: 0.9 }}>
                        {children}
                      </td>
                    );
                  },
                  strong({ children }) {
                    return (
                      <strong style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                        {children}
                      </strong>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-0.5',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <time
            style={{
              fontSize: '11px',
              color: 'var(--muted-foreground)',
              opacity: 0.45,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.008em',
            }}
          >
            {timeStr}
          </time>
          {!isUser && (
            <button
              onClick={handleCopyMessage}
              aria-label="Copy message"
              className={cn(
                'flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-all duration-150',
                'opacity-0 group-hover/msg:opacity-100',
              )}
              style={{
                fontSize: '11px',
                color: msgCopied ? 'rgb(52,211,153)' : 'var(--muted-foreground)',
                background: msgCopied ? 'rgba(52,211,153,0.10)' : 'transparent',
              }}
            >
              {msgCopied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
              {msgCopied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {isUser && <UserAvatar />}
    </div>
  );
}
