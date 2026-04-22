'use client'
export const dynamic = 'force-dynamic'
import { ProtectedRoute } from '@/components/protected-route'
import { Badge } from '@/components/ui/badge'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { db, type Result, type Test } from '@/lib/appwrite'
import { BarChart3, CheckCircle, SkipForward, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function UserResultsPage() {
	const { user } = useAuth()
	const [tests, setTests] = useState<Test[]>([])
	const [results, setResults] = useState<Result[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const loadResults = async () => {
			if (!user) return

			try {
				const [testsData, resultsData] = await Promise.all([
					db.getTests(),
					db.getResults(user.uid),
				])
				setTests(testsData)
				setResults(resultsData)
			} catch (error) {
				console.error('Error loading results:', error)
			} finally {
				setLoading(false)
			}
		}

		loadResults()
	}, [user])

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
					<div className='mb-8'>
						<h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
							<BarChart3 className='h-8 w-8 text-primary' />
							Mening Natijalarim
						</h1>
						<p className='text-muted-foreground'>
							O'tgan testlaringiz natijalarini ko'ring
						</p>
					</div>

					{results.length === 0 ? (
						<Card>
							<CardContent className='py-12 text-center'>
								<BarChart3 className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
								<h3 className='text-lg font-semibold mb-2'>
									Hozircha natijalar yo'q
								</h3>
								<p className='text-muted-foreground'>
									Test topshirganingizdan keyin natijalar bu yerda ko'rinadi
								</p>
							</CardContent>
						</Card>
					) : (
						<div className='space-y-6'>
							{results.map(result => {
								const test = tests.find(t => t.id === result.testId)
								const totalQuestions = test
									? Object.keys(test.questions).length
									: result.correctCount +
										result.wrongCount +
										result.skipped.length
								const percentage = Math.round(
									(result.correctCount / totalQuestions) * 100,
								)

								return (
									<Card key={`${result.testId}_${result.completedAt}`}>
										<CardHeader>
											<div className='flex items-center justify-between'>
												<div>
													<CardTitle>
														{test?.title || 'Test topilmadi'}
													</CardTitle>
													<CardDescription>
														{new Date(result.completedAt).toLocaleDateString(
															'uz-UZ',
															{
																year: 'numeric',
																month: 'long',
																day: 'numeric',
																hour: '2-digit',
																minute: '2-digit',
															},
														)}
													</CardDescription>
												</div>
												<Badge
													variant={
														percentage >= 70
															? 'default'
															: percentage >= 50
																? 'secondary'
																: 'destructive'
													}
												>
													{percentage}%
												</Badge>
											</div>
										</CardHeader>
										<CardContent>
											<div className='grid grid-cols-4 gap-4 mb-4'>
												<div className='text-center'>
													<div className='flex items-center justify-center mb-2'>
														<CheckCircle className='h-6 w-6 text-green-500' />
													</div>
													<div className='text-2xl font-bold text-green-500'>
														{result.correctCount}
													</div>
													<div className='text-sm text-muted-foreground'>
														To'g'ri
													</div>
												</div>

												<div className='text-center'>
													<div className='flex items-center justify-center mb-2'>
														<XCircle className='h-6 w-6 text-red-500' />
													</div>
													<div className='text-2xl font-bold text-red-500'>
														{result.wrongCount}
													</div>
													<div className='text-sm text-muted-foreground'>
														Noto'g'ri
													</div>
												</div>

												<div className='text-center'>
													<div className='flex items-center justify-center mb-2'>
														<SkipForward className='h-6 w-6 text-orange-500' />
													</div>
													<div className='text-2xl font-bold text-orange-500'>
														{result.skipped.length}
													</div>
													<div className='text-sm text-muted-foreground'>
														O'tkazilgan
													</div>
												</div>

												<div className='text-center'>
													<div className='flex items-center justify-center mb-2'>
														<BarChart3 className='h-6 w-6 text-primary' />
													</div>
													<div className='text-2xl font-bold text-primary'>
														{result.score}
													</div>
													<div className='text-sm text-muted-foreground'>
														Ball
													</div>
												</div>
											</div>

											<div className='text-center text-sm text-muted-foreground'>
												Jami: {result.correctCount}/{totalQuestions} to'g'ri
												javob
											</div>
										</CardContent>
									</Card>
								)
							})}
						</div>
					)}
				</div>
			</div>
		</ProtectedRoute>
	)
}
