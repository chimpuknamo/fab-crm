"use client"

import { useLanguage } from "@/contexts/language-context"
import { useEffect } from "react"

export function useDynamicMetadata() {
  const { t } = useLanguage()

  useEffect(() => {
    // Update document title
    document.title = t("hero.title")
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', t("hero.description"))
    }
    
    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', t("hero.title"))
    }
    
    // Update Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', t("hero.description"))
    }
  }, [t])
}