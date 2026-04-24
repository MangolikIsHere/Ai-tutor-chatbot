'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Sparkles,
} from 'lucide-react'

import { auth } from '@/lib/firebase'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

export default function AuthPage() {
  const router = useRouter()

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const redirectHome = () => router.push('/')

  const handleGoogle = async () => {
    try {
      setLoading(true)
      setError('')

      await signInWithPopup(
        auth,
        new GoogleAuthProvider()
      )

      redirectHome()
    } catch (err: any) {
      setError(
        err?.message || 'Google login failed'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleEmail = async () => {
    try {
      setLoading(true)
      setError('')

      if (tab === 'signup') {
        if (!name.trim()) {
          setError('Please enter your full name')
          setLoading(false)
          return
        }

        const result =
          await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          )

        await updateProfile(result.user, {
          displayName: name.trim(),
        })
      } else {
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        )
      }

      redirectHome()
    } catch (err: any) {
      setError(
        err?.message ||
          'Authentication failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border shadow-2xl rounded-3xl overflow-hidden">

        {/* Header */}
        <CardHeader className="space-y-5 pb-4">

          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl btn-gradient flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">
              NeuralChat
            </CardTitle>

            <CardDescription className="text-sm">
              {tab === 'signin'
                ? 'Sign in to continue'
                : 'Create your premium account'}
            </CardDescription>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant={
                tab === 'signin'
                  ? 'default'
                  : 'outline'
              }
              className="rounded-xl"
              onClick={() =>
                setTab('signin')
              }
            >
              Sign In
            </Button>

            <Button
              variant={
                tab === 'signup'
                  ? 'default'
                  : 'outline'
              }
              className="rounded-xl"
              onClick={() =>
                setTab('signup')
              }
            >
              Sign Up
            </Button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-4">

          {/* Google */}
          <Button
            className="w-full rounded-xl h-11"
            onClick={handleGoogle}
            disabled={loading}
          >
            Continue with Google
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            or continue with email
          </div>

          {/* Name */}
          {tab === 'signup' && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-4 w-4 opacity-60" />

              <Input
                placeholder="Full name"
                className="pl-9 h-11 rounded-xl"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
              />
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-4 w-4 opacity-60" />

            <Input
              type="email"
              placeholder="Email address"
              className="pl-9 h-11 rounded-xl"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-4 w-4 opacity-60" />

            <Input
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              placeholder="Password"
              className="pl-9 pr-10 h-11 rounded-xl"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />

            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 opacity-70" />
              ) : (
                <Eye className="h-4 w-4 opacity-70" />
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-500 rounded-xl bg-red-500/10 px-3 py-2">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            className="w-full h-11 rounded-xl btn-gradient text-white"
            onClick={handleEmail}
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : tab === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-1">
            Secure authentication powered by Firebase
          </p>

        </CardContent>
      </Card>
    </main>
  )
}