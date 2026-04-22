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

export default function SignUpPage() {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    
    // TUG'RILANDI: signUp o'rniga register chaqirildi
    const { register } = useAuth() 
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!firstName.trim()) {
            return setError('Ism kiritilishi shart')
        }

        if (!lastName.trim()) {
            return setError('Familiya kiritilishi shart')
        }

        if (!phoneNumber.trim()) {
            return setError('Telefon raqam kiritilishi shart')
        }

        const phoneRegex = /^[+]?[0-9\s\-]{9,15}$/
        if (!phoneRegex.test(phoneNumber)) {
            return setError("Telefon raqam formati noto'g'ri")
        }

        if (password !== confirmPassword) {
            return setError('Parollar mos kelmaydi')
        }

        if (password.length < 8) { // Appwrite uchun kamida 8 ta belgi qildik
            return setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak")
        }

        setLoading(true)

        try {
            // TO'G'RILANDI: register funksiyasi ishlatildi
            await register(email, password, firstName, lastName, phoneNumber)
            router.push('/')
        } catch (err: any) {
            // TO'G'RILANDI: Appwrite'ning haqiqiy xatolik matni ekranga chiqadi
            console.error("Appwrite Error:", err)
            setError(err.message || "Ro'yxatdan o'tishda xatolik yuz berdi")
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
                        <form onSubmit={handleSubmit} className='space-y-4 pt-4'>
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
                                    placeholder='Kamida 8 ta belgi'
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