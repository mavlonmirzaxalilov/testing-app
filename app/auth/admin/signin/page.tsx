'use client'
export const dynamic = 'force-dynamic'
import type React from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { signInWithEmailAndPasswordExtended } from '@/lib/appwrite'
import { Shield } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminSignInPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const { signIn } = useAuth()
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			const userData = await signInWithEmailAndPasswordExtended(email, password)

			if (userData.role !== 'admin') {
				setError("Sizda admin huquqlari yo'q")
				return
			}

			await signIn(email, password)
			router.push('/admin')
		} catch (err) {
			setError("Email yoki parol noto'g'ri")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='container mx-auto px-4 py-16'>
			<div className='max-w-md mx-auto'>
				<div className='text-center mb-8'>
					<Shield className='h-12 w-12 text-red-600 mx-auto mb-4' />
					<h1 className='text-2xl font-bold text-red-600'>Admin Paneli</h1>
					<p className='text-muted-foreground'>Administrator sifatida kirish</p>
				</div>

				<Card className='border-red-200'>
					<CardHeader className='bg-red-50'>
						<CardTitle className='text-red-700'>Admin Kirish</CardTitle>
						<CardDescription>
							Admin email va parolingizni kiriting
						</CardDescription>
					</CardHeader>
					<CardContent className='pt-6'>
						<form onSubmit={handleSubmit} className='space-y-4'>
							{error && (
								<Alert variant='destructive'>
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<div className='space-y-2'>
								<Label htmlFor='email'>Admin Email</Label>
								<Input
									id='email'
									type='email'
									value={email}
									onChange={e => setEmail(e.target.value)}
									required
									placeholder='admin@example.com'
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='password'>Admin Parol</Label>
								<Input
									id='password'
									type='password'
									value={password}
									onChange={e => setPassword(e.target.value)}
									required
									placeholder='Admin parolingizni kiriting'
								/>
							</div>

							<Button
								type='submit'
								className='w-full bg-red-600 hover:bg-red-700'
								disabled={loading}
							>
								{loading ? 'Tekshirilmoqda...' : 'Admin sifatida kirish'}
							</Button>
						</form>

						<div className='mt-6 text-center'>
							<p className='text-sm text-muted-foreground'>
								Oddiy foydalanuvchi sifatida kirmoqchimisiz?{' '}
								<Link
									href='/auth/signin'
									className='text-primary hover:underline'
								>
									Bu yerga bosing
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
