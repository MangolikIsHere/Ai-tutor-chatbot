'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth'

import { auth } from '@/lib/firebase'

export default function AuthPage() {
  const router = useRouter()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogle() {
    try {
      setLoading(true)
      setError('')

      await signInWithPopup(
        auth,
        new GoogleAuthProvider()
      )

      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmail() {
    try {
      setLoading(true)
      setError('')

      if (mode === 'signup') {
        const result =
          await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          )

        const finalName = name.trim()

        await updateProfile(result.user, {
          displayName: finalName,
        })

        localStorage.setItem(
          `manual_name_${email.trim().toLowerCase()}`,
          finalName
        )
      } else {
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        )
      }

      router.push('/')
    } catch (err: any) {
      setError(
        err.message || 'Authentication failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 space-y-4 shadow-2xl">

        <h1 className="text-3xl font-bold text-center">
          NeuralChat
        </h1>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode('signin')}
            className={`h-10 rounded-xl ${
              mode === 'signin'
                ? 'bg-primary text-white'
                : 'bg-muted'
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() => setMode('signup')}
            className={`h-10 rounded-xl ${
              mode === 'signup'
                ? 'bg-primary text-white'
                : 'bg-muted'
            }`}
          >
            Sign Up
          </button>
        </div>

        {mode === 'signup' && (
          <input
            placeholder="Full Name"
            className="w-full h-11 px-4 rounded-xl bg-muted"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />
        )}

        <input
          placeholder="Email"
          className="w-full h-11 px-4 rounded-xl bg-muted"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full h-11 px-4 rounded-xl bg-muted"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleEmail}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-primary text-white"
        >
          {loading
            ? 'Please wait...'
            : mode === 'signin'
            ? 'Sign In'
            : 'Create Account'}
        </button>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-muted"
        >
          Continue with Google
        </button>
      </div>
    </main>
  )
}