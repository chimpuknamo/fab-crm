'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Bot, User } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ContactInfo {
  name: string
  phone: string
  organization: string
}

interface ChatInterfaceProps {
  contactInfo: ContactInfo
}

export function ChatInterface({ contactInfo }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi ${contactInfo.name}! I'm AIVY, your AI educational partnership assistant. I'm here to help you explore FabriiQ's platform and partnership opportunities. What would you like to know about our educational technology solutions?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationContext, setConversationContext] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getIntelligentResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()
    
    // Build context from recent conversation topics
    const hasDiscussedFraud = conversationContext.some(topic => topic.includes('fraud') || topic.includes('financial'))
    const hasDiscussedPartnership = conversationContext.some(topic => topic.includes('partnership'))
    const hasDiscussedAI = conversationContext.some(topic => topic.includes('ai') || topic.includes('technology'))

    // Enhanced responses based on FabriiQ context
    if (lowerMessage.includes('fraud') || lowerMessage.includes('accountant') || lowerMessage.includes('fee')) {
      return `I understand your concern about financial fraud and fee management. FabriiQ's comprehensive School Operating System includes robust financial management features with built-in fraud prevention measures:

• **Automated Fee Management**: Transparent fee collection with automated reconciliation and audit trails
• **Multi-level Approval Systems**: Prevent unauthorized transactions with configurable approval workflows  
• **Real-time Financial Monitoring**: AI-powered anomaly detection to flag suspicious activities
• **Complete Audit Trails**: Every transaction is logged with timestamps and user verification
• **Role-based Access Control**: Limit financial access based on user roles and responsibilities

Our system helps educational institutions maintain financial transparency and prevent fraud through advanced AI monitoring. Would you like to know more about our financial management capabilities or see a demo of our fraud prevention features?`
    }

    if (lowerMessage.includes('partnership') || lowerMessage.includes('partner')) {
      return `Great question about partnerships! FabriiQ offers several partnership opportunities:

**🎓 Development Partnership Program**
• Co-create educational solutions with our team
• Early access to cutting-edge AI features
• Custom development based on your institution's needs
• Revenue sharing opportunities

**🏫 Institutional Partnerships**
• Comprehensive implementation support
• Staff training and onboarding
• Custom integrations with existing systems
• Ongoing success management

**🌐 Technology Integration Partnerships**
• API partnerships with EdTech providers
• Data sharing agreements
• Joint product development

As a representative from ${contactInfo.organization}, I'd love to explore which partnership model would best serve your institution's goals. What specific outcomes are you hoping to achieve?`
    }

    if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence') || lowerMessage.includes('aivy')) {
      return `FabriiQ leverages cutting-edge AI technology through our AIVY Multi-Agent System:

**🤖 AIVY Capabilities:**
• **Student Companion Agents**: Personalized learning support and guidance
• **Teacher Assistant Agents**: Curriculum help and automated grading
• **Analytics Agents**: Predictive insights for student success
• **Administrative Agents**: Streamlined operational processes
• **Safety & Compliance Agents**: Automated monitoring and reporting

Our AI is specifically designed for education, ensuring student privacy and following all educational compliance requirements. The system adapts to your institution's unique needs while maintaining the highest safety standards.

What aspect of our AI technology interests you most? I can provide more details about any specific area.`
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing')) {
      return `I appreciate your interest in our pricing! FabriiQ offers flexible pricing models designed for educational institutions:

**💰 Partnership Program Benefits:**
• Alpha development partners get special pricing
• No upfront licensing costs during development phase
• Custom pricing based on institution size and needs
• Revenue sharing opportunities available

**📊 Pricing Factors:**
• Number of students and staff
• Campus count and complexity
• Integration requirements
• Support level needed

Given that you represent ${contactInfo.organization}, I'd love to connect you with our partnerships team for a personalized pricing discussion. They can provide detailed quotes based on your specific requirements.

Would you like me to schedule a call with our partnerships team, or do you have specific questions about our pricing structure?`
    }

    if (lowerMessage.includes('demo') || lowerMessage.includes('demonstration') || lowerMessage.includes('show')) {
      return `Absolutely! I'd be delighted to arrange a comprehensive FabriiQ demonstration for ${contactInfo.organization}.

**🎯 Demo Options:**
• **Live Platform Demo**: Interactive walkthrough of all features
• **Custom Use Case Demo**: Tailored to your institution's specific needs  
• **Technical Integration Demo**: For your IT team
• **Leadership Presentation**: Strategic overview for decision makers

**📋 Demo Agenda Typically Includes:**
• Multi-campus management capabilities
• AI-powered student engagement tools
• Financial management and fraud prevention
• Integration with existing systems
• Partnership program benefits

I can schedule a demo that works with your team's schedule and focuses on your highest priority areas. 

What type of demo would be most valuable for your team, and when would be a good time to schedule it?`
    }

    if (lowerMessage.includes('feature') || lowerMessage.includes('capability') || lowerMessage.includes('function')) {
      return `FabriiQ is a comprehensive School Operating System with powerful features:

**🎓 Core Educational Features:**
• Multi-campus management and coordination
• AI-powered personalized learning pathways
• Automated assessment and grading systems
• Student engagement and gamification tools

**💼 Administrative Excellence:**
• Complete financial management with fraud prevention
• Automated attendance and scheduling
• Parent and student communication portals
• Comprehensive reporting and analytics

**🔧 Technical Capabilities:**
• API-first architecture for easy integrations
• Offline-first design with cloud synchronization
• FERPA-compliant data handling
• Scalable infrastructure for institutions of any size

**🤝 Partnership Features:**
• Revenue sharing opportunities
• Co-development possibilities
• Custom feature development
• Dedicated support and training

Which specific features are most important for ${contactInfo.organization}? I can dive deeper into any area that interests you most.`
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('start')) {
      return `Hello ${contactInfo.name}! It's wonderful to meet someone from ${contactInfo.organization}. 

I'm here to help you explore how FabriiQ can transform educational experiences at your institution. Whether you're interested in our AI-powered learning tools, comprehensive administrative features, or partnership opportunities, I'm ready to assist.

What aspect of educational technology transformation interests you most? I'm here to answer any questions about:
• Our platform capabilities
• Partnership programs  
• Implementation process
• Success stories from other institutions

How can I help you today?`
    }

    if (lowerMessage.includes('integration') || lowerMessage.includes('system') || lowerMessage.includes('connect')) {
      return `Excellent question about system integration! FabriiQ is designed with an API-first architecture for seamless integration:

**🔗 Integration Capabilities:**
• **Student Information Systems (SIS)**: Seamless data sync with existing student records
• **Learning Management Systems**: Connect with Canvas, Blackboard, Moodle, etc.
• **Financial Systems**: Integrate with accounting and billing platforms
• **Communication Tools**: Email, SMS, and notification systems
• **Third-party Educational Tools**: Extensive app marketplace

**⚡ Integration Benefits:**
• Minimal disruption to existing workflows
• Real-time data synchronization
• Single sign-on (SSO) capabilities
• Automated data migration support

For ${contactInfo.organization}, we provide dedicated integration specialists who work with your IT team to ensure a smooth transition. Our technical team can assess your current systems and create a custom integration plan.

What existing systems would you need FabriiQ to integrate with?`
    }

    // Default comprehensive response
    return `That's a great question about FabriiQ! As the first comprehensive School Operating System, we're designed specifically for educational institutions like ${contactInfo.organization}.

**🚀 Why Institutions Choose FabriiQ:**
• **Complete Solution**: Everything from enrollment to graduation in one platform
• **AI-Powered**: Advanced AIVY system for personalized education
• **Partnership Focus**: Co-development opportunities with shared success
• **Proven Results**: Improved student outcomes and operational efficiency

I'd love to learn more about your specific needs and challenges at ${contactInfo.organization}. What educational technology challenges are you currently facing?

Feel free to ask me about:
• Platform demonstrations
• Partnership opportunities  
• Technical capabilities
• Implementation support
• Success stories

How can I best help you explore FabriiQ's potential for your institution?`
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage('')
    setIsTyping(true)

    try {
      // Simulate API call with enhanced responses
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: getIntelligentResponse(currentMessage),
          sender: 'bot',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
        
        // Update conversation context for better responses
        const topics = extractTopics(currentMessage + ' ' + botMessage.text)
        setConversationContext(prev => [...prev.slice(-10), ...topics]) // Keep last 10 topics
        
        // Track conversation in background
        trackConversation(currentMessage, botMessage.text)
      }, 1500)
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsTyping(false)
    }
  }

  const trackConversation = async (userMessage: string, botResponse: string) => {
    try {
      await fetch('/api/crm/conversations/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: `aivy_${Date.now()}`,
          userMessage,
          botResponse,
          timestamp: new Date().toISOString(),
          metadata: {
            user_name: contactInfo.name,
            user_organization: contactInfo.organization,
            platform: 'aivy_web',
            response_type: 'enhanced_ai'
          }
        })
      })
    } catch (error) {
      console.error('Failed to track conversation:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const extractTopics = (text: string): string[] => {
    const keywords = [
      'fraud', 'financial', 'fee', 'accounting', 'money', 'payment',
      'partnership', 'collaboration', 'development', 'revenue',
      'ai', 'artificial intelligence', 'technology', 'aivy', 'automation',
      'demo', 'demonstration', 'presentation', 'meeting',
      'pricing', 'cost', 'budget', 'investment',
      'features', 'capabilities', 'functionality',
      'integration', 'system', 'platform', 'software',
      'education', 'school', 'student', 'teacher', 'learning',
      'campus', 'institution', 'university', 'college'
    ]
    
    return keywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    )
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-fabriiq-primary/10 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-fabriiq-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">AIVY</h1>
              <p className="text-sm text-gray-500">AI Partnership Assistant</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Welcome, {contactInfo.name}</p>
            <p className="text-xs text-gray-500">{contactInfo.organization}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-2xl ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-fabriiq-primary text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-fabriiq-primary text-white rounded-br-md'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md shadow-sm'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-3"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="px-4 py-3 bg-white rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Talk with AIVY"
              className="w-full px-6 py-4 text-gray-900 border-2 border-gray-200 rounded-full focus:border-fabriiq-primary focus:ring-0 focus:outline-none transition-colors bg-gray-50"
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${
                inputMessage.trim() && !isTyping
                  ? 'bg-fabriiq-primary hover:bg-fabriiq-primary/90 text-white hover:scale-110'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-center text-xs text-gray-500 mt-3">
            AIVY may make mistakes, please don't rely on its information.
          </p>
        </div>
      </div>
    </div>
  )
}