'use client'

import { useState } from 'react'
import { User, Phone, Building2, Briefcase, Mail } from 'lucide-react'

interface ContactInfo {
  name: string
  phone: string
  email?: string
  organization?: string
  role?: string
}

interface ContactCollectionProps {
  onContactSubmit: (contactInfo: ContactInfo) => void
  isSubmitting?: boolean
}

export function ContactCollection({ onContactSubmit, isSubmitting = false }: ContactCollectionProps) {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    phone: '',
    email: '',
    organization: '',
    role: ''
  })

  const [errors, setErrors] = useState<Partial<ContactInfo>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactInfo> = {}
    
    if (!contactInfo.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!contactInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(contactInfo.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (contactInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onContactSubmit(contactInfo)
    }
  }

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-[#F9FAFB] to-[#D8E3E0] rounded-lg border border-[#5A8A84]/20">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-[#1F504B] to-[#5A8A84] rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-[#1F504B] mb-2">
          Welcome to Your Strategic Consultation
        </h3>
        <p className="text-[#1F504B]/70 text-sm leading-relaxed">
          I'm AIVY, your executive conversation partner. To provide you with the most relevant insights for your institution, 
          I'd like to know a bit about you. This helps me tailor our discussion to your specific context and challenges.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#1F504B] mb-1">
            Your Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5A8A84]" />
            <input
              id="name"
              type="text"
              value={contactInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Dr. Sarah Johnson"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] transition-colors ${
                errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              disabled={isSubmitting}
            />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[#1F504B] mb-1">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5A8A84]" />
            <input
              id="phone"
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] transition-colors ${
                errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              disabled={isSubmitting}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#1F504B] mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5A8A84]" />
            <input
              id="email"
              type="email"
              value={contactInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="sarah.johnson@university.edu"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] transition-colors ${
                errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              disabled={isSubmitting}
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Organization Field */}
        <div>
          <label htmlFor="organization" className="block text-sm font-medium text-[#1F504B] mb-1">
            Institution/Organization
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5A8A84]" />
            <input
              id="organization"
              type="text"
              value={contactInfo.organization}
              onChange={(e) => handleInputChange('organization', e.target.value)}
              placeholder="Springfield University"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] bg-white transition-colors"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Role Field */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-[#1F504B] mb-1">
            Your Role
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5A8A84]" />
            <input
              id="role"
              type="text"
              value={contactInfo.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              placeholder="VP of Academic Affairs"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] bg-white transition-colors"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#1F504B] to-[#5A8A84] text-white py-3 px-4 rounded-lg font-medium hover:from-[#5A8A84] hover:to-[#1F504B] transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? 'Starting Conversation...' : 'Begin Strategic Consultation'}
          </button>
        </div>
      </form>

      <div className="mt-4 text-center">
        <p className="text-xs text-[#1F504B]/50">
          Your information is secure and will only be used to enhance our conversation and provide follow-up resources.
        </p>
      </div>
    </div>
  )
}