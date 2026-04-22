import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes"
import { ClientOnlyAuth } from "@/components/client-only-auth"
import { Header } from "@/components/header"
import { Suspense } from "react"
import "./globals.css"
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: "Test Platform",
  description: "Educational Testing Platform",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ClientOnlyAuth>
            <Suspense fallback={<div>Loading...</div>}>
              <Header />
              <main className="min-h-screen bg-background">{children}</main>
              <Footer/>
            </Suspense>
          </ClientOnlyAuth>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
