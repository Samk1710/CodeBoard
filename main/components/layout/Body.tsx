'use client'

import { SessionProvider } from "@/components/providers/SessionProvider"

interface BodyProps {
  children: React.ReactNode
  className?: string
}

export function Body({ children, className }: BodyProps) {
  return (
    <body className={`antialiased ${className || ''}`}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </body>
  )
} 