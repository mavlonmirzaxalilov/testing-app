'use client'
export const dynamic = 'force-dynamic'
import { ProtectedRoute } from '@/components/protected-route'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { getTests, type Test } from '@/lib/appwrite'
import { BookOpen, Clock, Play, LogOut } from 'lucide-react' // LogOut iconi qo'shildi
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function TestsPage() {
	const { user, logout } = useAuth() // logout funksiyasi olindi
	const [tests, setTests] = useState<Test[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const loadTests = async () => {
			try {
				const testsData = await getTests()
				setTests(testsData)
			} catch (error) {
				console.error('Error loading tests:', error)
			} finally {
				setLoading(false)
			}
		}

		loadTests()
	}, [])

	// Chiqish funksiyasi
	const handleLogout = async () => {
		try {
			await logout()
		} catch (error) {
			console.error('Chiqishda xatolik:', error)
		}
	}

	if (loading) {
		return (
			<ProtectedRoute>
				<div className='container mx-auto px-4 py-8'>
					<div className='flex items-center justify-center min-h-[400px]'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute>
			<div className='container mx-auto px-4 py-8'>
				<div className='max-w-4xl mx-auto'>
					<div className='flex justify-between items-center mb-8'>
						<div>
							<h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
								<BookOpen className='h-8 w-8 text-primary' />
								Mavjud Testlar
							</h1>
							<p className='text-muted-foreground'>
								Salom, {user?.firstName}! Testni tanlang va bilimlaringizni
								sinab ko'ring
							</p>
						</div>

						{/* CHIQISH TUGMASI */}
						<Button
							variant='outline'
							className='text-destructive hover:bg-destructive/10 gap-2'
							onClick={handleLogout}
						>
							<LogOut className='h-4 w-4' />
							Chiqish
						</Button>
					</div>

					{tests.length === 0 ? (
						<Card>
							<CardContent className='py-12 text-center'>
								<BookOpen className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
								<h3 className='text-lg font-semibold mb-2'>
									Hozircha testlar yo'q
								</h3>
								<p className='text-muted-foreground'>
									Admin tomonidan testlar qo'shilganda bu yerda ko'rinadi
								</p>
							</CardContent>
						</Card>
					) : (
						<div className='grid gap-6'>
							{tests.map(test => (
								<Card
									key={test.id}
									className='hover:shadow-md transition-shadow'
								>
									<CardHeader>
										<div className='flex items-start justify-between'>
											<div className='flex-1'>
												<CardTitle className='text-xl mb-2'>
													{test.title}
												</CardTitle>
												<CardDescription className='text-base mb-3'>
													{test.description}
												</CardDescription>
												<div className='flex items-center gap-4 text-sm text-muted-foreground'>
													<div className='flex items-center gap-1'>
														<Clock className='h-4 w-4' />
														<span>{test.durationMinutes} daqiqa</span>
													</div>
													<div className='flex items-center gap-1'>
														<BookOpen className='h-4 w-4' />
														<span>
															{Object.keys(test.questions).length} ta savol
														</span>
													</div>
												</div>
											</div>
											<Badge variant='secondary' className='ml-4'>
												Mavjud
											</Badge>
										</div>
									</CardHeader>
									<CardContent>
										<div className='flex items-center justify-between'>
											<div className='text-sm text-muted-foreground'>
												Yaratilgan:{' '}
												{new Date(test.createdAt).toLocaleDateString('uz-UZ')}
											</div>
											<Link href={`/tests/${test.id}`}>
												<Button className='flex items-center gap-2'>
													<Play className='h-4 w-4' />
													Testni Boshlash
												</Button>
											</Link>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</div>
		</ProtectedRoute>
	)
}
