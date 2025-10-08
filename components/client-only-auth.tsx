"use client"

import dynamic from "next/dynamic"
import type React from "react"

const ClientOnlyAuthProvider = dynamic(
  () => import("@/contexts/auth-context").then((mod) => ({ default: mod.AuthProvider })),
  {
    ssr: false,
    loading: () => <div>Loading authentication...</div>,
  },
)

export function ClientOnlyAuth({ children }: { children: React.ReactNode }) {
  return <ClientOnlyAuthProvider>{children}</ClientOnlyAuthProvider>
}
