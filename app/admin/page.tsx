"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen, Users, BarChart3, Edit, Trash2 } from "lucide-react"
import { getTests, getResults, deleteTest, type Test, type Result } from "@/lib/firebase"
import Link from "next/link"

export default function AdminDashboard() {
  const { user } = useAuth()
  const [tests, setTests] = useState<Test[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [testsData, resultsData] = await Promise.all([getTests(), getResults()])
        setTests(testsData)
        setResults(resultsData)
      } catch (error) {
        console.error("Error loading admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleDeleteTest = async (testId: string) => {
    if (!confirm("Testni o'chirishni tasdiqlaysizmi?")) return

    try {
      await deleteTest(testId)
      setTests(tests.filter((t) => t.id !== testId))
    } catch (error) {
      console.error("Error deleting test:", error)
    }
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

  const totalUsers = new Set(results.map((r) => r.userId)).size
  const averageScore =
    results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0

  return (
    <ProtectedRoute adminOnly>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Testlarni boshqaring va natijalarni kuzating</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Jami Testlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{tests.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Jami Foydalanuvchilar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{totalUsers}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Jami Natijalar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{results.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">O'rtacha Ball</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{averageScore}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tests Management */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Testlar Boshqaruvi</CardTitle>
                  <CardDescription>Testlarni yarating, tahrirlang va o'chiring</CardDescription>
                </div>
                <Link href="/admin/tests/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Yangi Test
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {tests.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Hozircha testlar yo'q</h3>
                  <p className="text-muted-foreground mb-4">Birinchi testingizni yarating</p>
                  <Link href="/admin/tests/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Test Yaratish
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {tests.map((test) => {
                    const testResults = results.filter((r) => r.testId === test.id)
                    const avgScore =
                      testResults.length > 0
                        ? Math.round(testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length)
                        : 0

                    return (
                      <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{test.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{Object.keys(test.questions).length} ta savol</span>
                            <span>{test.durationMinutes} daqiqa</span>
                            <span>{testResults.length} ta natija</span>
                            {testResults.length > 0 && <span>O'rtacha: {avgScore} ball</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Faol</Badge>
                          <Link href={`/admin/tests/${test.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTest(test.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Natijalar Ko'rish</CardTitle>
                  <CardDescription>Barcha test natijalarini ko'ring</CardDescription>
                </div>
                <Link href="/admin/results">
                  <Button variant="outline">Batafsil Ko'rish</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Hozircha natijalar yo'q</h3>
                  <p className="text-muted-foreground">
                    Foydalanuvchilar test topshirganda natijalar bu yerda ko'rinadi
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.slice(0, 5).map((result) => {
                    const test = tests.find((t) => t.id === result.testId)
                    const percentage = test
                      ? Math.round((result.correctCount / Object.keys(test.questions).length) * 100)
                      : 0

                    return (
                      <div
                        key={`${result.userId}_${result.testId}`}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{test?.title || "Test topilmadi"}</div>
                          <div className="text-sm text-muted-foreground">
                            Foydalanuvchi: {user?.firstName} {user?.lastName} • {new Date(result.completedAt).toLocaleDateString("uz-UZ")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {result.correctCount} / {result.correctCount + result.wrongCount + result.skipped.length}
                          </div>
                          <div className="text-sm text-muted-foreground">{percentage}%</div>
                        </div>
                      </div>
                    )
                  })}
                  {results.length > 5 && (
                    <div className="text-center pt-4">
                      <Link href="/admin/results">
                        <Button variant="outline">Barcha natijalarni ko'rish ({results.length})</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
