"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Language configuration
export const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
]

// Translation cache to store loaded translations
const translationCache: Record<string, any> = {}

// Essential fallback translations to avoid loading delays
const fallbackTranslations = {
  'en': {
    'hero.alpha_status': 'Alpha Development Phase - Partnership Opportunities Available',
    'hero.description_detailed': 'One platform. All operations. Purpose-built for education.',
    'cta.explore_core_capabilities': 'Explore Core Capabilities',
    'cta.become_development_partner': 'Become a Development Partner',
    'homepage.sections.key_cornerstones.title_key': '6 Key',
    'homepage.sections.key_cornerstones.title_cornerstones': 'Cornerstones',
    'homepage.sections.key_cornerstones.description': 'Purpose-built features designed specifically for educational institutions, not generic solutions adapted for schools.',
    'homepage.sections.key_cornerstones.features.aivy.title': 'AIVY Multi-Agent Intelligence',
    'homepage.sections.key_cornerstones.features.multi_campus.title': 'Multi-Campus Operations',
    'homepage.sections.key_cornerstones.features.privacy_compliance.title': 'Privacy-by-Design Compliance'
  }
}

// Deep merge function to properly combine nested objects
const deepMerge = (target: any, source: any): any => {
  const result = { ...target }
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
  }
  
  return result
}

// Load translations for a specific language
const loadTranslations = async (languageCode: string): Promise<any> => {
  if (translationCache[languageCode]) {
    return translationCache[languageCode]
  }

  try {
    // First try to load the main language file
    let translations = {}
    
    try {
      const mainResponse = await fetch(`/locales/${languageCode}.json`)
      if (mainResponse.ok) {
        translations = await mainResponse.json()
      }
    } catch (e) {
      // Main file not found, using directory structure
    }
    
    // Load only essential files initially for faster load times
    const essentialFiles = ['common', 'navigation', 'homepage']
    
    for (const file of essentialFiles) {
      try {
        const response = await fetch(`/locales/${languageCode}/${file}.json`)
        if (response.ok) {
          const fileData = await response.json()
          // File loaded successfully
          // Deep merge to preserve existing nested structures
          translations = deepMerge(translations, fileData)
        }
      } catch (e) {
        // Continue if individual file fails with detailed logging
        // File not found, skipping
      }
    }
    
    if (Object.keys(translations).length === 0) {
      throw new Error(`No translations found for ${languageCode}`)
    }
    
    translationCache[languageCode] = translations
    // Translation cache updated
    return translations
  } catch (error) {
    console.error(`Error loading translations for ${languageCode}:`, error)
    // Fallback to English if available, otherwise return empty object
    if (languageCode !== 'en' && translationCache.en) {
      return translationCache.en
    }
    return {}
  }
}

// Helper function to get nested translation value
const getNestedTranslation = (obj: any, path: string): string => {
  const pathParts = path.split('.')
  let current = obj
  let debugPath = ''
  
  for (let i = 0; i < pathParts.length; i++) {
    const key = pathParts[i]
    debugPath += (i > 0 ? '.' : '') + key
    
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      // Translation path not found
      return path // Return original key if path is broken
    }
  }
  
  return current || path
}

type LanguageContextType = {
  currentLanguage: (typeof languages)[0]
  setLanguage: (code: string) => void
  t: (key: string, params?: Record<string, string | number>, options?: { returnObjects?: boolean }) => any
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(languages[0])
  const [currentTranslations, setCurrentTranslations] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Detect browser language and load saved preference
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const initializeLanguage = async () => {
      const detectLanguage = () => {
        // First, try to get saved language from localStorage
        if (typeof window !== 'undefined') {
          const savedLanguage = localStorage.getItem("language")
          if (savedLanguage) {
            const lang = languages.find((l) => l.code === savedLanguage)
            if (lang) return lang
          }
          
          // If no saved language, try to detect from browser
          const browserLang = navigator.language || navigator.languages?.[0] || 'en'
          const langCode = browserLang.split('-')[0].toLowerCase()
          
          // Find matching language or default to English
          const detectedLang = languages.find((l) => l.code === langCode)
          return detectedLang || languages[0] // Default to English
        }
        
        return languages[0] // Default to English for SSR
      }
      
      const initialLanguage = detectLanguage()
      setCurrentLanguage(initialLanguage)
      
      // Load translations for the detected language
      const translations = await loadTranslations(initialLanguage.code)
      setCurrentTranslations(translations)
      
      // Set document properties only on client side
      if (typeof window !== 'undefined') {
        document.documentElement.lang = initialLanguage.code
        document.documentElement.dir = initialLanguage.code === "ar" ? "rtl" : "ltr"
      }
      
      setIsLoading(false)
    }

    initializeLanguage()
  }, [isMounted])

  const setLanguage = async (code: string) => {
    const newLang = languages.find((l) => l.code === code)
    if (newLang && typeof window !== 'undefined') {
      setIsLoading(true)
      setCurrentLanguage(newLang)
      localStorage.setItem("language", code)
      document.documentElement.lang = code
      document.documentElement.dir = code === "ar" ? "rtl" : "ltr"
      
      // Load translations for the new language
      const translations = await loadTranslations(code)
      setCurrentTranslations(translations)
      setIsLoading(false)
    }
  }

  // Translation function with parameter interpolation
  const t = (key: string, params?: Record<string, string | number>, options?: { returnObjects?: boolean }): any => {
    let translation = getNestedTranslation(currentTranslations, key)
    
    // If translation not found, try fallback translations first
    if (translation === key) {
      const fallback = fallbackTranslations['en'] as any
      if (fallback && fallback[key]) {
        translation = fallback[key]
      } else if (currentLanguage.code !== 'en' && translationCache.en) {
        translation = getNestedTranslation(translationCache.en, key)
      }
    }
    
    // If returnObjects is true, return the object as-is
    if (options?.returnObjects) {
      return translation
    }
    
    // If translation is an object and returnObjects is not explicitly true, return the key
    if (typeof translation === 'object' && translation !== null) {
      return key
    }
    
    // Parameter interpolation (only for strings)
    if (params && translation !== key && typeof translation === 'string') {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`{${param}}`, 'g'), String(value))
      })
    }
    
    return translation
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}