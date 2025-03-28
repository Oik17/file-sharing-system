// src/components/ClientBody.tsx
"use client"

import { AuthProvider } from '@/context/AuthContext'

export default function ClientBody({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
