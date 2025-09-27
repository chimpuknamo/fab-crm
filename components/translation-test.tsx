"use client"

import { useLanguage } from "@/contexts/language-context"

export function TranslationTest() {
  const { t, currentLanguage, isLoading } = useLanguage()

  if (isLoading) {
    return <div>Loading translations...</div>
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-sm max-w-sm">
      <div className="mb-2">
        <strong>Translation Test</strong>
      </div>
      <div className="space-y-1">
        <div>Current: {currentLanguage.name} ({currentLanguage.code})</div>
        <div>Hero Title: {t("hero.title")}</div>
        <div>CTA: {t("cta.lets_cocreate")}</div>
        <div>Nav About: {t("navigation.about")}</div>
        <div>Common Loading: {t("common.loading")}</div>
      </div>
    </div>
  )
}