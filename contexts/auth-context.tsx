"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  signInWithEmailAndPasswordExtended,
  createUserWithEmailAndPasswordExtended,
  signOutUser,
  getUserData,
  type User,
} from "@/lib/appwrite"
import { account } from "@/lib/appwrite-client"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
  ) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentAccount = await account.get()
        if (currentAccount) {
          const userData = await getUserData(currentAccount.$id)
          setUser(userData)
        }
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string) => {
    const userData = await signInWithEmailAndPasswordExtended(email, password)
    setUser(userData)
    router.push("/dashboard")
  }

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
  ) => {
    const userData = await createUserWithEmailAndPasswordExtended(
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
    )
    setUser(userData)
    router.push("/dashboard")
  }

  // ✅ TUZATILDI: finally bloki — xato bo'lsa ham user tozalanadi va redirect ishlaydi
  const logout = async () => {
    try {
      await signOutUser()
    } catch (error) {
      console.warn('Logout xatosi:', error)
    } finally {
      setUser(null)
      router.push("/")
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
