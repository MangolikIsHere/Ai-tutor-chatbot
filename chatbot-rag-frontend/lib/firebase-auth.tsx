'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'

import {
  getFirebaseAuth,
  isFirebaseConfigured,
} from './firebase'
import { setStoredAuthUser } from './auth-user'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext =
  createContext<AuthContextValue | null>(
    null
  )

function getManualName(
  email: string
): string {
  if (typeof window === 'undefined')
    return ''

  return (
    localStorage.getItem(
      `manual_name_${email.toLowerCase()}`
    ) || ''
  )
}

function saveNeuralUser(user: User) {
  if (typeof window === 'undefined')
    return

  let finalName =
    user.displayName?.trim() || ''

  if (!finalName && user.email) {
    finalName = getManualName(
      user.email
    )
  }

  localStorage.setItem(
    'neural_user',
    JSON.stringify({
      uid: user.uid,
      email: user.email || '',
      displayName: finalName,
      photoURL: user.photoURL || '',
    })
  )

  setStoredAuthUser({
    email: user.email || '',
    displayName: finalName,
    photoURL: user.photoURL || '',
  })
}

export function FirebaseAuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] =
    useState<User | null>(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    const auth = getFirebaseAuth()
    if (!auth) {
      setLoading(false)
      return
    }

    const unsub =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser)

          if (currentUser) {
            saveNeuralUser(
              currentUser
            )
          } else {
            localStorage.removeItem(
              'neural_user'
            )

            setStoredAuthUser(
              null
            )
          }

          setLoading(false)
        }
      )

    return () => unsub()
  }, [])

  const login =
    async () => {
      const auth = getFirebaseAuth()
      if (!auth) {
        throw new Error(
          'Firebase authentication is not configured.'
        )
      }

      await signInWithPopup(
        auth,
        new GoogleAuthProvider()
      )
    }

  const logout =
    async () => {
      localStorage.removeItem(
        'neural_user'
      )

      const auth = getFirebaseAuth()
      if (!auth) {
        return
      }

      await signOut(auth)
    }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useFirebaseAuth() {
  const ctx =
    useContext(AuthContext)

  if (!ctx) {
    throw new Error(
      'useFirebaseAuth must be used inside FirebaseAuthProvider'
    )
  }

  return ctx
}