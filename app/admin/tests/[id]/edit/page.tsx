"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from "lucide-react"
import { getTest, updateTest, uploadAnswerImage, type Question, type Test } from "@/lib/appwrite"
import Link from "next/link"

interface QuestionForm {
  text: string
  options: string[]
  correctIndex: number
  explanation: string
}

export default function EditTestPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string

  const [test, setTest] = useState<Test | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [durationMinutes, setDurationMinutes] = useState(120)
  const [questions, setQuestions] = useState<QuestionForm[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Load existing test data
  useEffect(() => {
    const loadTest = async () => {
      try {
        const testData = await getTest(testId)
        if (!testData) {
          setError("Test topilmadi")
          return
        }

        setTest(testData)
        setTitle(testData.title)
        setDescription(testData.description)
        setDurationMinutes(testData.durationMinutes)

        // Convert questions object to array
        const questionsArray: QuestionForm[] = Object.values(testData.questions).map((q: Question) => ({
          text: q.text,
          options: [...q.options],
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        }))

        setQuestions(questionsArray)
      } catch (error) {
        console.error("Error loading test:", error)
        setError("Test yuklashda xatolik yuz berdi")
      } finally {
        setLoading(false)
      }
    }

    if (testId) {
      loadTest()
    }
  }, [testId])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        explanation: "",
      },
    ])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions]
    updated[questionIndex].options[optionIndex] = value
    setQuestions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!title.trim() || !description.trim()) {
      setError("Sarlavha va tavsif kiritilishi shart")
      return
    }

    if (durationMinutes < 1) {
      setError("Test davomiyligi kamida 1 daqiqa bo'lishi kerak")
      return
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text.trim()) {
        setError(`${i + 1}-savol matni kiritilmagan`)
        return
      }

      if (q.options.some((opt) => !opt.trim())) {
        setError(`${i + 1}-savolda bo'sh variantlar mavjud`)
        return
      }

      if (!q.explanation.trim()) {
        setError(`${i + 1}-savol uchun izoh kiritilmagan`)
        return
      }
    }

    setSaving(true)

    try {
      const questionsObj: Record<string, Question> = {}
      questions.forEach((q, index) => {
        questionsObj[`q${index + 1}`] = {
          text: q.text.trim(),
          options: q.options.map((opt) => opt.trim()),
          correctIndex: q.correctIndex,
          explanation: q.explanation.trim(),
        }
      })

      await updateTest(testId, {
        title: title.trim(),
        description: description.trim(),
        durationMinutes,
        questions: questionsObj,
      })

      router.push("/admin")
    } catch (error) {
      console.error("Error updating test:", error)
      setError("Test yangilashda xatolik yuz berdi")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Test yuklanmoqda...</span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!test) {
    return (
      <ProtectedRoute adminOnly>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertDescription>Test topilmadi yoki yuklashda xatolik yuz berdi.</AlertDescription>
            </Alert>
            <div className="mt-4">
              <Link href="/admin">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Admin Dashboardga qaytish
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Admin Dashboardga qaytish
            </Link>
            <h1 className="text-3xl font-bold mb-2">Testni Tahrirlash</h1>
            <p className="text-muted-foreground">Test ma'lumotlarini va savollarini o'zgartiring</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Test Info */}
            <Card>
              <CardHeader>
                <CardTitle>Test Ma'lumotlari</CardTitle>
                <CardDescription>Asosiy test ma'lumotlarini tahrirlang</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Sarlavhasi</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masalan: Matematika — 1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Tavsif</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Test haqida qisqacha ma'lumot"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Davomiyligi (daqiqa)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number.parseInt(e.target.value))}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Savollar ({questions.length})</CardTitle>
                    <CardDescription>Test savollarini tahrirlang</CardDescription>
                  </div>
                  <Button type="button" onClick={addQuestion} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Savol Qo'shish
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((question, qIndex) => (
                  <Card key={qIndex} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Savol {qIndex + 1}</CardTitle>
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Savol matni</Label>
                        <Textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
                          placeholder="Savolni kiriting..."
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Javob variantlari</Label>
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={question.correctIndex === oIndex}
                              onChange={() => updateQuestion(qIndex, "correctIndex", oIndex)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                placeholder={`Variant ${oIndex + 1}`}
                                required
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-16">
                              {question.correctIndex === oIndex ? "To'g'ri" : ""}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <Label>Izoh (to'g'ri javob uchun)</Label>
                        <Textarea
                          value={question.explanation}
                          onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                          placeholder="To'g'ri javob uchun izoh kiriting..."
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link href="/admin">
                <Button type="button" variant="outline">
                  Bekor qilish
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saqlanmoqda..." : "O'zgarishlarni Saqlash"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
