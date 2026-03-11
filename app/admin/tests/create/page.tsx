"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, Save, ArrowLeft, AlertTriangle } from "lucide-react"
import { createTest, uploadAnswerImage, type Question } from "@/lib/appwrite"
import Link from "next/link"

interface QuestionForm {
  text: string
  options: string[]
  correctIndex: number
  explanation: string
  videoAnswer?: string
  imageAnswer?: string
  imageFile?: File | null
}

export default function CreateTestPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState("Demo Test - Matematika Asoslari")
  const [description, setDescription] = useState(
    "Bu demo test bo'lib, matematika asoslarini tekshirish uchun mo'ljallangan. 3 ta savol mavjud.",
  )
  const [durationMinutes, setDurationMinutes] = useState(15)
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      text: "2 + 2 ning qiymati nechaga teng?",
      options: ["3", "4", "5", "6"],
      correctIndex: 1,
      explanation: "2 + 2 = 4. Bu oddiy qo'shish amali.",
      videoAnswer: undefined,
      imageAnswer: undefined,
      imageFile: null,
    },
    {
      text: "10 - 3 ning natijasi nima?",
      options: ["6", "7", "8", "9"],
      correctIndex: 1,
      explanation: "10 - 3 = 7. Bu ayirish amali.",
      videoAnswer: undefined,
      imageAnswer: undefined,
      imageFile: null,
    },
    {
      text: "3 × 4 ning ko'paytmasi nechaga teng?",
      options: ["10", "11", "12", "13"],
      correctIndex: 2,
      explanation: "3 × 4 = 12. Bu ko'paytirish amali.",
      videoAnswer: undefined,
      imageAnswer: undefined,
      imageFile: null,
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        explanation: "",
        videoAnswer: undefined,
        imageAnswer: undefined,
        imageFile: null,
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

    // console.log("[v0] Starting test creation process")
    // console.log("[v0] Current user:", user)

    if (!user) {
      setError("Foydalanuvchi tizimga kirmagan")
      // console.log("[v0] User not authenticated")
      return
    }

    if (user.role !== "admin") {
      setError("Faqat adminlar test yarata oladi")
      // console.log("[v0] User is not admin:", user.role)
      return
    }

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

    setLoading(true)
    console.log("[v0] Starting test creation with data:", { title, description, durationMinutes })

    try {
      const questionsObj: Record<string, Question> = {}
      
      // Upload images and create questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        let imageUrl: string | undefined = undefined
        
        // Upload image if provided
        if (q.imageFile) {
          try {
            imageUrl = await uploadAnswerImage(q.imageFile)
          } catch (error) {
            console.error(`[v0] Error uploading image for question ${i + 1}:`, error)
            setError(`${i + 1}-savol uchun rasm yuklanishda xatolik`)
            setLoading(false)
            return
          }
        }
        
        questionsObj[`q${i + 1}`] = {
          text: q.text.trim(),
          options: q.options.map((opt) => opt.trim()),
          correctIndex: q.correctIndex,
          explanation: q.explanation.trim(),
          videoAnswer: q.videoAnswer?.trim() || undefined,
          imageAnswer: imageUrl || q.imageAnswer?.trim() || undefined,
        }
      }

      console.log("[v0] Calling createTest function")
      await createTest({
        title: title.trim(),
        description: description.trim(),
        durationMinutes,
        createdAt: new Date().toISOString(),
        questions: questionsObj,
      })

      console.log("[v0] Test created successfully")
      router.push("/admin")
    } catch (error: any) {
      console.error("[v0] Error creating test:", error)

      if (error.code === "permission-denied") {
        setError("Appwrite ma'lumotlar bazasiga kirish ruxsati yo'q.")
      } else if (error.code === "unauthenticated") {
        setError("Autentifikatsiya xatosi. Qaytadan tizimga kiring.")
      } else {
        setError(`Test yaratishda xatolik: ${error.message || "Noma'lum xatolik"}`)
      }
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-3xl font-bold mb-2">Yangi Test Yaratish</h1>
            <p className="text-muted-foreground">Test ma'lumotlarini va savollarini kiriting</p>
          </div>

      

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Test Ma'lumotlari</CardTitle>
                <CardDescription>Asosiy test ma'lumotlarini kiriting</CardDescription>
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

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Savollar ({questions.length})</CardTitle>
                    <CardDescription>Test savollarini qo'shing va tahrirlang</CardDescription>
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

                      <div className="border-t pt-4 space-y-4">
                        <h4 className="font-medium text-sm">Qo'shimcha Javoblar (ixtiyoriy)</h4>
                        
                        <div className="space-y-2">
                          <Label>YouTube Video Javob URL</Label>
                          <Input
                            type="url"
                            value={question.videoAnswer || ""}
                            onChange={(e) => updateQuestion(qIndex, "videoAnswer", e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                          />
                          <p className="text-xs text-muted-foreground">
                            YouTube video havola qo'shib, foydalanuvchilarga video qilish imkonini bering
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Rasmli Javob (Surat)</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const updated = [...questions]
                                updated[qIndex].imageFile = file
                                setQuestions(updated)
                              }
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Javobni tushuntiruvchi surat qo'shing (PNG, JPG, WebP)
                          </p>
                          {question.imageFile && (
                            <p className="text-xs text-green-600">
                              ✓ Fayl tanlab olingan: {question.imageFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/admin">
                <Button type="button" variant="outline">
                  Bekor qilish
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saqlanmoqda..." : "Testni Saqlash"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
