import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import { ThemeProvider } from '@/components/theme-provider'
import { FirebaseAuthProvider } from '@/lib/firebase-auth'
import { ChatProvider } from '@/lib/chat-context'

import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'NeuralChat',
    template: '%s • NeuralChat',
  },

  description:
    'Premium AI workspace powered by NeuralChat.',

  applicationName: 'NeuralChat',

  keywords: [
    'AI Chat',
    'Chatbot',
    'NeuralChat',
    'Assistant',
    'Productivity',
    'RAG AI',
  ],

  authors: [
    {
      name: 'NeuralChat',
    },
  ],

  creator: 'NeuralChat',
  publisher: 'NeuralChat',

  metadataBase: new URL(
    'https://yourdomain.com'
  ),

  openGraph: {
    title: 'NeuralChat',
    description:
      'Premium AI workspace powered by NeuralChat.',
    siteName: 'NeuralChat',
    type: 'website',
    locale: 'en_US',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'NeuralChat',
    description:
      'Premium AI workspace powered by NeuralChat.',
  },

  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f0f14',
  colorScheme: 'dark light',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="font-sans antialiased min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20 selection:text-foreground"
      >
        <FirebaseAuthProvider>
          <ThemeProvider>
            <ChatProvider>
              <div className="relative min-h-screen w-full">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute top-0 left-1/4 h-[420px] w-[420px] rounded-full blur-3xl opacity-[0.05] btn-gradient" />

                  <div className="absolute bottom-0 right-1/4 h-[360px] w-[360px] rounded-full blur-3xl opacity-[0.04] btn-gradient" />
                </div>

                <main className="relative z-10 min-h-screen">
                  {children}
                </main>
              </div>
            </ChatProvider>
          </ThemeProvider>
        </FirebaseAuthProvider>

        {process.env.NODE_ENV ===
          'production' && (
          <Analytics />
        )}
      </body>
    </html>
  )
}