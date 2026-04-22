"use client"
export const dynamic = 'force-dynamic'
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export default function TestEditPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [testTitle, setTestTitle] = useState("")
  const [testDescription, setTestDescription] = useState("")
  const [testDuration, setTestDuration] = useState("120")
  const [testCategory, setTestCategory] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])

  // Redirect if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Ruxsat yo'q</h1>
        <p className="text-muted-foreground mb-4">Bu sahifaga faqat adminlar kirishi mumkin.</p>
        <Button onClick={() => router.push("/")}>Bosh sahifaga qaytish</Button>
      </div>
    )
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)) } : q,
      ),
    )
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const saveTest = () => {
    // Here you would typically save to database
    console.log("Test saved:", {
      title: testTitle,
      description: testDescription,
      duration: testDuration,
      category: testCategory,
      questions,
    })
    alert("Test muvaffaqiyatli saqlandi!")
  }

  const previewTest = () => {
    // Here you would typically navigate to preview
    console.log("Preview test")
    alert("Test ko'rish funksiyasi tez orada qo'shiladi!")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Test Tahrirlash</h1>
          <p className="text-muted-foreground">Yangi test yarating yoki mavjud testni tahrirlang</p>
        </div>

        {/* Test Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Ma'lumotlari</CardTitle>
            <CardDescription>Test haqida asosiy ma'lumotlarni kiriting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Test Nomi</Label>
                <Input
                  id="title"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="Masalan: Matematika asoslari"
                />
              </div>
              <div>
                <Label htmlFor="category">Kategoriya</Label>
                <Select value={testCategory} onValueChange={setTestCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategoriyani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matematika">Matematika</SelectItem>
                    <SelectItem value="fizika">Fizika</SelectItem>
                    <SelectItem value="kimyo">Kimyo</SelectItem>
                    <SelectItem value="biologiya">Biologiya</SelectItem>
                    <SelectItem value="tarix">Tarix</SelectItem>
                    <SelectItem value="adabiyot">Adabiyot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Test Tavsifi</Label>
              <Textarea
                id="description"
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                placeholder="Test haqida qisqacha ma'lumot..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="duration">Davomiyligi (daqiqa)</Label>
              <Select value={testDuration} onValueChange={setTestDuration}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 daqiqa</SelectItem>
                  <SelectItem value="60">60 daqiqa</SelectItem>
                  <SelectItem value="90">90 daqiqa</SelectItem>
                  <SelectItem value="120">120 daqiqa</SelectItem>
                  <SelectItem value="180">180 daqiqa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Savollar</CardTitle>
              <CardDescription>
                Test savollari va javob variantlarini qo'shing
                {questions.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {questions.length} ta savol
                  </Badge>
                )}
              </CardDescription>
            </div>
            <Button onClick={addQuestion} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Savol Qo'shish
            </Button>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Hali savollar qo'shilmagan</p>
                <p className="text-sm">Yuqoridagi tugma orqali savol qo'shing</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <Card key={question.id} className="border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <Badge variant="outline">Savol {index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Savol matni</Label>
                        <Textarea
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                          placeholder="Savolni kiriting..."
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Javob variantlari</Label>
                        <div className="space-y-2 mt-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <Badge
                                variant={question.correctAnswer === optionIndex ? "default" : "outline"}
                                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                                onClick={() => updateQuestion(question.id, "correctAnswer", optionIndex)}
                              >
                                {String.fromCharCode(65 + optionIndex)}
                              </Badge>
                              <Input
                                value={option}
                                onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                placeholder={`${String.fromCharCode(65 + optionIndex)} variant`}
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          To'g'ri javobni belgilash uchun harf belgisiga bosing
                        </p>
                      </div>

                      <div>
                        <Label>Tushuntirish (ixtiyoriy)</Label>
                        <Textarea
                          value={question.explanation || ""}
                          onChange={(e) => updateQuestion(question.id, "explanation", e.target.value)}
                          placeholder="Javob uchun tushuntirish..."
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={previewTest} className="flex items-center gap-2 bg-transparent">
            <Eye className="h-4 w-4" />
            Ko'rib Chiqish
          </Button>
          <Button onClick={saveTest} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Testni Saqlash
          </Button>
        </div>
      </div>
    </div>
  )
}
