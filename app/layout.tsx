import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: '600',
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'The Reladex',
  description: 'Your AI-powered relationship tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfair.variable} font-sans bg-[#f9f9f7] text-[#1a1a18]`}>
        {children}
      </body>
    </html>
  )
}
