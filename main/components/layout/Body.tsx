'use client'

import { SessionProvider } from "@/components/providers/SessionProvider"
import { useEffect } from "react"

interface BodyProps {
  children: React.ReactNode
  className?: string
}

export function Body({ children, className }: BodyProps) {
  useEffect(() => {
    // Add any client-side only classes here
    document.body.classList.add('vsc-initialized')
  }, [])

  return (
    <body className={`antialiased ${className || ''}`}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </body>
  )
} 