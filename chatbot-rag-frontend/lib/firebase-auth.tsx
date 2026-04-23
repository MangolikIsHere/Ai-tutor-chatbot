'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'

import { auth } from './firebase'

const AuthContext = createContext<any>(null)

export function FirebaseAuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: User | null) => {
      setUser(u)
      setLoading(false)
    })

    return () => unsub()
  }, [])

  const login = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider())
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useFirebaseAuth = () => {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useFirebaseAuth must be used inside FirebaseAuthProvider')
  }

  return ctx
}