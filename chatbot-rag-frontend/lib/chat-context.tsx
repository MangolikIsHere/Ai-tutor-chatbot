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
import {
  addMessageToChat,
  clearChat,
  createChat,
  deleteChat,
  generateChatTitle,
  getAllChats,
  updateChat,
  type Chat as StoredChat,
  type Message as StoredMessage,
} from '@/lib/storage';

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
  createdAt: number;
  updatedAt: number;
}

interface ChatContextValue {
  chats:            Chat[];
  currentChat:      Chat | null;
  isLoading:        boolean;
  error:            string | null;
  /** Active session_id — set after upload OR after first chat reply. */
  sessionId:        string | null;
  sendChatMessage:  (text: string) => Promise<void>;
  createNewChat:    () => void;
  switchChat:       (chatId: string) => void;
  deleteCurrentChat: () => void;
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
  return {
    id: crypto.randomUUID(),
    title: 'New chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function makeMessage(role: Message['role'], content: string): Message {
  return { id: crypto.randomUUID(), role, content, timestamp: Date.now() };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
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

  const syncChats = useCallback(() => {
    if (typeof window === 'undefined') return;
    const stored = getAllChats();
    setChats(stored);
    setCurrentChat((prev) => {
      if (prev) {
        const refreshed = stored.find((chat) => chat.id === prev.id);
        if (refreshed) return refreshed;
      }
      return stored[0] ?? null;
    });
  }, []);

  // Restore persisted backend session so uploaded-PDF context survives refreshes.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(BACKEND_SESSION_STORAGE_KEY);
    if (stored) setSessionId(stored);
  }, []);

  // Load persisted chats on mount.
  useEffect(() => {
    syncChats();
  }, [syncChats]);

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

    // Resolve or create the active chat
    const isFirstMessage = !currentChat || currentChat.messages.length === 0;
    const smartTitle = generateChatTitle(text);
    const activeChat = currentChat ?? createChat(smartTitle);

    if (!currentChat) {
      syncChats();
      setCurrentChat(activeChat);
      setChats(getAllChats());
    }

    // If this is the first message of an existing chat, apply the smart title now
    if (isFirstMessage && currentChat) {
      updateChat(currentChat.id, { title: smartTitle });
    }

    const userMsg = makeMessage('user', text);
    setCurrentChat((prev) => {
      const base = prev ?? activeChat;
      return {
        ...base,
        title: isFirstMessage ? smartTitle : base.title,
        messages: [...base.messages, userMsg],
      };
    });
    setIsLoading(true);
    setError(null);

    try {
      const res: ChatResponse = await sendMessage({
        message:    text,
        session_id: sessionId,   // null on first message → server creates one
      });

      const assistantMsg = makeMessage('assistant', res.response);

      // Build the full messages list with both user and assistant messages
      // (Note: userMsg was already added to React state above)
      const finalMessages = [
        ...activeChat.messages.filter((m) => m.id !== userMsg.id && m.id !== assistantMsg.id),
        userMsg,
        assistantMsg,
      ] as StoredMessage[];

      // Update React state with the complete messages
      setCurrentChat((prev) => {
        const base = prev ?? activeChat;
        return { ...base, messages: finalMessages };
      });

      // Persist to localStorage immediately (don't rely on React state which is async)
      updateChat(activeChat.id, { title: activeChat.title, messages: finalMessages });
      syncChats();

      // Store the session_id echoed by the server.
      if (res.session_id && res.session_id !== sessionId) {
        setSessionId(res.session_id);
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, [currentChat, isLoading, sessionId, syncChats]);

  const createNewChat = useCallback(() => {
    const chat = createChat('New Chat');
    syncChats();
    setCurrentChat(chat);
    setSessionId(null);
    setError(null);
  }, [syncChats]);

  const switchChat = useCallback((chatId: string) => {
    const chat = getAllChats().find((item) => item.id === chatId) ?? null;
    setCurrentChat(chat);
    setError(null);
  }, []);

  const deleteCurrentChat = useCallback(() => {
    if (!currentChat) return;
    deleteChat(currentChat.id);
    syncChats();
    setCurrentChat(getAllChats()[0] ?? null);
  }, [currentChat, syncChats]);

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
    if (currentChat) clearChat(currentChat.id);
    const newChat = createChat('New Chat');
    syncChats();
    setCurrentChat(newChat);
    setSessionId(null);   // backend will assign a new session on next message
    setError(null);
  }, [currentChat, syncChats]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        isLoading,
        error,
        sessionId,
        sendChatMessage,
        createNewChat,
        switchChat,
        deleteCurrentChat,
        clearCurrentChat,
        clearError,
        handleUpload,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
