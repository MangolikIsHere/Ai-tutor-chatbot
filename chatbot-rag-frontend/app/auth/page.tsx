'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
} from 'lucide-react'

import { auth } from '@/lib/firebase'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
      await signInWithPopup(auth, new GoogleAuthProvider())
      redirectHome()
    } catch (err: any) {
      setError(err.message || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleEmail = async () => {
    try {
      setLoading(true)
      setError('')

      if (tab === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }

      redirectHome()
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md border-border shadow-xl">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl text-center">
            NeuralChat
          </CardTitle>

          <CardDescription className="text-center">
            {tab === 'signin'
              ? 'Sign in to continue'
              : 'Create your account'}
          </CardDescription>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant={tab === 'signin' ? 'default' : 'outline'}
              onClick={() => setTab('signin')}
            >
              Sign In
            </Button>

            <Button
              variant={tab === 'signup' ? 'default' : 'outline'}
              onClick={() => setTab('signup')}
            >
              Sign Up
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            Continue with Google
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            or continue with email
          </div>

          {tab === 'signup' && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-4 w-4 opacity-60" />
              <Input
                placeholder="Full name"
                className="pl-9"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-4 w-4 opacity-60" />
            <Input
              type="email"
              placeholder="Email"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-4 w-4 opacity-60" />

            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="pl-9 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 opacity-70" />
              ) : (
                <Eye className="h-4 w-4 opacity-70" />
              )}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            className="w-full"
            onClick={handleEmail}
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : tab === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}