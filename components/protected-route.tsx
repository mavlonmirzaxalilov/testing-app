"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  // Auth holati tekshirib bo‘linganini belgilaymiz
  useEffect(() => {
    if (!loading) setAuthChecked(true)
  }, [loading])

  useEffect(() => {
    if (!authChecked) return // hali tekshirilmagan

    if (!user) {
      router.replace("/auth/signin")
      return
    }

    if (adminOnly && user.role !== "admin") {
      router.replace("/")
      return
    }
  }, [authChecked, user, adminOnly, router])

  if (!authChecked) {
    // Yuklanish vaqtida loader ko‘rsatamiz
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Auth tekshirilgach, user yo‘q bo‘lsa, redirect bo‘ladi (return null)
  if (!user || (adminOnly && user.role !== "admin")) {
    return null
  }

  return <>{children}</>
}
