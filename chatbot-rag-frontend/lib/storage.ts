import { v4 as uuidv4 } from 'uuid'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  sessionId?: string | null
}

function getStorageKey(): string {
  if (typeof window === 'undefined') return 'chat_guest'

  const raw = localStorage.getItem('neural_user')

  if (!raw) return 'chat_guest'

  try {
    const user = JSON.parse(raw)

    const uid =
      user.email
        ?.toLowerCase()
        ?.replace(/[^a-z0-9]/g, '_') || 'guest'

    return `chat_${uid}`
  } catch {
    return 'chat_guest'
  }
}

export function generateSessionId() {
  return uuidv4()
}

function saveChats(chats: Chat[]) {
  if (typeof window === 'undefined') return

  localStorage.setItem(
    getStorageKey(),
    JSON.stringify(chats)
  )
}

export function getAllChats(): Chat[] {
  if (typeof window === 'undefined') return []

  const raw = localStorage.getItem(getStorageKey())

  if (!raw) return []

  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function createChat(
  title = 'New Chat'
): Chat {
  const chat: Chat = {
    id: generateSessionId(),
    title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    sessionId: null,
  }

  const chats = getAllChats()
  chats.unshift(chat)
  saveChats(chats)

  return chat
}

export function updateChat(
  id: string,
  updates: Partial<Chat>
) {
  const chats = getAllChats()

  const index = chats.findIndex(
    (chat) => chat.id === id
  )

  if (index === -1) return null

  chats[index] = {
    ...chats[index],
    ...updates,
    updatedAt: Date.now(),
  }

  saveChats(chats)

  return chats[index]
}

export function deleteChat(id: string) {
  const chats = getAllChats().filter(
    (chat) => chat.id !== id
  )

  saveChats(chats)
}

export function clearChat(id: string) {
  return updateChat(id, {
    title: 'New Chat',
    messages: [],
    sessionId: null,
  })
}

export function generateChatTitle(
  message: string
) {
  const words = message
    .trim()
    .split(/\s+/)
    .slice(0, 4)

  return words.join(' ') || 'New Chat'
}