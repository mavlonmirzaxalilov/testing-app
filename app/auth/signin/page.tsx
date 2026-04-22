'use client'
export const dynamic = 'force-dynamic'

import type React from 'react'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
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
			const user = await signIn(email, password)
			if (user.role === 'admin') {
				router.push('/auth/admin/signin')
				return
			}
			router.push('/')
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
					<BookOpen className='h-12 w-12 text-blue-600 mx-auto mb-4' />
					<h1 className='text-2xl font-bold text-blue-600'>
						Foydalanuvchi Paneli
					</h1>
					<p className='text-muted-foreground'>Hisobingizga kiring</p>
				</div>

				<Card className='border-blue-200 text-center'>
					<CardHeader className='bg-card border mx-4 p-2 border-blue-200 rounded-lg'>
						<CardTitle className='text-card-foreground'>Kirish</CardTitle>
						<CardDescription>Email va parolingizni kiriting</CardDescription>
					</CardHeader>

					<CardContent className='pt-6'>
						<form onSubmit={handleSubmit} className='space-y-4'>
							{error && (
								<Alert variant='destructive'>
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<div className='space-y-2'>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									type='email'
									value={email}
									onChange={e => setEmail(e.target.value)}
									required
									placeholder='email@example.com'
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='password'>Parol</Label>
								<Input
									id='password'
									type='password'
									value={password}
									onChange={e => setPassword(e.target.value)}
									required
									placeholder='Parolingizni kiriting'
								/>
							</div>

							<Button type='submit' className='w-full' disabled={loading}>
								{loading ? 'Kirilyapti...' : 'Kirish'}
							</Button>
						</form>

						<div className='mt-6 text-center'>
							<p className='text-sm text-muted-foreground'>
								Hisobingiz yo'qmi?{' '}
								<Link
									href='/auth/signup'
									className='text-primary hover:underline'
								>
									Ro'yxatdan o'ting
								</Link>
							</p>
							<p className='text-sm text-muted-foreground mt-2'>
								Admin sifatida kirmoqchimisiz?{' '}
								<Link
									href='/auth/admin/signin'
									className='text-red-600 hover:underline'
								>
									Admin paneli
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
