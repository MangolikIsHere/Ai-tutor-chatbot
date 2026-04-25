'use client';

import React, {
  useState,
  useRef,
  useEffect,
} from 'react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  Copy,
  Check,
  User,
  Sparkles,
  MessageSquareText,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useChatContext } from '@/lib/chat-context';

interface Props {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

export function Message({
  id,
  content,
  role,
  timestamp,
}: Props) {
  const isUser =
    role === 'user';

  const wrapperRef =
    useRef<HTMLDivElement>(null);

  const [copied, setCopied] =
    useState(false);

  const [popup, setPopup] =
    useState({
      visible: false,
      text: '',
      x: 0,
      y: 0,
    });

  const {
    setReplyTarget,
  } = useChatContext();

  const time =
    new Date(
      timestamp
    ).toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );

  const closePopup =
    () =>
      setPopup({
        visible: false,
        text: '',
        x: 0,
        y: 0,
      });

  /* copy */

  const handleCopy =
    async () => {
      await navigator.clipboard.writeText(
        content
      );

      setCopied(true);

      setTimeout(
        () =>
          setCopied(false),
        1500
      );
    };

  /* ask full */

  const askFull =
    () => {
      setReplyTarget({
        id,
        content,
      });
    };

  /* ask selected */

  const askSelected =
    () => {
      setReplyTarget({
        id,
        content:
          popup.text,
      });

      closePopup();
    };

  /* text selection */

  useEffect(() => {
    if (isUser) return;

    const handleSelection =
      () => {
        const sel =
          window.getSelection();

        const text =
          sel
            ?.toString()
            .trim() || '';

        if (!text) {
          closePopup();
          return;
        }

        try {
          const range =
            sel!.getRangeAt(0);

          const rect =
            range.getBoundingClientRect();

          const parent =
            wrapperRef.current?.getBoundingClientRect();

          if (!parent) return;

          setPopup({
            visible: true,
            text,
            x:
              rect.left -
              parent.left +
              rect.width / 2,
            y:
              rect.top -
              parent.top -
              14,
          });
        } catch {
          closePopup();
        }
      };

    const hide =
      (
        e: MouseEvent
      ) => {
        const target =
          e.target as HTMLElement;

        if (
          !target.closest(
            '.selection-popup'
          )
        ) {
          closePopup();
        }
      };

    document.addEventListener(
      'mouseup',
      handleSelection
    );

    document.addEventListener(
      'mousedown',
      hide
    );

    return () => {
      document.removeEventListener(
        'mouseup',
        handleSelection
      );

      document.removeEventListener(
        'mousedown',
        hide
      );
    };
  }, [isUser]);

  return (
    <div
      className={cn(
        'group flex gap-3 px-4 sm:px-6 py-2 max-w-[780px] mx-auto',
        isUser
          ? 'justify-end'
          : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center mt-1 shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        ref={wrapperRef}
        className={cn(
          'relative flex flex-col gap-2',
          isUser
            ? 'items-end max-w-[70%]'
            : 'items-start max-w-[85%]'
        )}
      >
        {/* popup */}
        {popup.visible &&
          !isUser && (
            <div
              className="selection-popup"
              style={{
                left:
                  popup.x,
                top:
                  popup.y,
              }}
            >
              <button
                onClick={
                  askSelected
                }
                className="selection-action"
              >
                <MessageSquareText className="w-4 h-4" />
                Ask NeuralAi
              </button>
            </div>
          )}

        {/* bubble */}
        <div
          className={cn(
            'px-5 py-4 rounded-2xl border text-[15px] leading-7 select-text',
            isUser
              ? 'text-white rounded-tr-md'
              : 'bg-card border-border rounded-tl-md'
          )}
          style={{
            ...(isUser
              ? {
                  background:
                    'linear-gradient(135deg,#667eea,#764ba2)',
                }
              : {}),
          }}
        >
          {isUser ? (
            <p>{content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
              ]}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>

        {/* actions */}
        <div className="flex items-center gap-3 px-1 text-xs opacity-0 group-hover:opacity-100 transition">
          <span className="opacity-50">
            {time}
          </span>

          {!isUser && (
            <>
              <button
                onClick={
                  handleCopy
                }
                className="hover:opacity-100 opacity-70 flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>

              <button
                onClick={
                  askFull
                }
                className="hover:opacity-100 opacity-70 flex items-center gap-1"
              >
                <MessageSquareText className="w-3 h-3" />
                Ask NeuralAi
              </button>
            </>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl border border-border flex items-center justify-center mt-1 shrink-0">
          <User className="w-4 h-4 opacity-60" />
        </div>
      )}
    </div>
  );
}