'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import { Timer } from '@/components/timer'
import { QuestionCard } from '@/components/question-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Play, AlertCircle } from 'lucide-react'
import {
	getTest,
	getProgress,
	saveProgress,
	type Test,
	type Progress,
	type Answer,
} from '@/lib/appwrite'

export default function TestPage() {
	const params = useParams()
	const router = useRouter()
	const { user } = useAuth()
	const testId = params.id as string

	const [test, setTest] = useState<Test | null>(null)
	const [progress, setProgress] = useState<Progress | null>(null)
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [loading, setLoading] = useState(true)
	const [testStarted, setTestStarted] = useState(false)
	const [error, setError] = useState('')
	const [questionIdSubset, setQuestionIdSubset] = useState<string[] | null>(
		null
	)
	const questionIds =
		questionIdSubset ?? (test ? Object.keys(test.questions) : [])

	const currentQuestionId = questionIds[currentQuestionIndex]

	const currentQuestion = test?.questions[currentQuestionId]

	useEffect(() => {
		const loadTest = async () => {
			if (!user) return

			try {
				const testData = await getTest(testId)
				if (!testData) {
					setError('Test topilmadi')
					return
				}

				setTest(testData)

				const existingProgress = await getProgress(user.uid, testId)
				if (existingProgress) {
					setProgress(existingProgress)
					setTestStarted(true)

					const answeredQuestions = Object.keys(existingProgress.answers)
					setCurrentQuestionIndex(answeredQuestions.length)
				}
			} catch (error) {
				console.error('Error loading test:', error)
				setError('Testni yuklashda xatolik yuz berdi')
			} finally {
				setLoading(false)
			}
		}

		loadTest()
	}, [testId, user])

	const startTest = async () => {
		if (!user || !test) return

		const now = new Date().toISOString()
		const newProgress: Progress = {
			userId: user.uid,
			testId: test.id,
			startAt: now,
			lastUpdated: now,
			answers: {},
		}

		try {
			await saveProgress(newProgress)
			setProgress(newProgress)
			setTestStarted(true)
		} catch (error) {
			console.error('Error starting test:', error)
			setError('Testni boshlashda xatolik yuz berdi')
		}
	}
	const handleAnswer = async (questionId: string, selectedIndex: number) => {
		if (!progress || !user) return

		const answer: Answer = {
			status: 'answered',
			selectedIndex,
			answeredAt: new Date().toISOString(),
		}

		const updatedProgress = {
			...progress,
			answers: {
				...progress.answers,
				[questionId]: answer,
			},
			lastUpdated: new Date().toISOString(),
		}

		try {
			await saveProgress(updatedProgress)
			setProgress(updatedProgress)
		} catch (error) {
			console.error('Error saving answer:', error)
		}
	}

	const handleSkip = async (questionId: string) => {
		if (!progress || !user) return

		const answer: Answer = {
			status: 'skipped',
			answeredAt: null,
		}

		const updatedProgress = {
			...progress,
			answers: {
				...progress.answers,
				[questionId]: answer,
			},
			lastUpdated: new Date().toISOString(),
		}

		try {
			await saveProgress(updatedProgress)
			setProgress(updatedProgress)
		} catch (error) {
			console.error('Error saving skip:', error)
		}
	}

	const handleSkipWithConfirm = async (questionId: string) => {
		const confirmed = window.confirm(
			"Haqiqatan ham bu savolni o'tkazib yubormoqchimisiz?\nUnga javob bermaguncha u yana va yana chiqaveradi."
		)

		if (!confirmed) return

		if (!progress || !user) return

		const answer: Answer = {
			status: 'skipped',
			answeredAt: null,
		}

		const updatedProgress = {
			...progress,
			answers: {
				...progress.answers,
				[questionId]: answer,
			},
			lastUpdated: new Date().toISOString(),
		}

		try {
			await saveProgress(updatedProgress)
			setProgress(updatedProgress)
			handleNext()
		} catch (error) {
			console.error('Error skipping:', error)
		}
	}

	const handleNext = () => {
		const nextIndex = currentQuestionIndex + 1

		if (nextIndex < questionIds.length) {
			setCurrentQuestionIndex(nextIndex)
			return
		}

		// Savollar tugadi, lekin hali skippedlar bor bo'lishi mumkin
		if (progress && test) {
			const unanswered = Object.entries(progress.answers)
				.filter(([id, ans]) => ans.status === 'skipped')
				.map(([id]) => id)

			if (unanswered.length > 0) {
				setQuestionIdSubset(unanswered)
				setCurrentQuestionIndex(0)
			} else {
				finishTest()
			}
		} else {
			finishTest()
		}
	}

	const finishTest = () => {
		setQuestionIdSubset(null)
		setCurrentQuestionIndex(0)
		router.push(`/tests/${testId}/review`)
	}

	const handleTimeUp = () => {
		finishTest()
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

	if (error || !test) {
		return (
			<ProtectedRoute>
				<div className='container mx-auto px-4 py-8'>
					<div className='max-w-2xl mx-auto'>
						<Alert variant='destructive'>
							<AlertCircle className='h-4 w-4' />
							<AlertDescription>{error || 'Test topilmadi'}</AlertDescription>
						</Alert>
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	if (!testStarted) {
		return (
			<ProtectedRoute>
				<div className='container mx-auto px-4 py-8'>
					<div className='max-w-2xl mx-auto'>
						<Card>
							<CardHeader>
								<CardTitle className='text-2xl'>{test.title}</CardTitle>
							</CardHeader>
							<CardContent className='space-y-6'>
								<div>
									<p className='text-muted-foreground mb-4'>
										{test.description}
									</p>
									<div className='grid grid-cols-2 gap-4 text-sm'>
										<div>
											<strong>Vaqt:</strong> {test.durationMinutes} daqiqa
										</div>
										<div>
											<strong>Savollar:</strong>{' '}
											{Object.keys(test.questions).length} ta
										</div>
									</div>
								</div>

								<Alert>
									<AlertCircle className='h-4 w-4' />
									<AlertDescription>
										Test boshlangandan keyin {test.durationMinutes} daqiqa
										vaqtingiz bor. Sahifani yangilasangiz ham progress
										saqlanadi.
									</AlertDescription>
								</Alert>

								<Button onClick={startTest} size='lg' className='w-full'>
									<Play className='h-5 w-5 mr-2' />
									Testni Boshlash
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	if (!currentQuestion) {
		return (
			<ProtectedRoute>
				<div className='container mx-auto px-4 py-8'>
					<div className='max-w-2xl mx-auto'>
						<Alert>
							<AlertCircle className='h-4 w-4' />
							<AlertDescription>Test yakunlandi</AlertDescription>
						</Alert>
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute>
			<div className='container mx-auto px-4 py-8'>
				<div className='max-w-4xl mx-auto space-y-6'>
					<div className='flex justify-center'>
						<Timer
							startTime={progress!.startAt}
							durationMinutes={test.durationMinutes}
							onTimeUp={handleTimeUp}
						/>
					</div>

					<QuestionCard
						questionId={currentQuestionId}
						question={currentQuestion}
						questionNumber={currentQuestionIndex + 1}
						totalQuestions={questionIds.length}
						currentAnswer={progress?.answers[currentQuestionId]}
						onAnswer={handleAnswer}
						onSkip={handleSkipWithConfirm}
						onNext={handleNext}
					/>
				</div>
			</div>
		</ProtectedRoute>
	)
}
