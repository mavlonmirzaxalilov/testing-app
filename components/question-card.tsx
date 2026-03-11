"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ChevronRight, SkipForward } from "lucide-react"
import type { Question, Answer } from "@/lib/appwrite"

interface QuestionCardProps {
  questionId: string
  question: Question
  questionNumber: number
  totalQuestions: number
  currentAnswer?: Answer
  onAnswer: (questionId: string, selectedIndex: number) => void
  onSkip: (questionId: string) => void
  onNext: () => void
}

export function QuestionCard({
  questionId,
  question,
  questionNumber,
  totalQuestions,
  currentAnswer,
  onAnswer,
  onSkip,
  onNext,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>("")

  // Har yangi savol yoki currentAnswer kelganda reset qilish
  useEffect(() => {
    if (currentAnswer?.status === "answered" && currentAnswer.selectedIndex !== undefined) {
      setSelectedOption(currentAnswer.selectedIndex.toString())
    } else {
      setSelectedOption("")
    }
  }, [questionId, currentAnswer])

  const handleOptionChange = (value: string) => {
    setSelectedOption(value)
    onAnswer(questionId, Number.parseInt(value))
  }

  const handleSkip = () => {
    onSkip(questionId)
    onNext()
  }

  const handleNext = () => {
    onNext()
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Savol {questionNumber} / {totalQuestions}
          </span>
          <div className="w-full max-w-xs bg-muted rounded-full h-2 ml-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
        <CardTitle className="text-xl text-balance">{question.text}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedOption} onValueChange={handleOptionChange} className="space-y-3">
          {question.options.map((option, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={handleSkip} className="flex items-center gap-2 bg-transparent">
            <SkipForward className="h-4 w-4" />
            O'tkazib yuborish
          </Button>

          <Button
            onClick={handleNext}
            disabled={!selectedOption && currentAnswer?.status !== "answered"}
            className="flex items-center gap-2"
          >
            {questionNumber === totalQuestions ? "Yakunlash" : "Keyingi"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
