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

function getStorageKey(): string {
  if (typeof window === 'undefined') return 'chat_sessions_guest';

  const raw = localStorage.getItem('neural_user');
  if (!raw) return 'chat_sessions_guest';

  try {
    const user = JSON.parse(raw);
    const uid =
      user.email?.toLowerCase()?.replace(/[^a-z0-9]/g, '_') ||
      'guest';

    return `chat_sessions_${uid}`;
  } catch {
    return 'chat_sessions_guest';
  }
}

export function generateSessionId(): string {
  return uuidv4();
}

function saveChats(chats: Chat[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(), JSON.stringify(chats));
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

  const raw = localStorage.getItem(getStorageKey());
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeChat)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function getChatById(id: string): Chat | null {
  return getAllChats().find((chat) => chat.id === id) ?? null;
}

export function createChat(title = 'New Chat'): Chat {
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

export function updateChat(
  id: string,
  updates: Partial<Chat>
): Chat | null {
  const chats = getAllChats();
  const index = chats.findIndex((chat) => chat.id === id);

  if (index === -1) return null;

  chats[index] = {
    ...chats[index],
    ...updates,
    updatedAt: Date.now(),
  };

  saveChats(chats);
  return chats[index];
}

export function clearChat(id: string): Chat | null {
  return updateChat(id, {
    messages: [],
    title: 'New Chat',
    sessionId: null,
  });
}

export function deleteChat(id: string): boolean {
  const chats = getAllChats();
  const filtered = chats.filter((chat) => chat.id !== id);

  saveChats(filtered);
  return true;
}

export function generateChatTitle(message: string): string {
  const words = message
    .trim()
    .split(/\s+/)
    .slice(0, 4);

  return words.join(' ') || 'New Chat';
}