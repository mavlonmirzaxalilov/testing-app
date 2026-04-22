"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { Card } from "@/components/ui/card"

interface TimerProps {
  startTime: string
  durationMinutes: number
  onTimeUp: () => void
}

export function Timer({ startTime, durationMinutes, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const start = new Date(startTime).getTime()
      const now = new Date().getTime()
      const elapsed = Math.floor((now - start) / 1000)
      const totalSeconds = durationMinutes * 60
      const remaining = Math.max(0, totalSeconds - elapsed)

      if (remaining === 0) {
        onTimeUp()
      }

      return remaining
    }

    setTimeLeft(calculateTimeLeft())

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, durationMinutes, onTimeUp])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const isLowTime = timeLeft < 600 // Less than 10 minutes
  const isCriticalTime = timeLeft < 300 // Less than 5 minutes

  return (
    <Card
      className={`p-4 ${isCriticalTime ? "border-destructive bg-destructive/5" : isLowTime ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" : ""}`}
    >
      <div className="flex items-center gap-2">
        <Clock
          className={`h-5 w-5 ${isCriticalTime ? "text-destructive" : isLowTime ? "text-orange-500" : "text-primary"}`}
        />
        <span
          className={`font-mono text-lg font-semibold ${isCriticalTime ? "text-destructive" : isLowTime ? "text-orange-500" : "text-foreground"}`}
        >
          {formatTime(timeLeft)}
        </span>
        <span className="text-sm text-muted-foreground">qoldi</span>
      </div>
    </Card>
  )
}
