'use client'

import { useState, useEffect } from 'react'
import { X, Cookie, Settings, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CookiesConfig {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

export function CookiesBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [cookiesConfig, setCookiesConfig] = useState<CookiesConfig>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    preferences: false
  })

  useEffect(() => {
    // Check if user has already made a choice
    const cookiesConsent = localStorage.getItem('fabriiq-cookies-consent')
    if (!cookiesConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    }
    setCookiesConfig(allAccepted)
    saveCookiesConsent(allAccepted)
    setShowBanner(false)
  }

  const handleAcceptSelected = () => {
    saveCookiesConsent(cookiesConfig)
    setShowBanner(false)
    setShowSettings(false)
  }

  const handleRejectAll = () => {
    const rejected = {
      necessary: true, // Always required
      analytics: false,
      marketing: false,
      preferences: false
    }
    setCookiesConfig(rejected)
    saveCookiesConsent(rejected)
    setShowBanner(false)
  }

  const saveCookiesConsent = (config: CookiesConfig) => {
    localStorage.setItem('fabriiq-cookies-consent', JSON.stringify({
      config,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }))

    // Initialize analytics if accepted
    if (config.analytics && typeof window !== 'undefined') {
      // Initialize Google Analytics or other analytics services
      console.log('Analytics cookies accepted - initializing tracking')
    }

    // Initialize marketing cookies if accepted
    if (config.marketing && typeof window !== 'undefined') {
      // Initialize marketing pixels, ads tracking, etc.
      console.log('Marketing cookies accepted - initializing marketing tools')
    }

    // Initialize preferences cookies if accepted
    if (config.preferences && typeof window !== 'undefined') {
      // Initialize personalization features
      console.log('Preferences cookies accepted - enabling personalization')
    }
  }

  const updateCookieConfig = (type: keyof CookiesConfig, value: boolean) => {
    if (type === 'necessary') return // Can't disable necessary cookies
    setCookiesConfig(prev => ({ ...prev, [type]: value }))
  }

  if (!showBanner) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* Banner Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Cookie className="h-6 w-6 text-[#1F504B]" />
            <h2 className="text-xl font-bold text-gray-900">Cookie Preferences</h2>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Banner Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies to enhance your experience on our website, analyze site usage, and assist with our marketing efforts. 
              By clicking "Accept All", you consent to our use of cookies.
            </p>
            <p className="text-sm text-gray-600">
              You can customize your preferences or learn more in our{' '}
              <a href="/privacy" className="text-[#1F504B] hover:text-[#5A8A84] underline">
                Privacy Policy
              </a>.
            </p>
          </div>

          {/* Cookie Settings */}
          {showSettings && (
            <div className="mb-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cookie Categories</h3>
              
              {/* Necessary Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Necessary Cookies</h4>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Always Active</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies are essential for the website to function properly. They enable basic features like page navigation and access to secure areas.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cookiesConfig.analytics}
                      onChange={(e) => updateCookieConfig('analytics', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1F504B]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1F504B]"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Marketing Cookies</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cookiesConfig.marketing}
                      onChange={(e) => updateCookieConfig('marketing', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1F504B]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1F504B]"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies are used to track visitors across websites to display relevant and engaging advertisements.
                </p>
              </div>

              {/* Preferences Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Preferences Cookies</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cookiesConfig.preferences}
                      onChange={(e) => updateCookieConfig('preferences', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1F504B]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1F504B]"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies enable the website to provide enhanced functionality and personalization based on your interactions.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!showSettings ? (
              <>
                <Button
                  onClick={handleAcceptAll}
                  className="bg-gradient-to-r from-[#1F504B] to-[#5A8A84] text-white hover:from-[#5A8A84] hover:to-[#1F504B] px-6 py-3"
                >
                  Accept All Cookies
                </Button>
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="border-[#1F504B] text-[#1F504B] hover:bg-[#1F504B] hover:text-white px-6 py-3"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize Settings
                </Button>
                <Button
                  onClick={handleRejectAll}
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-800 px-6 py-3"
                >
                  Reject All
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleAcceptSelected}
                  className="bg-gradient-to-r from-[#1F504B] to-[#5A8A84] text-white hover:from-[#5A8A84] hover:to-[#1F504B] px-6 py-3"
                >
                  Save Preferences
                </Button>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3"
                >
                  Back
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}