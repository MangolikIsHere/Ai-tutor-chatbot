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

import { db } from '@/lib/firebase'
import { useFirebaseAuth } from '@/lib/firebase-auth'

import {
  createChat,
  deleteChat,
  clearChat,
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
  isLoading: boolean
  error: string | null

  createNewChat: () => void
  switchChat: (id: string) => void
  deleteCurrentChat: () => void
  clearCurrentChat: () => void
  sendChatMessage: (
    text: string
  ) => Promise<void>
}

const ChatContext =
  createContext<ChatContextValue | null>(
    null
  )

export function useChatContext() {
  const ctx = useContext(ChatContext)

  if (!ctx)
    throw new Error(
      'useChatContext must be used inside ChatProvider'
    )

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
    if (!user) {
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
      snap.docs.map((d) => d.data() as Chat)

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
    if (!user) {
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
    }, [user])

  const switchChat =
    useCallback(
      (id: string) => {
        const found =
          chats.find(
            (c) => c.id === id
          ) || null

        setCurrentChat(found)
      },
      [chats]
    )

  const deleteCurrentChat =
    useCallback(async () => {
      if (!currentChat) return

      if (user) {
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
        deleteChat(currentChat.id)
      }

      loadChats()
    }, [currentChat, user])

  const clearCurrentChat =
    useCallback(async () => {
      if (!currentChat) return

      const cleared = {
        ...currentChat,
        title: 'New Chat',
        messages: [],
        sessionId: null,
      }

      await saveChat(cleared)
      loadChats()
    }, [currentChat, user])

  const sendChatMessage =
    useCallback(
      async (text: string) => {
        if (
          !currentChat ||
          !text.trim()
        )
          return

        setIsLoading(true)

        const userMsg =
          makeMessage(
            'user',
            text
          )

        const optimistic = {
          ...currentChat,
          title:
            currentChat.messages
              .length === 0
              ? generateChatTitle(
                  text
                )
              : currentChat.title,
          messages: [
            ...currentChat.messages,
            userMsg,
          ],
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

          const finalChat = {
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

          loadChats()
        } catch {
          setError(
            'Message failed.'
          )
        } finally {
          setIsLoading(false)
        }
      },
      [currentChat, user]
    )

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        isLoading,
        error,
        createNewChat,
        switchChat,
        deleteCurrentChat,
        clearCurrentChat,
        sendChatMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}