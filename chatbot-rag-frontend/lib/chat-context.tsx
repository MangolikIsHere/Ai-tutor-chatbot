'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore'

import { getFirestoreDb } from '@/lib/firebase'
import { useFirebaseAuth } from '@/lib/firebase-auth'

import {
  createChat,
  deleteChat,
  updateChat,
  getAllChats,
  generateChatTitle,
} from '@/lib/storage'

import {
  sendMessage,
  type ChatResponse,
} from '@/lib/api'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
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

interface ChatContextValue {
  chats: Chat[]
  currentChat: Chat | null
  sessionId: string | null
  isLoading: boolean
  error: string | null

  createNewChat: () => void
  switchChat: (id: string) => void
  deleteCurrentChat: () => void
  clearCurrentChat: () => void
  sendChatMessage: (
    text: string
  ) => Promise<void>
  clearError: () => void
}

const ChatContext =
  createContext<ChatContextValue | null>(
    null
  )

export function useChatContext() {
  const ctx = useContext(ChatContext)

  if (!ctx) {
    throw new Error(
      'useChatContext must be used inside ChatProvider'
    )
  }

  return ctx
}

function makeMessage(
  role: 'user' | 'assistant',
  content: string
): Message {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: Date.now(),
  }
}

export function ChatProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useFirebaseAuth()

  const [chats, setChats] = useState<
    Chat[]
  >([])

  const [currentChat, setCurrentChat] =
    useState<Chat | null>(null)

  const [isLoading, setIsLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const loadChats = useCallback(async () => {
    const db = getFirestoreDb()

    if (!user || !db) {
      const local = getAllChats()

      if (local.length > 0) {
        setChats(local)
        setCurrentChat(local[0])
      } else {
        const chat =
          createChat('New Chat')

        setChats([chat])
        setCurrentChat(chat)
      }

      return
    }

    const snap = await getDocs(
      collection(
        db,
        'users',
        user.uid,
        'chats'
      )
    )

    const loaded: Chat[] =
      snap.docs.map(
        (d) => d.data() as Chat
      )

    loaded.sort(
      (a, b) =>
        b.updatedAt - a.updatedAt
    )

    if (loaded.length > 0) {
      setChats(loaded)
      setCurrentChat(loaded[0])
    } else {
      const chat: Chat = {
        id: crypto.randomUUID(),
        title: 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sessionId: null,
      }

      await setDoc(
        doc(
          db,
          'users',
          user.uid,
          'chats',
          chat.id
        ),
        chat
      )

      setChats([chat])
      setCurrentChat(chat)
    }
  }, [user])

  useEffect(() => {
    loadChats()
  }, [loadChats])

  async function saveChat(
    chat: Chat
  ) {
    const db = getFirestoreDb()

    if (!user || !db) {
      updateChat(chat.id, chat)
      return
    }

    await setDoc(
      doc(
        db,
        'users',
        user.uid,
        'chats',
        chat.id
      ),
      chat
    )
  }

  const createNewChat =
    useCallback(async () => {
      const chat: Chat = {
        id: crypto.randomUUID(),
        title: 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sessionId: null,
      }

      await saveChat(chat)

      setChats((prev) => [
        chat,
        ...prev,
      ])

      setCurrentChat(chat)
      setError(null)
    }, [user])

  const switchChat =
    useCallback(
      (id: string) => {
        const found =
          chats.find(
            (c) => c.id === id
          ) || null

        setCurrentChat(found)
        setError(null)
      },
      [chats]
    )

  const deleteCurrentChat =
    useCallback(async () => {
      if (!currentChat) return

      if (user) {
        const db =
          getFirestoreDb()

        if (!db) {
          deleteChat(
            currentChat.id
          )
          loadChats()
          return
        }

        await deleteDoc(
          doc(
            db,
            'users',
            user.uid,
            'chats',
            currentChat.id
          )
        )
      } else {
        deleteChat(
          currentChat.id
        )
      }

      await loadChats()
      setError(null)
    }, [
      currentChat,
      user,
      loadChats,
    ])

  const clearCurrentChat =
    useCallback(async () => {
      if (!currentChat) return

      const cleared: Chat = {
        ...currentChat,
        title: 'New Chat',
        messages: [],
        sessionId: null,
        updatedAt: Date.now(),
      }

      await saveChat(cleared)
      await loadChats()
      setError(null)
    }, [
      currentChat,
      loadChats,
      user,
    ])

  const clearError =
    useCallback(() => {
      setError(null)
    }, [])

  const sendChatMessage =
    useCallback(
      async (text: string) => {
        if (
          !currentChat ||
          !text.trim()
        )
          return

        setError(null)
        setIsLoading(true)

        const userMsg =
          makeMessage(
            'user',
            text
          )

        const optimistic: Chat =
          {
            ...currentChat,
            title:
              currentChat
                .messages
                .length === 0
                ? generateChatTitle(
                    text
                  )
                : currentChat.title,
            messages: [
              ...currentChat.messages,
              userMsg,
            ],
            updatedAt:
              Date.now(),
          }

        setCurrentChat(
          optimistic
        )

        try {
          const res: ChatResponse =
            await sendMessage({
              message: text,
              session_id:
                currentChat.id,
            })

          const botMsg =
            makeMessage(
              'assistant',
              res.response
            )

          const finalChat: Chat =
            {
              ...optimistic,
              messages: [
                ...optimistic.messages,
                botMsg,
              ],
              updatedAt:
                Date.now(),
            }

          await saveChat(
            finalChat
          )

          await loadChats()
        } catch {
          setError(
            'Message failed.'
          )
        } finally {
          setIsLoading(false)
        }
      },
      [
        currentChat,
        user,
        loadChats,
      ]
    )

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        sessionId:
          currentChat?.sessionId ??
          null,
        isLoading,
        error,
        createNewChat,
        switchChat,
        deleteCurrentChat,
        clearCurrentChat,
        sendChatMessage,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}