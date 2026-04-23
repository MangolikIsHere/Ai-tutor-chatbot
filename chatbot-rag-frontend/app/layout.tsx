import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import { ThemeProvider } from '@/components/theme-provider'
import { FirebaseAuthProvider } from '@/lib/firebase-auth'
import { ChatProvider } from '@/lib/chat-context'

import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NeuralChat',
  description: 'AI Assistant'
}

export const viewport: Viewport = {
  themeColor: '#0f0f14'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <FirebaseAuthProvider>
          <ThemeProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </ThemeProvider>
        </FirebaseAuthProvider>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}