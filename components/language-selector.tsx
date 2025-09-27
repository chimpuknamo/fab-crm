"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage, languages } from "@/contexts/language-context"
import { ChevronDown } from "lucide-react"

export function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 h-8 px-3 text-xs hover:bg-muted/50 transition-colors">
          <span className="text-lg leading-none">{currentLanguage.flag}</span>
          <span className="text-xs font-medium">{currentLanguage.name}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px] p-1">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLanguage(language.code)}
            className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-sm transition-colors ${
              currentLanguage.code === language.code 
                ? 'bg-primary/10 text-primary' 
                : 'hover:bg-muted/50'
            }`}
          >
            <span className="text-lg leading-none">{language.flag}</span>
            <span className="text-sm font-medium flex-1">{language.name}</span>
            {currentLanguage.code === language.code && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
