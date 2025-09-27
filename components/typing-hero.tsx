"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"

export function TypingHero() {
  const { t } = useLanguage()
  const [displayText, setDisplayText] = useState("")
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  const phrases = useMemo(
    () => [
      { text: t("hero.typing.school_os"), color: "text-fabriiq-primary", cursorColor: "bg-fabriiq-primary" },
      { text: t("hero.typing.educational_intelligence"), color: "text-fabriiq-teal", cursorColor: "bg-fabriiq-teal" },
      { text: t("hero.typing.unified_platform"), color: "text-primary", cursorColor: "bg-primary" },
    ],
    [t],
  )

  const baseText = t("hero.typing.base_text")
  const typingSpeed = 100
  const deletingSpeed = 50
  const pauseTime = 2000

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex].text

    if (!isDeleting && currentCharIndex < currentPhrase.length) {
      // Typing
      const timeout = setTimeout(() => {
        setDisplayText(currentPhrase.substring(0, currentCharIndex + 1))
        setCurrentCharIndex(currentCharIndex + 1)
      }, typingSpeed)
      return () => clearTimeout(timeout)
    } else if (!isDeleting && currentCharIndex === currentPhrase.length) {
      // Pause before deleting
      const timeout = setTimeout(() => {
        setIsDeleting(true)
      }, pauseTime)
      return () => clearTimeout(timeout)
    } else if (isDeleting && currentCharIndex > 0) {
      // Deleting
      const timeout = setTimeout(() => {
        setDisplayText(currentPhrase.substring(0, currentCharIndex - 1))
        setCurrentCharIndex(currentCharIndex - 1)
      }, deletingSpeed)
      return () => clearTimeout(timeout)
    } else if (isDeleting && currentCharIndex === 0) {
      // Move to next phrase
      setIsDeleting(false)
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
    }

    // Cursor blinking
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [currentCharIndex, isDeleting, currentPhraseIndex, phrases])

  return (
    <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter font-mono">
      <div className="flex flex-wrap justify-center">
        <span className="text-white mr-2">{">"}</span>
        <div className="relative">
          <span className="text-white">{baseText}</span>
          <span className={`${phrases[currentPhraseIndex].color} drop-shadow-[0_0_20px_rgba(31,80,75,0.5)]`}>
            {displayText}
          </span>
          {showCursor && (
            <motion.span
              className={`inline-block w-4 h-10 ${phrases[currentPhraseIndex].cursorColor} ml-1`}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            />
          )}
        </div>
      </div>
    </h1>
  )
}
