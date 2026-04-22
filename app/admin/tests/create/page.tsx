"use client"
export const dynamic = 'force-dynamic'

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
import { Plus, Trash2, Save, ArrowLeft, Image as ImageIcon, Youtube } from "lucide-react"
import Link from "next/link"

// ✅ TUZATILDI: uploadImage funksiyasini appwrite.ts dan olamiz
import { createTest, uploadImage, type Question } from "@/lib/appwrite"

interface QuestionForm {
  text: string
  options: string[]
  correctIndex: number
  explanation: string
  imageFile?: File | null
  youtubeUrl?: string
}

export default function CreateTestPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [durationMinutes, setDurationMinutes] = useState(15)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      text: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: "",
      imageFile: null,
      youtubeUrl: "",
    }
  ])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        explanation: "",
        imageFile: null,
        youtubeUrl: "",
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

    if (!user) {
      setError("Foydalanuvchi tizimga kirmagan")
      return
    }

    if (user.role !== "admin") {
      setError("Faqat adminlar test yarata oladi")
      return
    }

    if (!title.trim() || !description.trim()) {
      setError("Sarlavha va tavsif kiritilishi shart")
      return
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text.trim()) return setError(`${i + 1}-savol matni kiritilmagan`)
      if (q.options.some((opt) => !opt.trim())) return setError(`${i + 1}-savolda bo'sh variantlar mavjud`)
      if (!q.explanation.trim()) return setError(`${i + 1}-savol uchun izoh kiritilmagan`)
    }

    setLoading(true)

    try {
      const questionsObj: Record<string, Question> = {}

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        let uploadedImageId: string | undefined = undefined

        // ✅ TUZATILDI: uploadImage funksiyasi Permission.read(Role.any()) bilan yuklaydi
        if (q.imageFile) {
          try {
            uploadedImageId = await uploadImage(q.imageFile)
          } catch (uploadError) {
            throw new Error(`${i + 1}-savol rasmini yuklashda xatolik yuz berdi.`)
          }
        }

        questionsObj[`q${i + 1}`] = {
          text: q.text.trim(),
          options: q.options.map((opt) => opt.trim()),
          correctIndex: q.correctIndex,
          explanation: q.explanation.trim(),
          explanationImageId: uploadedImageId,
          youtubeUrl: q.youtubeUrl?.trim() || undefined,
        }
      }

      await createTest({
        title: title.trim(),
        description: description.trim(),
        durationMinutes,
        createdAt: new Date().toISOString(),
        questions: questionsObj,
      })

      router.push("/admin")
    } catch (error: any) {
      console.error("Test yaratishda xatolik:", error)
      setError(`Test yaratishda xatolik: ${error.message || "Noma'lum xatolik"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
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
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Tavsif</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Davomiyligi (daqiqa)</Label>
                  <Input id="duration" type="number" min="1" value={durationMinutes} onChange={(e) => setDurationMinutes(Number.parseInt(e.target.value))} required />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Savollar ({questions.length})</CardTitle>
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
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(qIndex)} className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Savol matni</Label>
                        <Textarea value={question.text} onChange={(e) => updateQuestion(qIndex, "text", e.target.value)} required />
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
                            />
                            <div className="flex-1">
                              <Input value={option} onChange={(e) => updateOption(qIndex, oIndex, e.target.value)} placeholder={`Variant ${oIndex + 1}`} required />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <Label>Izoh (Matnli tushuntirish)</Label>
                        <Textarea value={question.explanation} onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)} required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t mt-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                            Tushuntirish Rasmi (Ixtiyoriy)
                          </Label>
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => updateQuestion(qIndex, "imageFile", e.target.files?.[0] || null)}
                          />
                          <p className="text-xs text-muted-foreground">Xato javob berilganda ko'rsatiladigan rasm</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Youtube className="h-4 w-4 text-red-500" />
                            YouTube Video Havolasi (Ixtiyoriy)
                          </Label>
                          <Input 
                            type="url" 
                            placeholder="https://youtu.be/..."
                            value={question.youtubeUrl || ""}
                            onChange={(e) => updateQuestion(qIndex, "youtubeUrl", e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">Mavzuni tushuntirib beruvchi video linki</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/admin">
                <Button type="button" variant="outline">Bekor qilish</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Test Saqlanmoqda..." : "Testni Saqlash"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
