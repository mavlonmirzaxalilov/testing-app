"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Download, BarChart3 } from "lucide-react"
import { getTests, getResults, getUserData, type Test, type Result, type User } from "@/lib/appwrite"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function ResultsPage() {
  const { user } = useAuth()
  const [tests, setTests] = useState<Test[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [users, setUsers] = useState<Record<string, User>>({})
  const [filteredResults, setFilteredResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTest, setSelectedTest] = useState<string>("all")

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[v0] Loading admin results data...")
        console.log("[v0] Current user:", user)

        if (!user) {
          throw new Error("User not authenticated")
        }

        if (user.role !== "admin") {
          throw new Error("User is not an admin")
        }

        const [testsData, resultsData] = await Promise.all([getTests(), getResults()])
        console.log("[v0] Loaded tests:", testsData.length)
        console.log("[v0] Loaded results:", resultsData.length)

        setTests(testsData)
        setResults(resultsData)
        setFilteredResults(resultsData)

        const uniqueUserIds = [...new Set(resultsData.map((r) => r.userId))]
        const usersData: Record<string, User> = {}

        for (const userId of uniqueUserIds) {
          try {
            const userData = await getUserData(userId)
            if (userData) {
              usersData[userId] = userData
            }
          } catch (err) {
            console.warn("[v0] Failed to load user data for:", userId, err)
          }
        }

        setUsers(usersData)
        console.log("[v0] Loaded user data for", Object.keys(usersData).length, "users")
      } catch (error: any) {
        console.error("[v0] Error loading results:", error)
        setError(error.message || "Failed to load results")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  useEffect(() => {
    let filtered = results

    if (selectedTest !== "all") {
      filtered = filtered.filter((r) => r.testId === selectedTest)
    }

    if (searchTerm) {
      filtered = filtered.filter((r) => {
        const userData = users[r.userId]
        const fullName = userData ? `${userData.firstName} ${userData.lastName}` : r.userId
        return (
          fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.userId.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    setFilteredResults(filtered)
  }, [results, selectedTest, searchTerm, users])

  const exportToCSV = () => {
    const csvContent = [
      ["Test", "Foydalanuvchi", "To'g'ri", "Noto'g'ri", "O'tkazilgan", "Ball", "Foiz", "Sana"].join(","),
      ...filteredResults.map((result) => {
        const test = tests.find((t) => t.id === result.testId)
        const userData = users[result.userId]
        const userName = userData ? `${userData.firstName} ${userData.lastName}` : result.userId
        const totalQuestions = test
          ? Object.keys(test.questions).length
          : result.correctCount + result.wrongCount + result.skipped.length
        const percentage = Math.round((result.correctCount / totalQuestions) * 100)

        return [
          test?.title || "Test topilmadi",
          userName,
          result.correctCount,
          result.wrongCount,
          result.skipped.length,
          result.score,
          `${percentage}%`,
          new Date(result.completedAt).toLocaleDateString("uz-UZ"),
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `test-results-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute adminOnly>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Xatolik yuz berdi</CardTitle>
                <CardDescription>Ma'lumotlarni yuklashda muammo yuz berdi</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Mumkin bo'lgan yechimlar:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Firebase Firestore qoidalarini tekshiring</li>
                    <li>Admin huquqlaringiz borligini tasdiqlang</li>
                    <li>Internet aloqangizni tekshiring</li>
                    <li>Sahifani qayta yuklang</li>
                  </ul>
                </div>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Qayta yuklash
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Admin Dashboardga qaytish
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Test Natijalari</h1>
                <p className="text-muted-foreground">Barcha test natijalarini ko'ring va tahlil qiling</p>
              </div>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                CSV Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filtrlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Foydalanuvchi ismi bo'yicha qidirish..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedTest} onValueChange={setSelectedTest}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Test tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha testlar</SelectItem>
                    {tests.map((test) => (
                      <SelectItem key={test.id} value={test.id}>
                        {test.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Natijalar ({filteredResults.length})
              </CardTitle>
              <CardDescription>
                {selectedTest !== "all" && tests.find((t) => t.id === selectedTest)?.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredResults.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Natijalar topilmadi</h3>
                  <p className="text-muted-foreground">Filtrlarni o'zgartirib ko'ring</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredResults.map((result) => {
                    const test = tests.find((t) => t.id === result.testId)
                    const userData = users[result.userId]
                    const userName = userData ? `${userData.firstName} ${userData.lastName}` : result.userId
                    const totalQuestions = test
                      ? Object.keys(test.questions).length
                      : result.correctCount + result.wrongCount + result.skipped.length
                    const percentage = Math.round((result.correctCount / totalQuestions) * 100)

                    return (
                      <div key={`${result.userId}_${result.testId}`} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{test?.title || "Test topilmadi"}</h3>
                            <p className="text-sm text-muted-foreground">
                              Foydalanuvchi: {userName} •{" "}
                              {new Date(result.completedAt).toLocaleDateString("uz-UZ", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <Badge
                            variant={percentage >= 70 ? "default" : percentage >= 50 ? "secondary" : "destructive"}
                          >
                            {percentage}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{result.correctCount}</div>
                            <div className="text-muted-foreground">To'g'ri</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-red-600">{result.wrongCount}</div>
                            <div className="text-muted-foreground">Noto'g'ri</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-orange-600">{result.skipped.length}</div>
                            <div className="text-muted-foreground">O'tkazilgan</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{result.score}</div>
                            <div className="text-muted-foreground">Ball</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
