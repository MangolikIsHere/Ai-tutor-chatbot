'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  Chat,
  Message,
  getAllChats,
  getChatById,
  createChat,
  addMessageToChat,
  deleteChat,
  clearChat,
  getOrCreateSessionId,
  generateSessionId,
  generateChatTitle,
} from './storage';
import { sendMessage, APIError } from './api';

interface ChatContextType {
  // Chat state
  chats: Chat[];
  currentChat: Chat | null;
  sessionId: string;

  // Message state
  isLoading: boolean;
  error: string | null;

  // Actions
  createNewChat: () => void;
  switchChat: (chatId: string) => void;
  deleteCurrentChat: () => void;
  clearCurrentChat: () => void;
  sendChatMessage: (content: string) => Promise<void>;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);

    const storedChats = getAllChats();
    setChats(storedChats);

    if (storedChats.length > 0) {
      setCurrentChat(storedChats[0]);
    } else {
      const newChat = createChat();
      setChats([newChat]);
      setCurrentChat(newChat);
    }
  }, []);

  const createNewChat = useCallback(() => {
    const newChat = createChat();
    setChats(prev => [newChat, ...prev]);
    setCurrentChat(newChat);
    setError(null);
  }, []);

  const switchChat = useCallback((chatId: string) => {
    const chat = getChatById(chatId);
    if (chat) {
      setCurrentChat(chat);
      setError(null);
    }
  }, []);

  const deleteCurrentChat = useCallback(() => {
    if (!currentChat) return;

    const success = deleteChat(currentChat.id);
    if (success) {
      const remaining = getAllChats();
      setChats(remaining);

      if (remaining.length > 0) {
        setCurrentChat(remaining[0]);
      } else {
        const newChat = createChat();
        setChats([newChat]);
        setCurrentChat(newChat);
      }
      setError(null);
    }
  }, [currentChat]);

  const clearCurrentChat = useCallback(() => {
    if (!currentChat) return;

    const cleared = clearChat(currentChat.id);
    if (cleared) {
      setCurrentChat(cleared);
      setError(null);
    }
  }, [currentChat]);

  const sendChatMessage = useCallback(
    async (content: string) => {
      if (!currentChat || !sessionId || !content.trim()) return;

      setError(null);
      setIsLoading(true);

      try {
        // Add user message
        const userMessage: Message = {
          id: generateSessionId(),
          content: content.trim(),
          role: 'user',
          timestamp: Date.now(),
        };

        let updatedChat = addMessageToChat(currentChat.id, userMessage);
        if (updatedChat) {
          setCurrentChat(updatedChat);

          // Update title if it's the first message
          if (updatedChat.messages.length === 1) {
            const title = generateChatTitle(content);
            updatedChat = addMessageToChat(updatedChat.id, {
              id: generateSessionId(),
              content: '',
              role: 'user',
              timestamp: Date.now(),
            });
            if (updatedChat) {
              updatedChat.title = title;
              setCurrentChat(updatedChat);
            }
          }
        }

        // Call API
        const response = await sendMessage({
          message: content,
          session_id: sessionId,
        });

        // Add assistant message
        const assistantMessage: Message = {
          id: generateSessionId(),
          content: response.response,
          role: 'assistant',
          timestamp: Date.now(),
        };

        updatedChat = addMessageToChat(currentChat.id, assistantMessage);
        if (updatedChat) {
          setCurrentChat(updatedChat);
          setChats(prev =>
            prev.map(chat => (chat.id === updatedChat.id ? updatedChat : chat))
          );
        }
      } catch (err) {
        const apiError = err as APIError;
        setError(apiError.message);
      } finally {
        setIsLoading(false);
      }
    },
    [currentChat, sessionId]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: ChatContextType = {
    chats,
    currentChat,
    sessionId,
    isLoading,
    error,
    createNewChat,
    switchChat,
    deleteCurrentChat,
    clearCurrentChat,
    sendChatMessage,
    clearError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
