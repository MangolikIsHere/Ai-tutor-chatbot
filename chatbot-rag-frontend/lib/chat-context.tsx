'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { sendMessage, uploadPDF, type ChatResponse, type UploadResponse } from '@/lib/api';
import {
  clearChat,
  createChat,
  deleteChat,
  generateChatTitle,
  getAllChats,
  updateChat,
} from '@/lib/storage';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  sessionId?: string | null;
}

interface ChatContextValue {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  sendChatMessage: (text: string) => Promise<void>;
  createNewChat: () => void;
  switchChat: (chatId: string) => void;
  deleteCurrentChat: () => void;
  clearCurrentChat: () => void;
  clearError: () => void;
  handleUpload: (file: File, onProgress?: (pct: number) => void) => Promise<UploadResponse>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used inside ChatProvider');
  return ctx;
}

function makeMessage(role: Message['role'], content: string): Message {
  return { id: crypto.randomUUID(), role, content, timestamp: Date.now() };
}

function buildRequestWithLocalMemory(currentText: string, history: Message[]): string {
  const trimmed = currentText.trim();
  if (!trimmed || history.length === 0) return trimmed;

  const recent = history.slice(-8);
  const memoryLines = recent.map((m) => {
    const speaker = m.role === 'user' ? 'User' : 'Assistant';
    const content = m.content.replace(/\s+/g, ' ').trim();
    return `${speaker}: ${content}`;
  });

  // Keep payload under backend's 2000-char request limit.
  const header = 'Use the recent conversation context below as memory when answering.\n';
  const contextHeader = 'Recent context:\n';
  const currentHeader = '\n\nCurrent user message:\n';

  let contextBlock = memoryLines.join('\n');
  let composed = `${header}${contextHeader}${contextBlock}${currentHeader}${trimmed}`;

  if (composed.length <= 1900) return composed;

  // Trim oldest context lines first if too long.
  while (memoryLines.length > 1 && composed.length > 1900) {
    memoryLines.shift();
    contextBlock = memoryLines.join('\n');
    composed = `${header}${contextHeader}${contextBlock}${currentHeader}${trimmed}`;
  }

  if (composed.length <= 1900) return composed;
  return trimmed.slice(0, 1900);
}

function syncStoredChats(setChats: (v: Chat[]) => void, setCurrentChat: (v: Chat | null) => void, currentId?: string) {
  const stored = getAllChats() as Chat[];
  setChats(stored);
  if (currentId) {
    setCurrentChat(stored.find(c => c.id === currentId) ?? stored[0] ?? null);
  } else {
    setCurrentChat(stored[0] ?? null);
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getAllChats() as Chat[];
    if (stored.length > 0) {
      setChats(stored);
      setCurrentChat(stored[0]);
    } else {
      const chat = createChat('New Chat') as Chat;
      setChats([chat]);
      setCurrentChat(chat);
    }
  }, []);

  const createNewChat = useCallback(() => {
    const chat = createChat('New Chat') as Chat;
    syncStoredChats(setChats, setCurrentChat, chat.id);
    setError(null);
  }, []);

  const switchChat = useCallback((chatId: string) => {
    const chat = (getAllChats() as Chat[]).find(c => c.id === chatId) ?? null;
    setCurrentChat(chat);
    setError(null);
  }, []);

  const sendChatMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    let active = currentChat;
    if (!active) {
      active = createChat('New Chat') as Chat;
      setCurrentChat(active);
      setChats(getAllChats() as Chat[]);
    }

    const first = active.messages.length === 0;
    const title = first ? generateChatTitle(text) : active.title;
    const userMsg = makeMessage('user', text);

    // Always keep a deterministic session id per chat so memory works
    // from the very first turn, even if the backend doesn't echo one.
    const stableSessionId = active.sessionId ?? active.id;

    const optimistic: Chat = {
      ...active,
      title,
      sessionId: stableSessionId,
      messages: [...active.messages, userMsg],
    };

    setCurrentChat(optimistic);
    setIsLoading(true);
    setError(null);

    try {
      const requestMessage = buildRequestWithLocalMemory(text, active.messages);

      const res: ChatResponse = await sendMessage({
        message: requestMessage,
        session_id: stableSessionId,
      });

      const assistantMsg = makeMessage('assistant', res.response);
      const finalChat: Chat = {
        ...optimistic,
        sessionId: res.session_id || stableSessionId,
        messages: [...optimistic.messages, assistantMsg],
      };

      updateChat(active.id, finalChat);
      syncStoredChats(setChats, setCurrentChat, active.id);
    } catch (err: any) {
      setCurrentChat(active);
      setError(err?.message ?? 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, [currentChat, isLoading]);

  const handleUpload = useCallback(async (file: File, onProgress?: (pct: number) => void) => {
    if (!currentChat) throw new Error('No active chat');
    const result = await uploadPDF(file, onProgress);
    updateChat(currentChat.id, { sessionId: result.session_id });
    syncStoredChats(setChats, setCurrentChat, currentChat.id);
    return result;
  }, [currentChat]);

  const clearCurrentChat = useCallback(() => {
    if (!currentChat) return;
    clearChat(currentChat.id);
    updateChat(currentChat.id, { title: 'New Chat', sessionId: null });
    syncStoredChats(setChats, setCurrentChat, currentChat.id);
    setError(null);
  }, [currentChat]);

  const deleteCurrentChat = useCallback(() => {
    if (!currentChat) return;
    deleteChat(currentChat.id);
    const remaining = getAllChats() as Chat[];
    if (remaining.length === 0) {
      const chat = createChat('New Chat') as Chat;
      setChats([chat]);
      setCurrentChat(chat);
    } else {
      setChats(remaining);
      setCurrentChat(remaining[0]);
    }
    setError(null);
  }, [currentChat]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <ChatContext.Provider value={{ chats, currentChat, isLoading, error, sendChatMessage, createNewChat, switchChat, deleteCurrentChat, clearCurrentChat, clearError, handleUpload }}>
      {children}
    </ChatContext.Provider>
  );
}
