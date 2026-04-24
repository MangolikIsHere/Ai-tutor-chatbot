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

import { auth } from './firebase'
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

function saveUserToLocal(
  user: User
) {
  if (typeof window === 'undefined')
    return

  localStorage.setItem(
    'neural_user',
    JSON.stringify({
      uid: user.uid,
      email: user.email || '',
      displayName:
        user.displayName || '',
      photoURL:
        user.photoURL || '',
    })
  )
}

function clearLocalUser() {
  if (typeof window === 'undefined')
    return

  localStorage.removeItem(
    'neural_user'
  )
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
    const unsub =
      onAuthStateChanged(
        auth,
        (
          currentUser:
            | User
            | null
        ) => {
          setUser(currentUser)

          if (currentUser) {
            setStoredAuthUser({
              email:
                currentUser.email ||
                '',
              displayName:
                currentUser.displayName ||
                '',
              photoURL:
                currentUser.photoURL ||
                '',
            })

            saveUserToLocal(
              currentUser
            )
          } else {
            setStoredAuthUser(
              null
            )

            clearLocalUser()
          }

          setLoading(false)
        }
      )

    return () => unsub()
  }, [])

  const login =
    async () => {
      await signInWithPopup(
        auth,
        new GoogleAuthProvider()
      )
    }

  const logout =
    async () => {
      clearLocalUser()
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