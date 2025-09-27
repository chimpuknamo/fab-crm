"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Handshake, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { FabriiQLogo } from "@/components/fabriiq-logo"

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const leftNavItems = [
    { name: "Home", href: "/" },
    { name: t("navigation.capabilities"), href: "/projects" },
  ]
  
  const rightNavItems = [
    { name: t("navigation.about"), href: "/about" },
    { name: t("navigation.partnership"), href: "/partnership" },
    { name: "AIVY", href: "/aivy" },
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <motion.nav
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 w-full max-w-screen-xl px-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* AIVY-Inspired Island Navigation */}
      <div 
        className={`relative mx-auto px-6 py-3 rounded-full backdrop-blur-xl border transition-all duration-300 w-fit ${
          scrolled 
            ? "bg-fabriiq-primary/10 border-fabriiq-primary/30 shadow-2xl shadow-fabriiq-primary/20" 
            : "bg-black/20 border-fabriiq-teal/20 shadow-xl shadow-black/30"
        }`}
        style={{
          background: scrolled 
            ? "linear-gradient(135deg, rgba(31, 80, 75, 0.15), rgba(90, 138, 132, 0.08))"
            : "linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(31, 80, 75, 0.1))",
        }}
      >
        <div className="flex items-center justify-center space-x-4 lg:space-x-6">
          {/* Left Navigation Items */}
          <div className="hidden lg:flex items-center space-x-6">
            {leftNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={scrollToTop}
                className={`text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  pathname === item.href 
                    ? "text-fabriiq-primary font-semibold" 
                    : "text-white/90 hover:text-fabriiq-teal"
                }`}
              >
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Logo - Larger and more visible */}
          <div className="flex items-center justify-center mx-4">
            <FabriiQLogo onClick={scrollToTop} className="scale-125 lg:scale-150" />
          </div>

          {/* Right Navigation Items */}
          <div className="hidden lg:flex items-center space-x-6">
            {rightNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={scrollToTop}
                className={`text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  pathname === item.href 
                    ? "text-fabriiq-primary font-semibold" 
                    : "text-white/90 hover:text-fabriiq-teal"
                }`}
              >
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Let's Co-Create CTA */}
          <Link 
            href="/partnership" 
            onClick={scrollToTop}
            className="hidden lg:block group relative px-6 py-2 bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal text-white rounded-full font-medium text-sm hover:shadow-lg hover:shadow-fabriiq-primary/30 transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
          >
            <span className="whitespace-nowrap">{t("cta.lets_cocreate")}</span>
          </Link>

          {/* Language Selector */}
          <div className="hidden lg:block">
            <LanguageSelector />
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden absolute right-3 top-1/2 transform -translate-y-1/2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white/90 hover:text-fabriiq-teal p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="lg:hidden absolute top-full left-0 right-0 mt-2 mx-4 rounded-2xl backdrop-blur-xl bg-black/90 border border-fabriiq-teal/30 shadow-2xl"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 py-6 space-y-4">
              {/* All navigation items */}
              {[...leftNavItems, ...rightNavItems].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    setIsOpen(false)
                    scrollToTop()
                  }}
                  className={`block py-3 px-4 rounded-xl transition-all duration-200 ${
                    pathname === item.href
                      ? "text-fabriiq-primary bg-fabriiq-primary/10 border border-fabriiq-primary/30"
                      : "text-white/90 hover:text-fabriiq-teal hover:bg-fabriiq-teal/10"
                  }`}
                >
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}

              <div className="pt-4 border-t border-white/10 space-y-4">
                {/* Let's Co-Create CTA */}
                <Link
                  href="/partnership"
                  onClick={() => {
                    setIsOpen(false)
                    scrollToTop()
                  }}
                  className="block w-full"
                >
                  <div className="bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal text-white rounded-xl py-3 px-4 text-center font-medium whitespace-nowrap">
                    {t("cta.lets_cocreate")}
                  </div>
                </Link>
                
                {/* Language Selector */}
                <div className="flex justify-center">
                  <LanguageSelector />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
