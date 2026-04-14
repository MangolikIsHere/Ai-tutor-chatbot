'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

export function Message({ content, role, timestamp }: MessageProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const isUser = role === 'user';
  const timeStr = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(Date.now());
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
        }`}
      >
        <div className="text-sm leading-relaxed">
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : 'text';
                  const codeStr = String(children).replace(/\n$/, '');

                  if (inline) {
                    return (
                      <code
                        className="bg-gray-300 dark:bg-gray-600 px-1.5 py-0.5 rounded text-xs font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  return (
                    <div className="relative bg-gray-800 dark:bg-gray-900 text-gray-100 rounded mt-2 mb-2 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 dark:bg-gray-950 border-b border-gray-700">
                        <span className="text-xs font-mono text-gray-400">
                          {language}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyCode(codeStr)}
                          className="h-7 w-7 p-0 text-gray-400 hover:text-gray-200"
                        >
                          {copiedIndex === copiedIndex ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="p-3 overflow-x-auto text-xs leading-relaxed">
                        <code className="font-mono">{codeStr}</code>
                      </pre>
                    </div>
                  );
                },
                a({ children, href }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:opacity-80"
                    >
                      {children}
                    </a>
                  );
                },
                ul({ children }) {
                  return <ul className="list-disc list-inside my-2">{children}</ul>;
                },
                ol({ children }) {
                  return (
                    <ol className="list-decimal list-inside my-2">{children}</ol>
                  );
                },
                h1({ children }) {
                  return <h1 className="text-lg font-bold my-2">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="text-base font-bold my-2">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="text-sm font-bold my-2">{children}</h3>;
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-4 border-gray-400 pl-3 my-2 italic">
                      {children}
                    </blockquote>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
        <div className="text-xs opacity-70 mt-1">{timeStr}</div>
      </div>
    </div>
  );
}
