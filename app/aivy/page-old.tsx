"use client"

import { useState } from "react"
import { ContactCollection } from "@/components/aivy/contact-collection"
import { ChatInterface } from "@/components/aivy/chat-interface"

interface ContactInfo {
  name: string
  phone: string
  organization: string
}

export default function AIVYPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const handleContactComplete = async (contact: ContactInfo) => {
    try {
      // Save contact information to database
      const response = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contact.name,
          phone: contact.phone,
          organization: contact.organization,
          source: 'aivy_chat',
          status: 'new',
          metadata: {
            aivy_session: true,
            collected_at: new Date().toISOString()
          }
        })
      })
      
      if (response.ok) {
        setContactInfo(contact)
        setHasCompletedOnboarding(true)
      } else {
        console.error('Failed to save contact information')
        // Still proceed to chat even if saving fails
        setContactInfo(contact)
        setHasCompletedOnboarding(true)
      }
    } catch (error) {
      console.error('Error saving contact:', error)
      // Still proceed to chat even if saving fails
      setContactInfo(contact)
      setHasCompletedOnboarding(true)
    }
  }

  const validateContactInfo = () => {
    const errors: Record<string, string> = {}
    
    if (!contactInfo.name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (!contactInfo.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^[+]?[1-9]?[0-9]{7,15}$/.test(contactInfo.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number'
    }
    
    if (contactInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    setContactErrors(errors)
    return Object.keys(errors).length === 0
  }

  const submitContactInfo = async () => {
    if (!validateContactInfo()) return
    
    setIsSubmittingContact(true)
    try {
      // Create lead contact and conversation session
      const response = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactInfo.name,
          phone: contactInfo.phone,
          email: contactInfo.email || undefined,
          organization: contactInfo.organization || undefined,
          role: contactInfo.role || undefined,
          source: 'aivy_chat',
          status: 'new',
          metadata: {
            aivy_session: true,
            collected_at: new Date().toISOString()
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save contact information')
      }
      
      const result = await response.json()
      const contactId = result.contact.id
      const sessionIdentifier = `aivy_${Date.now()}_${contactId}`
      
      setSessionId(sessionIdentifier)
      setHasProvidedContact(true)
      
      // Create interaction record linking contact to conversation
      await fetch('/api/crm/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionIdentifier,
          contactId,
          interactionType: 'chat',
          outcome: 'AIVY conversation started',
          sentiment: 'positive',
          topicsDiscussed: ['Platform Introduction'],
          metadata: {
            contact_collection_completed: true,
            aivy_session_start: new Date().toISOString()
          }
        })
      })
      
      // Add welcome message after contact collection
      const welcomeMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Thank you, ${contactInfo.name}! I've saved your contact information. Now, how can I help you learn about FabriiQ's educational platform and partnership opportunities? Feel free to ask about our features, partnership program, or anything else you'd like to know!`,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, welcomeMessage])
      
    } catch (error) {
      console.error('Failed to submit contact info:', error)
      setContactErrors({ general: 'Failed to save contact information. Please try again.' })
    } finally {
      setIsSubmittingContact(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !hasProvidedContact) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage("")
    setIsTyping(true)

    try {
      // TODO: Replace with actual AIVY API call
      // For now, use enhanced bot response with CRM tracking
      setTimeout(async () => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: getEnhancedBotResponse(currentMessage),
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
        setIsTyping(false)
        
        // Track the conversation interaction
        if (sessionId) {
          try {
            await fetch('/api/crm/conversations/track', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sessionId,
                userMessage: currentMessage,
                botResponse: botMessage.text,
                timestamp: new Date().toISOString(),
                metadata: {
                  user_name: contactInfo.name,
                  user_organization: contactInfo.organization,
                  platform: 'aivy_web',
                  response_type: 'automated'
                }
              })
            })
          } catch (error) {
            console.error('Failed to track conversation:', error)
          }
        }
      }, 1500)
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsTyping(false)
    }
  }

  const getEnhancedBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()

    // Check for specific keywords and provide relevant responses
    if (lowerMessage.includes("partnership") || lowerMessage.includes("partner")) {
      return "Our Partnership Program is designed for educational institutions looking to integrate AI technology. We offer comprehensive support, training resources, and collaborative opportunities. Partners get access to exclusive features, dedicated support, and revenue-sharing opportunities. Would you like me to tell you more about the partnership benefits or application process?"
    }

    if (lowerMessage.includes("ai") || lowerMessage.includes("artificial intelligence")) {
      return "FabriiQ leverages cutting-edge AI technology to provide personalized learning experiences, intelligent assessment tools, and adaptive curriculum management. Our AI helps educators make data-driven decisions while enhancing student engagement and outcomes. We're currently in alpha development with exciting new AI features being added regularly."
    }

    if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("pricing")) {
      return "Our pricing is tailored to each institution's specific needs and size. We offer flexible plans for different types of educational organizations, including special alpha pricing for early adopters. I'd be happy to connect you with our partnerships team to discuss pricing options that work for your budget and requirements."
    }

    if (lowerMessage.includes("demo") || lowerMessage.includes("trial")) {
      return "Absolutely! We offer comprehensive demos and alpha access for interested institutions. During the demo, you'll see our platform in action, explore key features, and understand how FabriiQ can transform your educational processes. As we're in alpha development, you'll also get early access to cutting-edge features. Would you like me to schedule a demo for you?"
    }

    if (lowerMessage.includes("feature") || lowerMessage.includes("capability")) {
      return "FabriiQ offers a comprehensive suite of AI-powered features including: intelligent curriculum management, adaptive assessment tools, personalized learning pathways, real-time analytics, collaborative learning environments, and seamless integration capabilities. We're continuously adding new AI features during our alpha phase. Which specific features are you most interested in learning about?"
    }

    if (lowerMessage.includes("support") || lowerMessage.includes("training")) {
      return "We provide extensive support including: dedicated partnership managers, comprehensive training programs, technical documentation, regular webinars, alpha testing support, and ongoing customer success support. Our goal is to ensure your successful implementation and continued growth with FabriiQ."
    }

    if (lowerMessage.includes("integration")) {
      return "FabriiQ is designed for seamless integration with existing educational systems. We support popular LMS platforms, student information systems, and administrative tools. Our API-first approach ensures smooth data flow and minimal disruption to your current workflows. During alpha, we're also building custom integrations based on partner feedback."
    }

    if (lowerMessage.includes("alpha") || lowerMessage.includes("development") || lowerMessage.includes("status")) {
      return "FabriiQ is currently in alpha development, which means you get access to the latest AI-powered educational features before they're widely available. Alpha partners benefit from direct influence on product development, special pricing, and early access to breakthrough AI capabilities. It's an exciting time to join our partnership program!"
    }

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("start")) {
      return "Hello! I'm excited to help you learn about FabriiQ's AI-powered educational platform and partnership opportunities. We're transforming education through intelligent technology, and I'd love to explore how we can support your institution's goals. What would you like to know about our platform or partnership program?"
    }

    if (lowerMessage.includes("human") || lowerMessage.includes("agent") || lowerMessage.includes("person") || lowerMessage.includes("speak to someone")) {
      return "I'd be happy to connect you with one of our human experts! Our team can provide personalized assistance, schedule demos, discuss specific partnership opportunities, or answer complex questions about implementation. Would you like me to arrange for someone from our team to follow up with you?"
    }

    // Default response for general inquiries
    return "That's a great question! FabriiQ is an innovative AI-powered educational technology platform currently in alpha development. We're transforming how institutions manage curriculum, assess learning, and engage students through cutting-edge AI tools. I'm here to help you explore partnership opportunities and learn how we can support your educational goals. What specific aspect of our platform interests you most?"
  }

  const requestHumanHandover = async (reason: string, urgency: string = 'medium') => {
    if (!sessionId || !hasProvidedContact) return
    
    setIsRequestingHandover(true)
    try {
      // Extract contact ID from session identifier
      const contactId = sessionId.split('_').pop()
      
      const response = await fetch('/api/crm/conversations/handover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          contactId,
          reason,
          urgency,
          requestedBy: 'user'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Add handover confirmation message
        const handoverMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: `Perfect! I've connected you with our human team. ${result.message} You can expect a response ${result.estimatedResponseTime.toLowerCase()}. A team member will reach out to you directly via email or phone to continue our conversation and provide personalized assistance.`,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, handoverMessage])
        
        setShowHandoverOptions(false)
      } else {
        throw new Error('Failed to request handover')
      }
    } catch (error) {
      console.error('Failed to request handover:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "I apologize, but I'm having trouble connecting you with our human team right now. Please try again in a moment, or you can reach out to us directly via the contact information on our website.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsRequestingHandover(false)
    }
  }

  const faqs = [
    {
      question: "What makes FabriiQ different from other educational platforms?",
      answer: "FabriiQ is an AI-powered platform currently in alpha development that focuses on intelligent curriculum management, personalized learning pathways, and adaptive assessments. Our unique approach combines cutting-edge AI with educational expertise to create truly personalized learning experiences."
    },
    {
      question: "How does the Partnership Program work?",
      answer: "Our Partnership Program is designed for educational institutions that want to be at the forefront of AI-powered education. Partners get early access to features, influence product development, dedicated support, training resources, and special pricing during our alpha phase."
    },
    {
      question: "What kind of support do you provide to partners?",
      answer: "We provide comprehensive support including dedicated partnership managers, extensive training programs, technical documentation, regular webinars, alpha testing support, and ongoing customer success assistance to ensure your success with FabriiQ."
    },
    {
      question: "Is FabriiQ suitable for all types of educational institutions?",
      answer: "Yes! FabriiQ is designed to work with various educational institutions including K-12 schools, universities, training organizations, and corporate learning departments. Our flexible platform adapts to different educational models and requirements."
    },
    {
      question: "How do I get started with FabriiQ?",
      answer: "Getting started is easy! You can schedule a demo through this chat, explore our partnership program, or contact our team directly. We'll work with you to understand your needs and create a customized implementation plan."
    },
    {
      question: "What does 'alpha development' mean for users?",
      answer: "Being in alpha means you get early access to breakthrough AI features before they're widely available. Alpha partners have direct influence on product development, receive special pricing, and get priority support as we build the future of educational technology together."
    }
  ]

  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-fabriiq-primary/5 via-black to-fabriiq-teal/5"></div>
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(31,80,75,0.3) 0%, transparent 70%)",
              "radial-gradient(circle at 80% 50%, rgba(90,138,132,0.3) 0%, transparent 70%)",
              "radial-gradient(circle at 50% 80%, rgba(31,80,75,0.3) 0%, transparent 70%)",
              "radial-gradient(circle at 20% 50%, rgba(31,80,75,0.3) 0%, transparent 70%)",
            ],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>

      <div className="relative z-10">
        <NavBar />

        {/* Hero Section */}
        <section className="pt-32 pb-12 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-fabriiq-primary/10 border border-fabriiq-primary/20 text-fabriiq-primary text-sm font-medium backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  AI-Powered Partnership Assistant
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-black/60 rounded-2xl blur-3xl"></div>
                <div className="relative z-10">
                  <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
                    Meet{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
                      AIVY
                    </span>
                  </h1>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8"
              >
                Your intelligent guide to FabriiQ's educational platform and partnership opportunities. 
                Get instant answers, explore our capabilities, and discover how we can transform your institution.
              </motion.p>

              <div className="flex items-center justify-center space-x-4 mb-12">
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">AI Assistant Online</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm">Partnership Expert</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chat Interface */}
        <section className="pb-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Contact Information Form */}
            {!hasProvidedContact && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border-2 border-fabriiq-primary/30 rounded-3xl p-8 mb-8 shadow-2xl shadow-fabriiq-primary/10"
              >
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-fabriiq-primary/20 rounded-full border border-fabriiq-primary/30">
                      <UserPlus className="h-8 w-8 text-fabriiq-primary" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Let's Get Started!
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    Before we begin our conversation, I'd like to learn a bit about you. This helps me provide more personalized assistance and allows our team to follow up with relevant information.
                  </p>
                </div>
              
                <div className="max-w-md mx-auto space-y-6">
                  <div>
                    <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-300 mb-3">
                      <User className="h-4 w-4 mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={contactInfo.name}
                      onChange={(e) => {
                        setContactInfo(prev => ({ ...prev, name: e.target.value }))
                        if (contactErrors.name) {
                          setContactErrors(prev => ({ ...prev, name: '' }))
                        }
                      }}
                      className={`w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg focus:ring-2 focus:ring-fabriiq-primary focus:border-fabriiq-primary transition-colors text-white placeholder-gray-400 ${
                        contactErrors.name ? 'border-red-500 bg-red-500/10' : 'border-gray-600'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {contactErrors.name && (
                      <p className="text-red-400 text-sm mt-1">{contactErrors.name}</p>
                    )}
                  </div>
                
                  <div>
                    <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-300 mb-3">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={contactInfo.phone}
                      onChange={(e) => {
                        setContactInfo(prev => ({ ...prev, phone: e.target.value }))
                        if (contactErrors.phone) {
                          setContactErrors(prev => ({ ...prev, phone: '' }))
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1F504B] focus:border-transparent transition-colors ${
                      contactErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {contactErrors.phone && (
                    <p className="text-red-600 text-sm mt-1">{contactErrors.phone}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={contactInfo.email || ''}
                    onChange={(e) => {
                      setContactInfo(prev => ({ ...prev, email: e.target.value }))
                      if (contactErrors.email) {
                        setContactErrors(prev => ({ ...prev, email: '' }))
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1F504B] focus:border-transparent transition-colors ${
                      contactErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {contactErrors.email && (
                    <p className="text-red-600 text-sm mt-1">{contactErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="organization" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Building className="h-4 w-4 mr-2" />
                    Organization (Optional)
                  </label>
                  <input
                    type="text"
                    id="organization"
                    value={contactInfo.organization || ''}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, organization: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F504B] focus:border-transparent transition-colors"
                    placeholder="Enter your organization name"
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 mr-2" />
                    Role/Title (Optional)
                  </label>
                  <input
                    type="text"
                    id="role"
                    value={contactInfo.role || ''}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F504B] focus:border-transparent transition-colors"
                    placeholder="Enter your role or title"
                  />
                </div>
                
                {contactErrors.general && (
                  <div className="text-center">
                    <p className="text-red-600 text-sm">{contactErrors.general}</p>
                  </div>
                )}
                
                <Button
                  onClick={submitContactInfo}
                  disabled={isSubmittingContact}
                  className="w-full bg-gradient-to-r from-[#1F504B] to-[#5A8A84] hover:from-[#1a453f] hover:to-[#4f7872] text-white py-4 text-lg font-medium"
                >
                  {isSubmittingContact ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Saving Information...
                    </div>
                  ) : (
                    'Start Conversation with AIVY'
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Your information is secure and will only be used to improve your experience and provide relevant follow-up communications.
                </p>
              </div>
            </motion.div>
          )}
          
          {/* Chat Interface */}
          {hasProvidedContact && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-[#1F504B] to-[#5A8A84] text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bot className="h-8 w-8 mr-3" />
                    <div>
                      <h2 className="text-xl font-semibold">AIVY Assistant</h2>
                      <p className="text-green-100">Online • Ready to help {contactInfo.name}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-green-100">
                    <p>Partnership Assistant</p>
                    <p>Alpha Development</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.sender === "user"
                            ? "bg-[#5A8A84]"
                            : "bg-gradient-to-r from-[#1F504B] to-[#5A8A84]"
                        }`}
                      >
                        {message.sender === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${
                          message.sender === "user" 
                            ? "bg-[#5A8A84] text-white" 
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === "user" ? "text-green-100" : "text-gray-500"
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#1F504B] to-[#5A8A84] rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Handover Options */}
              {showHandoverOptions && hasProvidedContact && (
                <div className="border-t border-gray-200 p-4 bg-yellow-50">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Connect with a human expert:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => requestHumanHandover('General inquiry')}
                        disabled={isRequestingHandover}
                        className="text-xs"
                      >
                        General Questions
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => requestHumanHandover('Demo request', 'high')}
                        disabled={isRequestingHandover}
                        className="text-xs"
                      >
                        Schedule Demo
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => requestHumanHandover('Partnership inquiry', 'high')}
                        disabled={isRequestingHandover}
                        className="text-xs"
                      >
                        Partnership Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => requestHumanHandover('Technical support')}
                        disabled={isRequestingHandover}
                        className="text-xs"
                      >
                        Technical Help
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowHandoverOptions(false)}
                      className="w-full mt-2 text-xs text-gray-500"
                    >
                      Cancel - Continue with AIVY
                    </Button>
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask about FabriiQ's features, partnership program, or schedule a demo..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1F504B] focus:border-transparent transition-colors"
                    disabled={!hasProvidedContact}
                  />
                  <Button
                    onClick={() => setShowHandoverOptions(!showHandoverOptions)}
                    disabled={!hasProvidedContact}
                    variant="outline"
                    className="px-4 py-3 rounded-xl border-[#1F504B] text-[#1F504B] hover:bg-[#1F504B] hover:text-white"
                    title="Speak with a human expert"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={sendMessage}
                    disabled={!hasProvidedContact || !inputMessage.trim() || isTyping}
                    className="bg-gradient-to-r from-[#1F504B] to-[#5A8A84] hover:from-[#1a453f] hover:to-[#4f7872] px-6 py-3 rounded-xl"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                
                {hasProvidedContact && !showHandoverOptions && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Need to speak with a human expert? Click the <User className="w-3 h-3 inline" /> icon above
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">
              Key questions about FabriiQ's AI-powered educational platform and partnership program.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-[#1F504B] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#1F504B] flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4 border-t border-gray-100"
                  >
                    <p className="text-gray-700 leading-relaxed pt-4">{faq.answer}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>
          
          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12 p-8 bg-gradient-to-r from-[#1F504B] to-[#5A8A84] rounded-xl text-white"
          >
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Educational Institution?</h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Join our alpha partnership program and get early access to cutting-edge AI-powered educational technology. 
              Start a conversation with AIVY above to learn more about our platform and partnership opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-white text-[#1F504B] hover:bg-gray-100 font-semibold"
              >
                Start Conversation with AIVY
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-[#1F504B]"
                onClick={() => window.open('/partnership', '_blank')}
              >
                Learn About Partnerships
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
