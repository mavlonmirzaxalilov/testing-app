"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CheckCircle, XCircle, SkipForward, ChevronDown, Home, AlertCircle } from "lucide-react"
import { getTest, getProgress, saveResult, type Test, type Progress, type Result } from "@/lib/firebase"
import Link from "next/link"

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const testId = params.id as string

  const [test, setTest] = useState<Test | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadReview = async () => {
      if (!user) return

      try {
        const [testData, progressData] = await Promise.all([getTest(testId), getProgress(user.uid, testId)])

        if (!testData || !progressData) {
          setError("Test ma'lumotlari topilmadi")
          return
        }

        setTest(testData)
        setProgress(progressData)

        // Calculate results
        const questionIds = Object.keys(testData.questions)
        let correctCount = 0
        let wrongCount = 0
        const skipped: string[] = []

        questionIds.forEach((qId) => {
          const answer = progressData.answers[qId]
          const question = testData.questions[qId]

          if (!answer || answer.status === "skipped") {
            skipped.push(qId)
          } else if (answer.selectedIndex === question.correctIndex) {
            correctCount++
          } else {
            wrongCount++
          }
        })

        const resultData: Result = {
          userId: user.uid,
          testId: testData.id,
          score: correctCount,
          correctCount,
          wrongCount,
          skipped,
          completedAt: new Date().toISOString(),
        }

        await saveResult(resultData)
        setResult(resultData)
      } catch (error) {
        console.error("Error loading review:", error)
        setError("Natijalarni yuklashda xatolik yuz berdi")
      } finally {
        setLoading(false)
      }
    }

    loadReview()
  }, [testId, user])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !test || !progress || !result) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || "Ma'lumotlar topilmadi"}</AlertDescription>
            </Alert>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const questionIds = Object.keys(test.questions)
  const totalQuestions = questionIds.length
  const percentage = Math.round((result.correctCount / totalQuestions) * 100)

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Results Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Test Yakunlandi!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {result.correctCount}/{totalQuestions}
                </div>
                <div className="text-xl text-muted-foreground mb-4">{percentage}% to'g'ri javob</div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="text-2xl font-semibold text-green-500">{result.correctCount}</div>
                  <div className="text-sm text-muted-foreground">To'g'ri</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="text-2xl font-semibold text-red-500">{result.wrongCount}</div>
                  <div className="text-sm text-muted-foreground">Noto'g'ri</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <SkipForward className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="text-2xl font-semibold text-orange-500">{result.skipped.length}</div>
                  <div className="text-sm text-muted-foreground">O'tkazilgan</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wrong Answers Review */}
          {result.wrongCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Noto'g'ri Javoblar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questionIds.map((qId, index) => {
                  const answer = progress.answers[qId]
                  const question = test.questions[qId]

                  if (!answer || answer.status === "skipped" || answer.selectedIndex === question.correctIndex) {
                    return null
                  }

                  return (
                    <Collapsible key={qId}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                          <div className="text-left">
                            <div className="font-medium">Savol {index + 1}</div>
                            <div className="text-sm text-muted-foreground truncate">{question.text}</div>
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <div className="space-y-3">
                          <div className="font-medium">{question.text}</div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">Sizning javobingiz</Badge>
                              <span>{question.options[answer.selectedIndex!]}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="bg-green-500">
                                To'g'ri javob
                              </Badge>
                              <span>{question.options[question.correctIndex]}</span>
                            </div>
                          </div>

                          {question.explanation && (
                            <div className="bg-muted p-3 rounded-lg">
                              <div className="font-medium text-sm mb-1">Izoh:</div>
                              <div className="text-sm">{question.explanation}</div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Skipped Questions */}
          {result.skipped.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SkipForward className="h-5 w-5 text-orange-500" />
                  O'tkazib Yuborilgan Savollar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.skipped.map((qId) => {
                  const question = test.questions[qId]
                  const questionIndex = questionIds.indexOf(qId)

                  return (
                    <Collapsible key={qId}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                          <div className="text-left">
                            <div className="font-medium">Savol {questionIndex + 1}</div>
                            <div className="text-sm text-muted-foreground truncate">{question.text}</div>
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <div className="space-y-3">
                          <div className="font-medium">{question.text}</div>

                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-green-500">
                              To'g'ri javob
                            </Badge>
                            <span>{question.options[question.correctIndex]}</span>
                          </div>

                          {question.explanation && (
                            <div className="bg-muted p-3 rounded-lg">
                              <div className="font-medium text-sm mb-1">Izoh:</div>
                              <div className="text-sm">{question.explanation}</div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-center">
            <Link href="/">
              <Button size="lg" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Bosh Sahifaga Qaytish
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
