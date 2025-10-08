'use client'

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

export default function SignUpPage() {
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [phoneNumber, setPhoneNumber] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const { signUp } = useAuth()
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		if (!firstName.trim()) {
			setError('Ism kiritilishi shart')
			return
		}

		if (!lastName.trim()) {
			setError('Familiya kiritilishi shart')
			return
		}

		if (!phoneNumber.trim()) {
			setError('Telefon raqam kiritilishi shart')
			return
		}

		// Basic phone number validation
		const phoneRegex = /^[+]?[0-9\s\-$$$$]{9,15}$/
		if (!phoneRegex.test(phoneNumber)) {
			setError("Telefon raqam formati noto'g'ri")
			return
		}

		if (password !== confirmPassword) {
			setError('Parollar mos kelmaydi')
			return
		}

		if (password.length < 6) {
			setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
			return
		}

		setLoading(true)

		try {
			await signUp(email, password, firstName, lastName, phoneNumber)
			router.push('/')
		} catch (err) {
			setError("Ro'yxatdan o'tishda xatolik yuz berdi")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='container mx-auto px-4 py-16'>
			<div className='max-w-md mx-auto'>
				<div className='text-center mb-8'>
					<BookOpen className='h-12 w-12 text-primary mx-auto mb-4' />
					<h1 className='text-2xl font-bold'>Ro'yxatdan O'tish</h1>
					<p className='text-muted-foreground'>Yangi hisob yarating</p>
				</div>

				<Card>
					<CardHeader className='bg-card border mx-4 p-2 border-blue-200 rounded-lg text-center'>
						<CardTitle className='text-card-foreground'>Ro'yxatdan o'tish</CardTitle>
						<CardDescription>Ma'lumotlaringizni kiriting</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className='space-y-4'>
							{error && (
								<Alert variant='destructive'>
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='firstName'>Ism</Label>
									<Input
										id='firstName'
										type='text'
										value={firstName}
										onChange={e => setFirstName(e.target.value)}
										required
										placeholder='Ismingiz'
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='lastName'>Familiya</Label>
									<Input
										id='lastName'
										type='text'
										value={lastName}
										onChange={e => setLastName(e.target.value)}
										required
										placeholder='Familiyangiz'
									/>
								</div>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='phoneNumber'>Telefon Raqam</Label>
								<Input
									id='phoneNumber'
									type='tel'
									value={phoneNumber}
									onChange={e => setPhoneNumber(e.target.value)}
									required
									placeholder='+998 90 123 45 67'
								/>
							</div>

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
									placeholder='Kamida 6 ta belgi'
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='confirmPassword'>Parolni Tasdiqlang</Label>
								<Input
									id='confirmPassword'
									type='password'
									value={confirmPassword}
									onChange={e => setConfirmPassword(e.target.value)}
									required
									placeholder='Parolni qayta kiriting'
								/>
							</div>

							<Button type='submit' className='w-full' disabled={loading}>
								{loading ? "Ro'yxatdan o'tilyapti..." : "Ro'yxatdan O'tish"}
							</Button>
						</form>

						<div className='mt-6 text-center'>
							<p className='text-sm text-muted-foreground'>
								Hisobingiz bormi?{' '}
								<Link
									href='/auth/signin'
									className='text-primary hover:underline'
								>
									Kirish
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
