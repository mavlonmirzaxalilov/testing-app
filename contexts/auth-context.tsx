'use client'

import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import {
	getAuthInstance,
	type User,
	createUserWithEmailAndPasswordExtended,
	signInWithEmailAndPasswordExtended,
	signOutUser,
	getUserData,
} from '@/lib/firebase'

interface AuthContextType {
	user: User | null
	loading: boolean
	signIn: (email: string, password: string) => Promise<void>
	signUp: (
		email: string,
		password: string,
		firstName: string,
		lastName: string,
		phoneNumber: string
	) => Promise<void>
	signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const [isClient, setIsClient] = useState(false)

	useEffect(() => {
		setIsClient(true)
	}, [])

	useEffect(() => {
		if (!isClient) return

		let unsubscribe: (() => void) | undefined

		const initAuth = async () => {
			try {
				if (typeof window === 'undefined') {
					// console.log("[v0] Skipping auth init - not in browser")
					setLoading(false)
					return
				}

				// console.log("[v0] Initializing Firebase auth...")

				const auth = await getAuthInstance()

				if (!auth) {
					// console.log("[v0] Auth instance not available, skipping initialization")
					setLoading(false)
					return
				}

				const { onAuthStateChanged } = await import('firebase/auth')

				unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
					console.log(
						'[Auth] onAuthStateChanged ->',
						firebaseUser ? firebaseUser.email : 'no user'
					)

					try {
						if (firebaseUser) {
							const userData = await getUserData(firebaseUser.uid)
							console.log('[Auth] Firestore user data ->', userData)
							setUser(userData)
						} else {
							setUser(null)
						}
					} catch (error) {
						console.error('[Auth] getUserData error:', error)
						setUser(null)
					} finally {
						setLoading(false)
					}
				})

				// console.log("[v0] Auth listener attached successfully")
			} catch (error) {
				// console.error("[v0] Error initializing auth:", error)
				setLoading(false)
			}
		}

		const timer = setTimeout(initAuth, 100)

		return () => {
			clearTimeout(timer)
			if (unsubscribe) {
				console.log('[v0] Cleaning up auth listener')
				unsubscribe()
			}
		}
	}, [isClient])

	const signIn = async (email: string, password: string) => {
		if (!isClient) throw new Error('Auth not available - not on client')

		setLoading(true)
		try {
			// console.log("[v0] Attempting sign in...")
			const userData = await signInWithEmailAndPasswordExtended(email, password)
			setUser(userData)
			// console.log("[v0] Sign in successful")
			return userData // 🔑 bu joyni qo‘shdik
		} catch (error) {
			console.error('Sign in error:', error)
			throw error
		} finally {
			setLoading(false)
		}
	}

	const signUp = async (
		email: string,
		password: string,
		firstName: string,
		lastName: string,
		phoneNumber: string
	) => {
		if (!isClient) throw new Error('Auth not available - not on client')

		setLoading(true)
		try {
			// console.log("[v0] Attempting sign up...")
			const userData = await createUserWithEmailAndPasswordExtended(
				email,
				password,
				firstName,
				lastName,
				phoneNumber
			)
			setUser(userData)
			// console.log("[v0] Sign up successful")
		} catch (error) {
			console.error('Sign up error:', error)
			throw error
		} finally {
			setLoading(false)
		}
	}

	const signOut = async () => {
		if (!isClient) throw new Error('Auth not available - not on client')

		try {
			// console.log("[v0] Signing out...")
			await signOutUser()
			setUser(null)
			// console.log("[v0] Sign out successful")
		} catch (error) {
			console.error('Sign out error:', error)
			throw error
		}
	}

	const value = {
		user,
		loading,
		signIn,
		signUp,
		signOut,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
