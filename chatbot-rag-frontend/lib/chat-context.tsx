/**
 * chat-context.tsx — with buffer memory support
 *
 * Key changes vs the previous version:
 *  - ChatResponse now includes session_id (echoed back by the server).
 *  - On the FIRST plain-chat reply, the server-assigned session_id is stored
 *    so all subsequent turns in the same conversation share the same backend
 *    memory buffer.
 *  - On PDF upload, the upload-returned session_id is stored immediately.
 *  - clearCurrentChat resets session_id so a fresh memory buffer is used.
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { sendMessage, uploadPDF, type ChatResponse, type UploadResponse } from '@/lib/api';

const BACKEND_SESSION_STORAGE_KEY = 'rag_backend_session_id';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Message {
  id:        string;
  role:      'user' | 'assistant';
  content:   string;
  timestamp: number;
}

export interface Chat {
  id:       string;
  title:    string;
  messages: Message[];
}

interface ChatContextValue {
  currentChat:      Chat | null;
  isLoading:        boolean;
  error:            string | null;
  /** Active session_id — set after upload OR after first chat reply. */
  sessionId:        string | null;
  sendChatMessage:  (text: string) => Promise<void>;
  clearCurrentChat: () => void;
  clearError:       () => void;
  handleUpload:     (file: File, onProgress?: (pct: number) => void) => Promise<UploadResponse>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used inside <ChatProvider>');
  return ctx;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeChat(): Chat {
  return { id: crypto.randomUUID(), title: 'New chat', messages: [] };
}

function makeMessage(role: Message['role'], content: string): Message {
  return { id: crypto.randomUUID(), role, content, timestamp: Date.now() };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ChatProvider({ children }: { children: ReactNode }) {
  const [currentChat, setCurrentChat] = useState<Chat>(() => makeChat());
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  /**
   * sessionId is either:
   *   - null        → no session yet (first message of a fresh chat)
   *   - uuid string → set after /upload OR after the server echoes one back
   *                   on the first /chat reply; all subsequent turns reuse it
   *                   so the backend memory buffer stays continuous.
   */
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Restore persisted backend session so uploaded-PDF context survives refreshes.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(BACKEND_SESSION_STORAGE_KEY);
    if (stored) setSessionId(stored);
  }, []);

  // Keep localStorage synchronized with the active backend session.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionId) {
      window.localStorage.setItem(BACKEND_SESSION_STORAGE_KEY, sessionId);
    } else {
      window.localStorage.removeItem(BACKEND_SESSION_STORAGE_KEY);
    }
  }, [sessionId]);

  /* ── Send message ──────────────────────────────────────────────────────── */
  const sendChatMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg = makeMessage('user', text);
    setCurrentChat((prev) => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      title: prev.messages.length === 0 ? text.slice(0, 40) : prev.title,
    }));
    setIsLoading(true);
    setError(null);

    try {
      const res: ChatResponse = await sendMessage({
        message:    text,
        session_id: sessionId,   // null on first message → server creates one
      });

      const assistantMsg = makeMessage('assistant', res.response);
      setCurrentChat((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMsg],
      }));

      // Store the session_id echoed by the server.
      // On subsequent turns this keeps the backend memory buffer alive.
      if (res.session_id && res.session_id !== sessionId) {
        setSessionId(res.session_id);
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId]);

  /* ── Upload PDF ────────────────────────────────────────────────────────── */
  const handleUpload = useCallback(
    async (file: File, onProgress?: (pct: number) => void): Promise<UploadResponse> => {
      const result = await uploadPDF(file, onProgress);
      setSessionId(result.session_id);   // PDF session takes over
      return result;
    },
    []
  );

  /* ── Clear chat ────────────────────────────────────────────────────────── */
  const clearCurrentChat = useCallback(() => {
    setCurrentChat(makeChat());
    setSessionId(null);   // backend will assign a new session on next message
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        isLoading,
        error,
        sessionId,
        sendChatMessage,
        clearCurrentChat,
        clearError,
        handleUpload,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
