import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { TranslationLoader } from "@/components/translation-loader"
import { BusinessProfileHeader } from "@/components/business-profile-header"
import { CookiesBanner } from "@/components/cookies-banner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FabriiQ - The First School Operating System",
  description:
    "Co-create the future of educational technology with FabriiQ - the comprehensive School Operating System designed for modern educational excellence.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
        sizes: "32x32",
      },
      {
        url: "/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
      {
        url: "/fabriiQ-logo.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={false}
          disableTransitionOnChange
          suppressHydrationWarning
        >
          <LanguageProvider>
            <TranslationLoader>
              <BusinessProfileHeader />
              {children}
              <CookiesBanner />
            </TranslationLoader>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
