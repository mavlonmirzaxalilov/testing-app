'use client'
export const dynamic = 'force-dynamic'

import { ProtectedRoute } from '@/components/protected-route'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useAuth } from '@/contexts/auth-context'
// ✅ TUZATILDI: getFileUrl ni appwrite.ts dan olamiz
import {
	getProgress,
	getTest,
	saveResult,
	getFileUrl,
	type Progress,
	type Result,
	type Test,
} from '@/lib/appwrite'
import {
	AlertCircle,
	CheckCircle,
	ChevronDown,
	Home,
	SkipForward,
	XCircle,
	Youtube,
	Image as ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ReviewPage() {
	const params = useParams()
	const router = useRouter()
	const { user } = useAuth()
	const testId = params.id as string

	const [test, setTest] = useState<Test | null>(null)
	const [progress, setProgress] = useState<Progress | null>(null)
	const [result, setResult] = useState<Result | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		const loadReview = async () => {
			if (!user) return

			try {
				const [testData, progressData] = await Promise.all([
					getTest(testId),
					// ✅ TUZATILDI: user.$id → user.uid
					getProgress(user.uid, testId),
				])

				if (!testData || !progressData) {
					setError("Test ma'lumotlari topilmadi")
					return
				}

				setTest(testData)
				setProgress(progressData)

				const questionIds = Object.keys(testData.questions)
				let correctCount = 0
				let wrongCount = 0
				const skipped: string[] = []

				const answers =
					typeof progressData.answers === 'string'
						? JSON.parse(progressData.answers)
						: progressData.answers

				questionIds.forEach(qId => {
					const answer = answers[qId]
					const question = (testData.questions as Record<string, any>)[qId]

					if (!answer || answer.status === 'skipped') {
						skipped.push(qId)
					} else if (answer.selectedIndex === question.correctIndex) {
						correctCount++
					} else {
						wrongCount++
					}
				})

				const resultData: Result = {
					// ✅ TUZATILDI: user.$id → user.uid
					userId: user.uid,
					testId: testData.id || testId,
					score: correctCount,
					correctCount,
					wrongCount,
					skipped,
					completedAt: new Date().toISOString(),
				}

				await saveResult(resultData)
				setResult(resultData)
			} catch (error) {
				console.error('Error loading review:', error)
				setError('Natijalarni yuklashda xatolik yuz berdi')
			} finally {
				setLoading(false)
			}
		}

		loadReview()
	}, [testId, user])

	if (loading || !result || !test || !progress) {
		return (
			<ProtectedRoute>
				<div className='container mx-auto px-4 py-8'>
					<div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
						<p className='text-muted-foreground animate-pulse'>
							Natijalar hisoblanmoqda...
						</p>
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	if (error) {
		return (
			<ProtectedRoute>
				<div className='container mx-auto px-4 py-8'>
					<Alert variant='destructive' className='max-w-2xl mx-auto'>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				</div>
			</ProtectedRoute>
		)
	}

	const questionIds = Object.keys(test.questions)
	const totalQuestions = questionIds.length
	const percentage = Math.round((result.correctCount / totalQuestions) * 100)

	const finalAnswers =
		typeof progress.answers === 'string'
			? JSON.parse(progress.answers)
			: progress.answers

	return (
		<ProtectedRoute>
			<div className='container mx-auto px-4 py-8 font-sans'>
				<div className='max-w-4xl mx-auto space-y-6'>
					<Card className='bg-primary/5 border-primary/20'>
						<CardHeader>
							<CardTitle className='text-3xl text-center font-bold'>
								Test Yakunlandi!
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='text-center'>
								<div className='text-5xl font-extrabold text-primary mb-2'>
									{result.correctCount}/{totalQuestions}
								</div>
								<div className='text-xl font-medium text-muted-foreground'>
									Bilim darajasi: {percentage}%
								</div>
							</div>

							<div className='grid grid-cols-3 gap-4 text-center'>
								<div className='p-3 bg-green-50 rounded-xl border border-green-100'>
									<CheckCircle className='h-6 w-6 text-green-500 mx-auto mb-1' />
									<div className='text-xl font-bold text-green-600'>
										{result.correctCount}
									</div>
									<div className='text-xs text-green-700 uppercase tracking-wider'>
										To'g'ri
									</div>
								</div>
								<div className='p-3 bg-red-50 rounded-xl border border-red-100'>
									<XCircle className='h-6 w-6 text-red-500 mx-auto mb-1' />
									<div className='text-xl font-bold text-red-600'>
										{result.wrongCount}
									</div>
									<div className='text-xs text-red-700 uppercase tracking-wider'>
										Noto'g'ri
									</div>
								</div>
								<div className='p-3 bg-orange-50 rounded-xl border border-orange-100'>
									<SkipForward className='h-6 w-6 text-orange-500 mx-auto mb-1' />
									<div className='text-xl font-bold text-orange-600'>
										{result.skipped.length}
									</div>
									<div className='text-xs text-orange-700 uppercase tracking-wider'>
										O'tkazilgan
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-xl'>
								<AlertCircle className='h-5 w-5 text-primary' />
								Savollar Tahlili
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							{questionIds.map((qId, index) => {
								const answer = finalAnswers[qId]
								const question = (test.questions as Record<string, any>)[qId]
								const isCorrect =
									answer?.selectedIndex === question.correctIndex

								return (
									<Collapsible
										key={qId}
										className='border rounded-xl overflow-hidden shadow-sm'
									>
										<CollapsibleTrigger asChild>
											<Button
												variant='ghost'
												className={cn(
													'w-full justify-between p-4 h-auto hover:bg-muted/50 transition-all',
													isCorrect
														? 'border-l-8 border-l-green-500'
														: 'border-l-8 border-l-red-500',
												)}
											>
												<div className='text-left'>
													<div className='font-bold flex items-center gap-2'>
														Savol {index + 1}
														{isCorrect ? (
															<Badge className='bg-green-500 hover:bg-green-600'>
																To'g'ri
															</Badge>
														) : (
															<Badge variant='destructive'>Xato</Badge>
														)}
													</div>
													<div className='text-sm text-muted-foreground mt-1 line-clamp-1'>
														{question.text}
													</div>
												</div>
												<ChevronDown className='h-5 w-5 opacity-30' />
											</Button>
										</CollapsibleTrigger>
										<CollapsibleContent className='px-6 pb-6 pt-4 bg-muted/10 border-t'>
											<div className='space-y-4'>
												<div className='font-semibold text-lg leading-snug'>
													{question.text}
												</div>

												<div className='grid gap-3'>
													<div className='flex items-center gap-3 text-sm p-3 bg-green-100/50 border border-green-200 rounded-lg text-green-800'>
														<CheckCircle className='h-5 w-5 shrink-0' />
														<span>
															<strong>To'g'ri javob:</strong>{' '}
															{question.options[question.correctIndex]}
														</span>
													</div>

													{!isCorrect && answer?.status === 'answered' && (
														<div className='flex items-center gap-3 text-sm p-3 bg-red-100/50 border border-red-200 rounded-lg text-red-800'>
															<XCircle className='h-5 w-5 shrink-0' />
															<span>
																<strong>Sizning javobingiz:</strong>{' '}
																{question.options[answer.selectedIndex!]}
															</span>
														</div>
													)}
												</div>

												<div className='bg-white p-5 rounded-xl border shadow-sm space-y-4'>
													<div>
														<div className='font-bold text-xs uppercase tracking-widest text-primary mb-2'>
															Mavzu tushuntirishi:
														</div>
														<div className='text-sm leading-relaxed text-slate-700'>
															{question.explanation}
														</div>
													</div>

													<div className='flex flex-col md:flex-row gap-4 pt-2'>
														{question.explanationImageId ? (
															<div className='flex-1 group relative'>
																<img
																	src={getFileUrl(question.explanationImageId)}
																	alt='Tushuntirish rasmi'
																	className='rounded-lg border-2 border-slate-100 w-full max-h-64 object-contain bg-slate-50 transition-transform hover:scale-[1.01] cursor-pointer'
																	onClick={() =>
																		window.open(
																			getFileUrl(question.explanationImageId!),
																			'_blank',
																		)
																	}
																/>
																<div className='absolute top-2 right-2 bg-black/50 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity'>
																	<ImageIcon size={16} />
																</div>
															</div> 
														): "Xech narsa yo'q"}

														{question.youtubeUrl && (
															<div className='flex items-center justify-center'>
																<Button
																	variant='destructive'
																	className='flex gap-2 shadow-lg hover:shadow-red-200'
																	onClick={() =>
																		window.open(question.youtubeUrl, '_blank')
																	}
																>
																	<Youtube className='h-5 w-5' />
																	Videoni ko'rish
																</Button>
															</div>
														)}
													</div>
												</div>
											</div>
										</CollapsibleContent>
									</Collapsible>
								)
							})}
						</CardContent>
					</Card>

					<div className='flex justify-center pb-10'>
						<Link href='/'>
							<Button
								size='lg'
								variant='outline'
								className='flex items-center gap-2 hover:bg-primary hover:text-white transition-all'
							>
								<Home className='h-5 w-5' />
								Bosh Sahifaga Qaytish
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	)
}
