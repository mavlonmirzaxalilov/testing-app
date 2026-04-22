"use client"
export const dynamic = 'force-dynamic'

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Clock, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4 text-balance">Test Platformasiga Xush Kelibsiz</h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Zamonaviy onlayn test tizimi orqali bilimlaringizni sinab ko'ring
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader className='flex flex-col items-center justify-center text-center'>
                <Clock className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Vaqtli Testlar</CardTitle>
                <CardDescription>Vaqt chegarasi bilan professional testlar</CardDescription>
              </CardHeader>
            </Card>

            <Card> 
              <CardHeader className="flex flex-col items-center justify-center text-center">
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Batafsil Natijalar</CardTitle>
                <CardDescription>To'g'ri va noto'g'ri javoblar tahlili bilan</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className='flex flex-col items-center justify-center text-center'>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>Test yaratish va natijalarni kuzatish imkoniyati</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg">Ro'yxatdan O'tish</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg">
                Kirish
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Xush kelibsiz, {user.displayName || user.email}!</h1>
          <p className="text-muted-foreground">
            {user.role === "admin"
              ? "Admin panelidan testlarni boshqaring va natijalarni ko'ring"
              : "Mavjud testlarni ko'ring va bilimlaringizni sinab ko'ring"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Testlar
              </CardTitle>
              <CardDescription>Mavjud testlarni ko'ring va boshlang</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tests">
                <Button className="w-full">Testlarni Ko'rish</Button>
              </Link>
            </CardContent>
          </Card>

          {user.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Admin Panel
                </CardTitle>
                <CardDescription>Testlarni boshqaring va natijalarni ko'ring</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin">
                  <Button className="w-full">Admin Panelga O'tish</Button>
                </Link>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}
