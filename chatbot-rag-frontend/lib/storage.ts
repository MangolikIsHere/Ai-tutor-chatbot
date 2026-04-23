import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
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

const STORAGE_KEY = 'chat_sessions';

export function generateSessionId(): string {
  return uuidv4();
}

function saveChats(chats: Chat[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

function normalizeChat(chat: any): Chat {
  return {
    id: chat.id ?? generateSessionId(),
    title: chat.title ?? 'New Chat',
    messages: Array.isArray(chat.messages) ? chat.messages : [],
    createdAt: chat.createdAt ?? Date.now(),
    updatedAt: chat.updatedAt ?? Date.now(),
    sessionId: chat.sessionId ?? null,
  };
}

export function getAllChats(): Chat[] {
  if (typeof window === 'undefined') return [];

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const chats = parsed.map(normalizeChat);
    saveChats(chats); // auto-migrate old stored shape
    return chats.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function getChatById(id: string): Chat | null {
  return getAllChats().find(chat => chat.id === id) ?? null;
}

export function createChat(title: string = 'New Chat'): Chat {
  const chat: Chat = {
    id: generateSessionId(),
    title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    sessionId: null,
  };

  const chats = getAllChats();
  chats.unshift(chat);
  saveChats(chats);
  return chat;
}

export function updateChat(id: string, updates: Partial<Chat>): Chat | null {
  const chats = getAllChats();
  const index = chats.findIndex(chat => chat.id === id);
  if (index === -1) return null;

  chats[index] = {
    ...chats[index],
    ...updates,
    updatedAt: Date.now(),
  };

  saveChats(chats);
  return chats[index];
}

export function addMessageToChat(chatId: string, message: Message): Chat | null {
  const chat = getChatById(chatId);
  if (!chat) return null;

  return updateChat(chatId, {
    messages: [...chat.messages, message],
  });
}

export function clearChat(id: string): Chat | null {
  return updateChat(id, {
    messages: [],
    sessionId: null,
    title: 'New Chat',
  });
}

export function deleteChat(id: string): boolean {
  const chats = getAllChats();
  const filtered = chats.filter(chat => chat.id !== id);
  if (filtered.length === chats.length) return false;

  saveChats(filtered);
  return true;
}

export function generateChatTitle(message: string): string {
  const text = message.trim();
  if (!text) return 'New Chat';

  const words = text
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);

  const title = words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return title.length > 42 ? title.slice(0, 39) + '…' : title;
}
