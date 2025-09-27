'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContactInfo {
  name: string
  phone: string
  organization: string
}

interface ContactCollectionProps {
  onComplete: (contactInfo: ContactInfo) => void
  isSubmitting?: boolean
}

type Step = 'welcome' | 'terms' | 'name' | 'phone' | 'organization' | 'completed'

export function ContactCollection({ onComplete, isSubmitting = false }: ContactCollectionProps) {
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    phone: '',
    organization: ''
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('terms')
        break
      case 'terms':
        if (agreedToTerms) {
          setCurrentStep('name')
        }
        break
      case 'name':
        if (contactInfo.name.trim()) {
          setCurrentStep('phone')
        }
        break
      case 'phone':
        if (contactInfo.phone.trim()) {
          setCurrentStep('organization')
        }
        break
      case 'organization':
        if (contactInfo.organization.trim()) {
          handleSubmit()
        }
        break
    }
  }

  const handleSubmit = async () => {
    setCurrentStep('completed')
    onComplete(contactInfo)
  }

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext()
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'terms':
        return agreedToTerms
      case 'name':
        return contactInfo.name.trim().length > 0
      case 'phone':
        return contactInfo.phone.trim().length > 0
      case 'organization':
        return contactInfo.organization.trim().length > 0
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-white">
                  Hello! I'm AIVY. 🤖
                </h1>
                <h2 className="text-2xl text-gray-300">
                  A couple of things first...
                </h2>
              </div>

              <div className="space-y-6 text-left max-w-md mx-auto">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-fabriiq-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">
                    We take data privacy seriously, as described in our{' '}
                    <a href="/privacy" className="text-fabriiq-primary hover:text-fabriiq-teal underline">
                      Privacy Policy
                    </a>.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-fabriiq-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">
                    Our chats help us understand your educational needs and partnership interests.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-fabriiq-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">
                    You can learn more about our service in our{' '}
                    <a href="/terms" className="text-fabriiq-primary hover:text-fabriiq-teal underline">
                      Terms of Service
                    </a>.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="bg-fabriiq-primary hover:bg-fabriiq-primary/90 text-white px-8 py-3 rounded-full"
              >
                Continue
              </Button>
            </motion.div>
          )}

          {currentStep === 'terms' && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-2 text-gray-300">
                  <Check className="w-5 h-5 text-fabriiq-primary" />
                  <span>I agree to the Terms of Service and have read the Privacy Policy</span>
                </div>

                <p className="text-gray-300 text-lg">
                  Since our chats stay between us, it's important to chat safely and responsibly. 
                  Can you tell me more about yourself?
                </p>

                <div className="space-y-4">
                  <label className="flex items-center justify-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={agreedToTerms}
                      onChange={() => setAgreedToTerms(true)}
                      className="w-5 h-5 text-fabriiq-primary focus:ring-fabriiq-primary"
                    />
                    <span className="text-gray-300">I am 18 years old or over</span>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`px-8 py-3 rounded-full ${
                  canProceed()
                    ? 'bg-fabriiq-primary hover:bg-fabriiq-primary/90 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {(currentStep === 'name' || currentStep === 'phone' || currentStep === 'organization') && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {currentStep === 'name' && "What's your name?"}
                  {currentStep === 'phone' && "What's your phone number?"}
                  {currentStep === 'organization' && "What's your organization?"}
                </h2>
                <p className="text-gray-300">
                  {currentStep === 'name' && "This helps me personalize our conversation"}
                  {currentStep === 'phone' && "So our team can follow up with you"}
                  {currentStep === 'organization' && "To better understand your educational context"}
                </p>
              </div>

              <div className="relative max-w-md mx-auto">
                <input
                  type={currentStep === 'phone' ? 'tel' : 'text'}
                  value={
                    currentStep === 'name' ? contactInfo.name :
                    currentStep === 'phone' ? contactInfo.phone :
                    contactInfo.organization
                  }
                  onChange={(e) => {
                    const field = currentStep === 'name' ? 'name' :
                                  currentStep === 'phone' ? 'phone' : 'organization'
                    handleInputChange(field, e.target.value)
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    currentStep === 'name' ? "Enter your full name" :
                    currentStep === 'phone' ? "Enter your phone number" :
                    "Enter your organization name"
                  }
                  className="w-full px-6 py-4 text-lg border-2 border-gray-600 rounded-full focus:border-fabriiq-primary focus:ring-0 focus:outline-none transition-colors bg-gray-800 text-white placeholder-gray-400"
                  autoFocus
                />
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${
                    canProceed()
                      ? 'bg-fabriiq-primary hover:bg-fabriiq-primary/90 text-white hover:scale-110'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>

              {currentStep === 'phone' && (
                <p className="text-center text-sm text-gray-400">
                  We'll only use this to contact you about FabriiQ partnership opportunities
                </p>
              )}
            </motion.div>
          )}

          {currentStep === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  Perfect! Let's get started.
                </h2>
                <p className="text-gray-300">
                  {isSubmitting ? 'Saving your information...' : 'Connecting you to our AI assistant...'}
                </p>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fabriiq-primary"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}