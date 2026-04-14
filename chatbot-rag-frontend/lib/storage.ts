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
}

const STORAGE_KEY = 'chat_sessions';
const SESSION_ID_KEY = 'current_session_id';

export function generateSessionId(): string {
  return uuidv4();
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId();
  
  const stored = localStorage.getItem(SESSION_ID_KEY);
  if (stored) return stored;
  
  const newId = generateSessionId();
  localStorage.setItem(SESSION_ID_KEY, newId);
  return newId;
}

export function getAllChats(): Chat[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getChatById(id: string): Chat | null {
  const chats = getAllChats();
  return chats.find(chat => chat.id === id) || null;
}

export function createChat(title: string = 'New Chat'): Chat {
  const chat: Chat = {
    id: generateSessionId(),
    title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  const chats = getAllChats();
  chats.unshift(chat);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  
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
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  return chats[index];
}

export function addMessageToChat(chatId: string, message: Message): Chat | null {
  const chat = getChatById(chatId);
  if (!chat) return null;
  
  chat.messages.push(message);
  return updateChat(chatId, { messages: chat.messages });
}

export function deleteChat(id: string): boolean {
  const chats = getAllChats();
  const filtered = chats.filter(chat => chat.id !== id);
  
  if (filtered.length === chats.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function clearChat(id: string): Chat | null {
  return updateChat(id, { messages: [] });
}

export function generateChatTitle(message: string): string {
  const words = message.split(' ').slice(0, 5);
  return words.join(' ') + (message.split(' ').length > 5 ? '...' : '');
}
