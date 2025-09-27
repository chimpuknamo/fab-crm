'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { ContactCollection as SimpleContactCollection } from './ContactCollection'
import { ContactCollection as AIVYContactCollection } from '../aivy/contact-collection'
interface ContactInfo {
  name: string
  phone: string
  email?: string
  organization?: string
  role?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}

interface AIChatProps {
  userId?: string
  conversationId?: string
  className?: string
  skipContactCollection?: boolean
  contactInfo?: {
    name: string
    phone: string
    organization: string
  }
}

export function AIChat({ userId, conversationId, className = '', skipContactCollection = false, contactInfo }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showContactCollection, setShowContactCollection] = useState(!skipContactCollection)
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add welcome message when skipping contact collection (for AIVY)
  useEffect(() => {
    if (skipContactCollection && contactInfo && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${contactInfo.name}! I'm AIVY, your intelligent conversation partner for educational leadership. I specialize in helping C-level executives${contactInfo.organization ? ' at ' + contactInfo.organization : ''} explore transformative educational technology solutions. What strategic challenge can I help you address today?`,
        timestamp: new Date()
      }])
    }
  }, [skipContactCollection, contactInfo, messages.length])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    // Add loading message
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: conversationId || 'default',
          userId: userId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Remove loading message and add AI response
      const responseContent = data.response || 'I apologize, but I couldn\'t generate a response. Please try again.'
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading)
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date()
        }
        return [...withoutLoading, aiMessage]
      })

      // Track conversation for analytics and CRM
      await trackConversation(userMessage.content, responseContent)

    } catch (error) {
      console.error('Chat error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      
      // Remove loading message and add error message
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading)
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.',
          timestamp: new Date()
        }
        return [...withoutLoading, errorMessage]
      })
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearError = () => setError(null)

  const trackConversation = async (userMessage: string, botResponse: string) => {
    try {
      await fetch('/api/crm/conversations/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: conversationId || `homepage-${Date.now()}`,
          userMessage,
          botResponse,
          timestamp: new Date().toISOString(),
          metadata: {
            user_id: userId,
            platform: 'homepage_chat',
            response_type: 'ai_chat'
          }
        })
      })
    } catch (error) {
      console.error('Failed to track conversation:', error)
      // Don't fail the chat if tracking fails
    }
  }

  const handleContactSubmit = async (contactInfo: ContactInfo) => {
    setIsSubmittingContact(true)
    try {
      // Submit contact information to CRM contacts API (same as AIVY uses)
      const response = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactInfo.name,
          phone: contactInfo.phone,
          email: contactInfo.email || '',
          organization: contactInfo.organization || '',
          role: contactInfo.role || '',
          source: 'homepage_chat',
          status: 'new',
          metadata: {
            chat_session: true,
            collected_at: new Date().toISOString(),
            conversation_id: conversationId,
            user_id: userId
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Contact submission failed:', errorData)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Contact saved successfully:', data)
      
      // Hide contact collection and show welcome message
      setShowContactCollection(false)
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${contactInfo.name}! I'm AIVY, and I'm here to guide you through FabriiQ's comprehensive School Operating System.`,
        timestamp: new Date()
      }])

    } catch (error) {
      console.error('Contact submission error:', error)
      setError('Failed to submit contact information. Please try again.')
      // Still proceed to chat even if saving fails
      setShowContactCollection(false)
      setMessages([{
        id: 'welcome',
        role: 'assistant', 
        content: `Hello ${contactInfo.name}! I'm AIVY, and I'm here to guide you through FabriiQ's comprehensive School Operating System.`,
        timestamp: new Date()
      }])
    } finally {
      setIsSubmittingContact(false)
    }
  }

  return (
    <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#1F504B] to-[#5A8A84] text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-white bg-opacity-20 rounded-full">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AIVY</h3>
            <p className="text-xs opacity-90">AI Virtual Yard - Executive Intelligence</p>
          </div>
        </div>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Online" />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={clearError}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            ×
          </button>
        </div>
      )}

      {/* Contact Collection or Messages */}
      {showContactCollection ? (
        <div className="flex-1 overflow-y-auto">
          <AIVYContactCollection
            onComplete={(contact) => handleContactSubmit({
              name: contact.name,
              phone: contact.phone,
              email: '',
              organization: contact.organization,
              role: ''
            })}
            isSubmitting={isSubmittingContact}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9FAFB] min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-[#1F504B] text-white' 
                  : 'bg-[#D8E3E0] text-[#1F504B]'
              }`}>
                {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              {/* Message Bubble */}
              <div className={`rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-[#1F504B] text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md border border-gray-200 shadow-sm'
              }`}>
                {message.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#5A8A84] rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[#5A8A84] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-[#5A8A84] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                ) : (
                  <div className="text-base leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                )}
                
                {/* Timestamp */}
                <div className={`text-sm mt-2 ${
                  message.role === 'user' ? 'text-white text-opacity-70' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input - Only show when not collecting contact info */}
      {!showContactCollection && (
        <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What strategic challenges are you facing in educational management?"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#1F504B] focus:ring-2 focus:ring-[#1F504B] focus:ring-opacity-20 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            maxLength={1000}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-[#1F504B] text-white px-4 py-3 rounded-lg hover:bg-[#5A8A84] focus:outline-none focus:ring-2 focus:ring-[#1F504B] focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        
          {/* Character count */}
          <div className="text-sm text-gray-500 mt-2 text-right">
            {input.length}/1000
          </div>
        </div>
      )}
    </div>
  )
}
