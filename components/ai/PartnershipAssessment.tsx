'use client'

import { useState } from 'react'
import { Building2, Users, Clock, Target, FileText, CheckCircle2, ArrowRight } from 'lucide-react'

interface PartnershipAssessmentData {
  // Institution Information
  institutionName: string
  institutionType: string
  campusCount: number
  studentPopulation: number
  
  // Strategic Contact Information
  primaryContactName: string
  primaryContactEmail: string
  primaryContactPhone: string
  primaryContactRole: string
  
  // Co-Development Partnership Details
  currentTechEcosystem: string
  strategicChallenges: string
  investmentTimeline: string
  partnershipCommitmentLevel: string
  
  // Custom Requirements & Vision
  customRequirements: string
  visionStatement: string
}

interface PartnershipAssessmentProps {
  onAssessmentSubmit: (assessmentData: PartnershipAssessmentData) => void
  contactInfo?: {
    name: string
    email?: string
    phone?: string
    role?: string
    organization?: string
  }
  isSubmitting?: boolean
}

export function PartnershipAssessment({ 
  onAssessmentSubmit, 
  contactInfo, 
  isSubmitting = false 
}: PartnershipAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [assessmentData, setAssessmentData] = useState<PartnershipAssessmentData>({
    institutionName: contactInfo?.organization || '',
    institutionType: '',
    campusCount: 1,
    studentPopulation: 0,
    primaryContactName: contactInfo?.name || '',
    primaryContactEmail: contactInfo?.email || '',
    primaryContactPhone: contactInfo?.phone || '',
    primaryContactRole: contactInfo?.role || '',
    currentTechEcosystem: '',
    strategicChallenges: '',
    investmentTimeline: '',
    partnershipCommitmentLevel: '',
    customRequirements: '',
    visionStatement: ''
  })

  const [errors, setErrors] = useState<Partial<PartnershipAssessmentData>>({})

  const institutionTypes = [
    { value: 'public_university', label: 'Public University' },
    { value: 'private_university', label: 'Private University' },
    { value: 'community_college', label: 'Community College' },
    { value: 'k12_district', label: 'K-12 School District' },
    { value: 'charter_school', label: 'Charter School' },
    { value: 'international_school', label: 'International School' },
    { value: 'vocational_institute', label: 'Vocational Institute' },
    { value: 'other', label: 'Other' }
  ]

  const roles = [
    { value: 'president', label: 'President/Chancellor' },
    { value: 'vp_academic', label: 'VP Academic Affairs' },
    { value: 'vp_technology', label: 'VP Technology/CIO' },
    { value: 'dean', label: 'Dean' },
    { value: 'director_it', label: 'Director of IT' },
    { value: 'director_academic', label: 'Academic Director' },
    { value: 'superintendent', label: 'Superintendent' },
    { value: 'principal', label: 'Principal' },
    { value: 'other_executive', label: 'Other Executive' }
  ]

  const timelines = [
    { value: 'immediate_0_3_months', label: 'Immediate (0-3 months)' },
    { value: 'short_term_3_6_months', label: 'Short-term (3-6 months)' },
    { value: 'medium_term_6_12_months', label: 'Medium-term (6-12 months)' },
    { value: 'long_term_1_2_years', label: 'Long-term (1-2 years)' },
    { value: 'strategic_2_plus_years', label: 'Strategic planning (2+ years)' }
  ]

  const commitmentLevels = [
    { value: 'exploration', label: 'Exploration - Learning about possibilities' },
    { value: 'pilot_program', label: 'Pilot Program - Small-scale testing' },
    { value: 'partial_implementation', label: 'Partial Implementation - Specific departments' },
    { value: 'full_implementation', label: 'Full Implementation - Institution-wide' },
    { value: 'strategic_partnership', label: 'Strategic Partnership - Long-term collaboration' },
    { value: 'co_development', label: 'Co-Development - Joint product development' }
  ]

  const handleInputChange = (field: keyof PartnershipAssessmentData, value: string | number) => {
    setAssessmentData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<PartnershipAssessmentData> = {}

    switch (step) {
      case 1:
        if (!assessmentData.institutionName.trim()) newErrors.institutionName = 'Institution name is required'
        if (!assessmentData.institutionType) newErrors.institutionType = 'Institution type is required'
        if (!assessmentData.campusCount || assessmentData.campusCount < 1) newErrors.campusCount = 'Campus count must be at least 1'
        if (!assessmentData.studentPopulation || assessmentData.studentPopulation < 1) newErrors.studentPopulation = 'Student population is required'
        break
      case 2:
        if (!assessmentData.primaryContactName.trim()) newErrors.primaryContactName = 'Contact name is required'
        if (!assessmentData.primaryContactEmail.trim()) newErrors.primaryContactEmail = 'Email is required'
        if (!assessmentData.primaryContactRole) newErrors.primaryContactRole = 'Role is required'
        break
      case 3:
        if (!assessmentData.currentTechEcosystem.trim()) newErrors.currentTechEcosystem = 'Current technology description is required'
        if (!assessmentData.strategicChallenges.trim()) newErrors.strategicChallenges = 'Strategic challenges description is required'
        if (!assessmentData.investmentTimeline) newErrors.investmentTimeline = 'Investment timeline is required'
        if (!assessmentData.partnershipCommitmentLevel) newErrors.partnershipCommitmentLevel = 'Partnership commitment level is required'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleSubmit = () => {
    if (validateStep(3)) {
      onAssessmentSubmit(assessmentData)
    }
  }

  const steps = [
    { number: 1, title: 'Institution Information', icon: Building2 },
    { number: 2, title: 'Contact Information', icon: Users },
    { number: 3, title: 'Partnership Details', icon: Target },
    { number: 4, title: 'Vision & Requirements', icon: FileText }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-[#1F504B] to-[#5A8A84] rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#1F504B] mb-2">
          Partnership Co-Creation Assessment
        </h2>
        <p className="text-[#1F504B]/70">
          Help us understand your institution's vision and co-development readiness
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number 
                ? 'bg-[#1F504B] border-[#1F504B] text-white' 
                : 'border-gray-300 text-gray-500'
            }`}>
              {currentStep > step.number ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
            <div className="ml-3 hidden sm:block">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-[#1F504B]' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="ml-4 w-5 h-5 text-gray-300 hidden sm:block" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Institution Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#1F504B] mb-4">Institution Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-[#1F504B] mb-1">
                Institution Name *
              </label>
              <input
                type="text"
                value={assessmentData.institutionName}
                onChange={(e) => handleInputChange('institutionName', e.target.value)}
                placeholder="Your educational institution"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] ${
                  errors.institutionName ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.institutionName && <p className="text-red-500 text-xs mt-1">{errors.institutionName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F504B] mb-1">
                Institution Type *
              </label>
              <select
                value={assessmentData.institutionType}
                onChange={(e) => handleInputChange('institutionType', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] ${
                  errors.institutionType ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select institution type</option>
                {institutionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.institutionType && <p className="text-red-500 text-xs mt-1">{errors.institutionType}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#1F504B] mb-1">
                  Campus Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={assessmentData.campusCount}
                  onChange={(e) => handleInputChange('campusCount', parseInt(e.target.value) || 1)}
                  placeholder="Number of campus locations"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] ${
                    errors.campusCount ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.campusCount && <p className="text-red-500 text-xs mt-1">{errors.campusCount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F504B] mb-1">
                  Student Population
                </label>
                <input
                  type="number"
                  min="1"
                  value={assessmentData.studentPopulation}
                  onChange={(e) => handleInputChange('studentPopulation', parseInt(e.target.value) || 0)}
                  placeholder="Total student enrollment"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] ${
                    errors.studentPopulation ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.studentPopulation && <p className="text-red-500 text-xs mt-1">{errors.studentPopulation}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contact Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#1F504B] mb-4">Strategic Contact Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-[#1F504B] mb-1">
                Primary Contact Name *
              </label>
              <input
                type="text"
                value={assessmentData.primaryContactName}
                onChange={(e) => handleInputChange('primaryContactName', e.target.value)}
                placeholder="Executive or decision-maker name"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] ${
                  errors.primaryContactName ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.primaryContactName && <p className="text-red-500 text-xs mt-1">{errors.primaryContactName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F504B] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={assessmentData.primaryContactEmail}
                onChange={(e) => handleInputChange('primaryContactEmail', e.target.value)}
                placeholder="executive.email@institution.edu"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] ${
                  errors.primaryContactEmail ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.primaryContactEmail && <p className="text-red-500 text-xs mt-1">{errors.primaryContactEmail}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F504B] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={assessmentData.primaryContactPhone}
                onChange={(e) => handleInputChange('primaryContactPhone', e.target.value)}
                placeholder="International format preferred"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F504B] mb-1">
                Role/Title *
              </label>
              <select
                value={assessmentData.primaryContactRole}
                onChange={(e) => handleInputChange('primaryContactRole', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] ${
                  errors.primaryContactRole ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select your role</option>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              {errors.primaryContactRole && <p className="text-red-500 text-xs mt-1">{errors.primaryContactRole}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Partnership Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#1F504B] mb-4">Co-Development Partnership Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-[#1F504B] mb-1">
                Current Technology Ecosystem & Strategic Challenges *
              </label>
              <textarea
                value={assessmentData.currentTechEcosystem}
                onChange={(e) => handleInputChange('currentTechEcosystem', e.target.value)}
                placeholder="Describe your current educational technology systems, operational challenges, and strategic digital transformation goals..."
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] ${
                  errors.currentTechEcosystem ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.currentTechEcosystem && <p className="text-red-500 text-xs mt-1">{errors.currentTechEcosystem}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F504B] mb-1">
                Investment Timeline & Readiness *
              </label>
              <select
                value={assessmentData.investmentTimeline}
                onChange={(e) => handleInputChange('investmentTimeline', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] ${
                  errors.investmentTimeline ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select timeline</option>
                {timelines.map(timeline => (
                  <option key={timeline.value} value={timeline.value}>{timeline.label}</option>
                ))}
              </select>
              {errors.investmentTimeline && <p className="text-red-500 text-xs mt-1">{errors.investmentTimeline}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F504B] mb-1">
                Partnership Investment Commitment Level *
              </label>
              <select
                value={assessmentData.partnershipCommitmentLevel}
                onChange={(e) => handleInputChange('partnershipCommitmentLevel', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] ${
                  errors.partnershipCommitmentLevel ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select commitment level</option>
                {commitmentLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              {errors.partnershipCommitmentLevel && <p className="text-red-500 text-xs mt-1">{errors.partnershipCommitmentLevel}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F504B] mb-1">
                Strategic Challenges & Goals
              </label>
              <textarea
                value={assessmentData.strategicChallenges}
                onChange={(e) => handleInputChange('strategicChallenges', e.target.value)}
                placeholder="Describe your institution's key strategic challenges and transformation goals..."
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B] ${
                  errors.strategicChallenges ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.strategicChallenges && <p className="text-red-500 text-xs mt-1">{errors.strategicChallenges}</p>}
            </div>
          </div>
        )}

        {/* Step 4: Vision & Requirements */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#1F504B] mb-4">Custom Requirements & Vision</h3>
            
            <div>
              <label className="block text-sm font-medium text-[#1F504B] mb-1">
                Custom Requirements & Specifications
              </label>
              <textarea
                value={assessmentData.customRequirements}
                onChange={(e) => handleInputChange('customRequirements', e.target.value)}
                placeholder="Describe any specific technical requirements, integration needs, or custom features your institution requires..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F504B] mb-1">
                Institution's Vision Statement
              </label>
              <textarea
                value={assessmentData.visionStatement}
                onChange={(e) => handleInputChange('visionStatement', e.target.value)}
                placeholder="Share your institution's vision for educational technology transformation and how a partnership with FabriiQ would support your strategic goals..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F504B]/20 focus:border-[#1F504B]"
              />
            </div>

            {/* Summary */}
            <div className="bg-[#F9FAFB] p-6 rounded-lg border border-[#5A8A84]/20">
              <h4 className="font-semibold text-[#1F504B] mb-3">Assessment Summary</h4>
              <div className="space-y-2 text-sm text-[#1F504B]/70">
                <p><strong>Institution:</strong> {assessmentData.institutionName} ({assessmentData.institutionType})</p>
                <p><strong>Scale:</strong> {assessmentData.campusCount} campus(es), {assessmentData.studentPopulation} students</p>
                <p><strong>Timeline:</strong> {timelines.find(t => t.value === assessmentData.investmentTimeline)?.label}</p>
                <p><strong>Commitment:</strong> {commitmentLevels.find(l => l.value === assessmentData.partnershipCommitmentLevel)?.label}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-8">
        <button
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 1}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {currentStep < 4 ? (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-gradient-to-r from-[#1F504B] to-[#5A8A84] text-white rounded-lg hover:from-[#5A8A84] hover:to-[#1F504B] transition-all duration-300"
          >
            Next Step
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-[#1F504B] to-[#5A8A84] text-white rounded-lg hover:from-[#5A8A84] hover:to-[#1F504B] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting Assessment...' : 'Submit Partnership Assessment'}
          </button>
        )}
      </div>
    </div>
  )
}