"use client"

import Link from "next/link"
import Image from "next/image"

interface FabriiQLogoProps {
  onClick?: () => void
  className?: string
}

export function FabriiQLogo({ onClick, className = "" }: FabriiQLogoProps) {
  const logoContent = (
    <div className={`flex items-center ${className}`}>
      {/* FabriiQ SVG Logo */}
      <div className="relative">
        <Image
          src="/fabriiQ-logo.svg"
          alt="FabriiQ Logo"
          width={160}
          height={48}
          className="h-12 w-auto transform transition-all duration-300 hover:scale-105"
        />
      </div>
    </div>
  )

  return (
    <Link 
      href="/" 
      className="group transition-all duration-300 hover:scale-[1.02]" 
      onClick={onClick}
    >
      {logoContent}
    </Link>
  )
}