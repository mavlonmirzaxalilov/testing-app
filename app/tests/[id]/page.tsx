'use client'
export const dynamic = 'force-dynamic'

import { ProtectedRoute } from '@/components/protected-route'
import { QuestionCard } from '@/components/question-card'
import { Timer } from '@/components/timer'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import {
    getProgress,
    getTest,
    saveProgress,
    type Answer,
    type Progress,
    type Test,
} from '@/lib/appwrite'
import { AlertCircle, Play } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
    const [questionIdSubset, setQuestionIdSubset] = useState<string[] | null>(null)

    const questionIds = questionIdSubset ?? (test ? Object.keys(test.questions) : [])
    const currentQuestionId = questionIds[currentQuestionIndex]
    const currentQuestion = test?.questions[currentQuestionId]

    // --- TUZATILGAN USEEFFECT ---
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

                const existingProgress = await getProgress(user.$id, testId)
                
                if (existingProgress) {
                    let parsedAnswers = {}
                    
                    // Appwrite string qaytarsa obyektga o'giramiz, aks holda .length xato sanaydi
                    if (typeof existingProgress.answers === 'string') {
                        try {
                            parsedAnswers = JSON.parse(existingProgress.answers)
                        } catch (e) {
                            parsedAnswers = {}
                        }
                    } else {
                        parsedAnswers = existingProgress.answers || {}
                    }

                    const updatedProgress = {
                        ...existingProgress,
                        answers: parsedAnswers
                    }

                    setProgress(updatedProgress)
                    setTestStarted(true)

                    const answeredKeys = Object.keys(parsedAnswers)
                    const totalQuestionsCount = Object.keys(testData.questions).length

                    // Faqat test rostdan tugagan bo'lsa reviewga o'tkazamiz
                    if (answeredKeys.length >= totalQuestionsCount && totalQuestionsCount > 0) {
                        router.push(`/tests/${testId}/review`)
                    } else {
                        setCurrentQuestionIndex(answeredKeys.length)
                    }
                }
            } catch (error) {
                console.error('Error loading test:', error)
                setError('Testni yuklashda xatolik yuz berdi')
            } finally {
                setLoading(false)
            }
        }

        loadTest()
    }, [testId, user, router])

    const startTest = async () => {
        if (!user || !test) return

        const now = new Date().toISOString()
        const newProgress = {
            userId: user.$id,
            testId: test.id || testId,
            startAt: now,
            lastUpdated: now,
            answers: {}, // Obyekt ko'rinishida yuboramiz
        }

        try {
            await saveProgress(newProgress as any)
            setProgress(newProgress as any)
            setTestStarted(true)
            setCurrentQuestionIndex(0)
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

        const updatedAnswers = {
            ...progress.answers,
            [questionId]: answer,
        }

        const updatedProgress = {
            ...progress,
            answers: updatedAnswers,
            lastUpdated: new Date().toISOString(),
        }

        try {
            setProgress(updatedProgress)
            await saveProgress(updatedProgress)
        } catch (error) {
            console.error('Error saving answer:', error)
        }
    }

    const handleSkipWithConfirm = async (questionId: string) => {
        const confirmed = window.confirm(
            "Haqiqatan ham bu savolni o'tkazib yubormoqchimisiz?\nUnga javob bermaguncha u yana va yana chiqaveradi.",
        )

        if (!confirmed || !progress || !user) return

        const answer: Answer = {
            status: 'skipped',
            answeredAt: null,
        }

        const updatedAnswers = {
            ...progress.answers,
            [questionId]: answer,
        }

        const updatedProgress = {
            ...progress,
            answers: updatedAnswers,
            lastUpdated: new Date().toISOString(),
        }

        try {
            setProgress(updatedProgress)
            await saveProgress(updatedProgress)
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

        if (progress && test) {
            const unanswered = Object.entries(progress.answers)
                .filter(([_, ans]: [any, any]) => ans.status === 'skipped')
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
        router.push(`/tests/${testId}/review`)
    }

    const handleTimeUp = () => {
        finishTest()
    }

    if (loading) return (
        <ProtectedRoute>
            <div className='flex items-center justify-center min-h-screen font-sans'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
            </div>
        </ProtectedRoute>
    )

    if (error || !test) return (
        <ProtectedRoute>
            <div className='container mx-auto px-4 py-8 font-sans'>
                <Alert variant='destructive' className='max-w-2xl mx-auto'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>{error || 'Test topilmadi'}</AlertDescription>
                </Alert>
            </div>
        </ProtectedRoute>
    )

    if (!testStarted) return (
        <ProtectedRoute>
            <div className='container mx-auto px-4 py-8 font-sans'>
                <Card className='max-w-2xl mx-auto'>
                    <CardHeader>
                        <CardTitle className='text-2xl'>{test.title}</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        <p className='text-muted-foreground'>{test.description}</p>
                        <div className='grid grid-cols-2 gap-4 text-sm font-medium'>
                            <div className='p-3 bg-muted rounded-lg text-center'>⏳ {test.durationMinutes} daqiqa</div>
                            <div className='p-3 bg-muted rounded-lg text-center'>📝 {Object.keys(test.questions).length} ta savol</div>
                        </div>
                        <Button onClick={startTest} size='lg' className='w-full text-lg'>
                            <Play className='h-5 w-5 mr-2' /> Testni Boshlash
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    )

    if (!currentQuestion) return null

    return (
        <ProtectedRoute>
            <div className='container mx-auto px-4 py-8 font-sans'>
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