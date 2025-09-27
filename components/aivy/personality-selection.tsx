'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, Users, Target, BookOpen, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PersonalityOption {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  borderColor: string
}

interface PersonalitySelectionProps {
  onPersonalitySelect: (personality: string) => void
  onSkip: () => void
}

const personalityOptions: PersonalityOption[] = [
  {
    id: 'educator',
    name: 'AIVY Educator',
    description: 'Educational expertise & pedagogical insights',
    icon: BookOpen,
    color: 'text-fabriiq-primary',
    bgColor: 'bg-fabriiq-primary/10',
    borderColor: 'border-fabriiq-primary/30'
  },
  {
    id: 'strategist',
    name: 'AIVY Strategist', 
    description: 'Partnership strategy & institutional transformation',
    icon: Target,
    color: 'text-fabriiq-teal',
    bgColor: 'bg-fabriiq-teal/10',
    borderColor: 'border-fabriiq-teal/30'
  },
  {
    id: 'innovator',
    name: 'AIVY Innovator',
    description: 'Cutting-edge technology & AI solutions',
    icon: Brain,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30'
  },
  {
    id: 'consultant',
    name: 'AIVY Consultant',
    description: 'Business solutions & operational excellence',
    icon: Users,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/30'
  },
  {
    id: 'creative',
    name: 'AIVY Creative',
    description: 'Engaging experiences & gamification',
    icon: Lightbulb,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30'
  },
  {
    id: 'friendly',
    name: 'AIVY Assistant',
    description: 'Helpful, approachable & conversational',
    icon: Sparkles,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/30'
  }
]

export function PersonalitySelection({ onPersonalitySelect, onSkip }: PersonalitySelectionProps) {
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null)

  const handleSelect = (personalityId: string) => {
    setSelectedPersonality(personalityId)
  }

  const handleConfirm = () => {
    if (selectedPersonality) {
      onPersonalitySelect(selectedPersonality)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-fabriiq-primary/10 rounded-full border border-fabriiq-primary/20">
              <Sparkles className="w-8 h-8 text-fabriiq-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            First thing, choose how I should sound. 
            <span className="inline-block ml-2">
              🎯
            </span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {personalityOptions.map((option, index) => {
            const Icon = option.icon
            const isSelected = selectedPersonality === option.id
            
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleSelect(option.id)}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left hover:scale-105 ${
                  isSelected 
                    ? `${option.bgColor} ${option.borderColor} shadow-lg scale-105` 
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${option.bgColor} ${option.borderColor} border`}>
                    <Icon className={`w-6 h-6 ${option.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
                      {option.name}
                      {isSelected && (
                        <span className="ml-2 text-2xl">
                          ✨
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-fabriiq-primary rounded-full flex items-center justify-center"
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onSkip}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800 px-8 py-3 rounded-full"
          >
            I'll do it later
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedPersonality}
            className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
              selectedPersonality
                ? 'bg-fabriiq-primary hover:bg-fabriiq-primary/90 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Choose personality
          </Button>
        </div>
      </div>
    </div>
  )
}