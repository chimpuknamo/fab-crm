"use client"

import { useLanguage } from "@/contexts/language-context"
import { useEffect, useState } from "react"

export function TranslationLoader({ children }: { children: React.ReactNode }) {
  const { isLoading, currentLanguage } = useLanguage()
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (isLoading && retryCount > 3) {
      setError("Failed to load translations. Please refresh the page.")
    }
  }, [isLoading, retryCount])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    setError(null)
    window.location.reload()
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4 text-center max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <span className="text-destructive text-2xl">⚠</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Translation Error</h2>
          <p className="text-muted-foreground text-sm">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">
            Loading {currentLanguage.name}...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
