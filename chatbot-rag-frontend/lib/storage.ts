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

// ─── Smart auto-title (ChatGPT-style) ────────────────────────────────────────
// Suffix hints to append based on topic detected
const SUFFIX_MAP: Array<[RegExp, string]> = [
  [/\b(explain|what is|what are|describe|define|tell me about)\b/i, 'Explained'],
  [/\b(how to|how do|how does|how can|steps to|guide|tutorial)\b/i, 'Guide'],
  [/\b(interview|prep|prepare|crack|ace)\b/i, 'Prep'],
  [/\b(write|create|generate|make|build|implement|code|program)\b/i, 'Implementation'],
  [/\b(difference|vs|versus|compare|comparison|between)\b/i, 'Comparison'],
  [/\b(example|examples|demo|show me)\b/i, 'Examples'],
  [/\b(debug|fix|error|issue|problem|bug|wrong)\b/i, 'Debugging'],
  [/\b(best|top|list|recommend)\b/i, 'Overview'],
];

// Common filler words to strip before building title
const FILLER = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'it', 'its',
  'and', 'or', 'but', 'so', 'yet', 'for', 'nor', 'at', 'by', 'in',
  'of', 'on', 'to', 'up', 'as', 'if', 'do', 'can', 'please',
  'help', 'with', 'from', 'that', 'this', 'some', 'about', 'get',
  'just', 'also', 'very', 'too', 'has', 'have', 'had', 'will', 'would',
  'should', 'could', 'would', 'might', 'may', 'shall',
]);

// Key topic words to always keep (override filler suppression)
const KEEP = new Set([
  'ml', 'ai', 'nlp', 'cnn', 'rnn', 'llm', 'gpt', 'sql', 'api',
]);

function toTitleCase(word: string): string {
  if (KEEP.has(word.toLowerCase())) return word.toUpperCase();
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function generateChatTitle(message: string): string {
  if (!message.trim()) return 'New Chat';

  // Detect suffix hint from the original message
  let suffix = '';
  for (const [pattern, hint] of SUFFIX_MAP) {
    if (pattern.test(message)) { suffix = hint; break; }
  }

  // Tokenise: strip punctuation, lowercase, split on whitespace
  const tokens = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  // Remove filler words (keep KEEP-listed acronyms)
  const meaningful = tokens.filter(
    (w) => !FILLER.has(w) || KEEP.has(w)
  );

  // Pick first 3-4 content words, then optionally append suffix
  const MAX_CONTENT = suffix ? 3 : 4;
  const contentWords = meaningful.slice(0, MAX_CONTENT).map(toTitleCase);

  if (contentWords.length === 0) return 'New Chat';

  const title = suffix
    ? `${contentWords.join(' ')} ${suffix}`
    : contentWords.join(' ');

  // Hard cap: 5 words / 42 chars
  const words = title.split(' ').slice(0, 5);
  const result = words.join(' ');
  return result.length > 42 ? result.slice(0, 39).trimEnd() + '…' : result;
}
