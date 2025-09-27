import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  private static instance: GeminiService;
  private genAI: GoogleGenerativeAI;
  private model: any;
  private isInitialized = false;

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  private constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Gemini model with configurable version
      const modelName = process.env.GEMINI_MODEL || "gemini-flash-latest"
      this.model = this.genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      });

      this.isInitialized = true;
      console.log('Gemini AI service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error);
      throw new Error(`Gemini initialization failed: ${error.message}`);
    }
  }

  public async generateResponse(params: {
    message: string;
    context?: string;
    conversationHistory?: Array<{ role: string; content: string }>;
    systemPrompt?: string;
  }): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { message, context, conversationHistory = [], systemPrompt } = params;

      // Build the prompt with system instructions, context, and conversation history
      let prompt = systemPrompt || `You are AIVY (AI Virtual Yard), a senior educational technology consultant specializing in strategic conversations with C-level executives in educational institutions.

Your Identity:
- You're an intelligent conversation partner, not a traditional chatbot
- You communicate at a peer level with educational leaders and decision-makers
- You focus on strategic insights and business outcomes rather than technical features
- You build understanding progressively through natural conversation

Conversational Approach (Pi AI-inspired):
- Lead with strategic insights relevant to their leadership role
- Ask clarifying questions to understand their specific institutional context
- Provide concise, action-oriented responses (50-150 words typically)
- Reference business impact and ROI rather than just features
- Maintain a consultative, collaborative tone

About FabriiQ Platform:
FabriiQ is a transformative School Operating System (not just an LMS) designed for forward-thinking educational institutions. Key strategic advantages:
- Multi-campus operational unification and scalability
- AI-powered decision support and predictive analytics
- Comprehensive student lifecycle management from enrollment to graduation
- Financial operations automation with real-time insights
- Pedagogical intelligence framework optimizing learning outcomes
- Strategic communication systems for stakeholder engagement

Response Guidelines:
- Acknowledge their leadership context and institutional challenges
- Focus on strategic value and competitive advantages
- Provide clear next steps or decision frameworks when appropriate
- Ask follow-up questions to deepen understanding of their needs
- Maintain executive-appropriate brevity while being thoroughly helpful
- Frame discussions around partnership opportunities, not sales transactions`;

      // Add context if available
      if (context) {
        prompt += `\n\nRelevant information from the knowledge base:\n${context}`;
      }

      // Add conversation history for context
      if (conversationHistory.length > 0) {
        prompt += '\n\nRecent conversation history:';
        conversationHistory.slice(-5).forEach(msg => {
          prompt += `\n${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`;
        });
      }

      // Add the current user message with executive context instruction
      prompt += `\n\nUser: ${message}\n\nRemember: Respond as AIVY with executive-appropriate brevity (50-150 words), strategic focus, and natural conversational tone. Lead with key insight, provide context briefly, and suggest next steps when relevant.\n\nAIVY:`;

      // Generate response
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      let text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini');
      }

      text = text.trim();
      
      // Optimize response for executive audience
      text = this.optimizeExecutiveResponse(text);
      
      return text;

    } catch (error: any) {
      console.error('Error generating Gemini response:', error);
      
      // More specific error handling
      if (error?.status === 400) {
        console.error('Gemini API Key Issue:', error.message);
        return "I'm experiencing an API configuration issue. Please ensure your Gemini API key is valid and has the necessary permissions.";
      }
      
      if (error?.status === 404) {
        console.error('Gemini Model Issue:', error.message);
        return "The AI model seems to be unavailable. Please try again in a moment.";
      }
      
      if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
        return "I've reached my API usage limit. Please try again later.";
      }
      
      // Generic fallback response
      return "I apologize, but I'm having trouble generating a response right now. This might be due to a temporary issue with the AI service. Please try rephrasing your question or try again in a moment.";
    }
  }

  private optimizeExecutiveResponse(text: string): string {
    // Remove excessive markdown formatting that might distract executives
    text = text.replace(/#{1,6}\s*/g, ''); // Remove headers
    text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold formatting but keep content
    text = text.replace(/\*(.*?)\*/g, '$1'); // Remove italic formatting but keep content
    
    // Ensure response starts with a strong, direct statement
    // Remove common chatbot-like openings
    text = text.replace(/^(Hello!?|Hi!?|Thank you for asking|Great question|I'd be happy to help|Let me help you with that)[.!]?\s*/i, '');
    
    // Ensure executive-appropriate language patterns
    text = text.replace(/\bfeatures?\b/gi, 'capabilities');
    text = text.replace(/\btool(s)?\b/gi, 'solution$1');
    text = text.replace(/\buser(s)?\b/gi, 'leader$1');
    
    // Add conversational flow if missing
    if (!text.includes('?') && !text.includes('next step') && !text.includes('consider') && text.length > 100) {
      text += ' What specific challenges are you facing that I can help address?';
    }
    
    return text;
  }

  public async generateResponseWithRAG(params: {
    query: string;
    relevantChunks: Array<{ content: string; similarity: number }>;
    conversationHistory?: Array<{ role: string; content: string }>;
    executiveContext?: any;
  }): Promise<string> {
    const { query, relevantChunks, conversationHistory = [], executiveContext } = params;

    // Build context from relevant chunks
    let context = relevantChunks
      .map((chunk, index) => `[Context ${index + 1} (${(chunk.similarity * 100).toFixed(1)}% relevant)]\n${chunk.content}`)
      .join('\n\n');
      
    // Add executive context if available
    if (executiveContext) {
      const { profile, state, intent } = executiveContext
      let executiveInfo = '\n\n[Executive Context]\n'
      
      if (profile.role) executiveInfo += `Role: ${profile.role}\n`
      if (profile.institutionType) executiveInfo += `Institution: ${profile.institutionType}\n`
      if (profile.institutionSize) executiveInfo += `Scale: ${profile.institutionSize}\n`
      if (state.engagementLevel) executiveInfo += `Engagement: ${state.engagementLevel}\n`
      if (state.expressedChallenges?.length) executiveInfo += `Challenges: ${state.expressedChallenges.slice(0, 2).join(', ')}\n`
      if (intent.primaryIntent) executiveInfo += `Intent: ${intent.primaryIntent} (${intent.confidence.toFixed(2)} confidence)\n`
      if (intent.executiveContext?.urgency) executiveInfo += `Urgency: ${intent.executiveContext.urgency}\n`
      if (intent.strategicFocus?.length) executiveInfo += `Strategic Focus: ${intent.strategicFocus.join(', ')}\n`
      
      context += executiveInfo
    }
    
    console.log('RAG Context length:', context.length)
    console.log('RAG Context preview:', context.substring(0, 200) + '...')

    const systemPrompt = `You are AIVY (AI Virtual Yard), a senior educational technology consultant specializing in strategic conversations with C-level executives in educational institutions.

Your Identity:
- You're an intelligent conversation partner, not a traditional chatbot
- You communicate at a peer level with educational leaders and decision-makers
- You focus on strategic insights and business outcomes rather than technical features
- You build understanding progressively through natural conversation

Conversational Approach (Pi AI-inspired):
- Lead with strategic insights relevant to their leadership role
- Ask clarifying questions to understand their specific institutional context
- Provide concise, action-oriented responses (50-150 words typically)
- Reference business impact and ROI rather than just features
- Maintain a consultative, collaborative tone

About FabriiQ Platform:
FabriiQ is a transformative School Operating System (not just an LMS) designed for forward-thinking educational institutions. Key strategic advantages:
- Multi-campus operational unification and scalability
- AI-powered decision support and predictive analytics
- Comprehensive student lifecycle management from enrollment to graduation
- Financial operations automation with real-time insights
- Pedagogical intelligence framework optimizing learning outcomes
- Strategic communication systems for stakeholder engagement

Response Guidelines:
- Acknowledge their leadership context and institutional challenges
- Focus on strategic value and competitive advantages
- Provide clear next steps or decision frameworks when appropriate
- Ask follow-up questions to deepen understanding of their needs
- Maintain executive-appropriate brevity while being thoroughly helpful
- Frame discussions around partnership opportunities, not sales transactions`;

    return this.generateResponse({
      message: query,
      context,
      conversationHistory,
      systemPrompt
    });
  }

  public getModelInfo() {
    return {
      name: process.env.GEMINI_MODEL || 'gemini-flash-latest',
      provider: 'Google',
      maxTokens: 1024,
      isInitialized: this.isInitialized
    };
  }
}

// Export singleton instance
export const geminiService = GeminiService.getInstance();

// Helper functions for easy use
export async function generateResponse(params: {
  message: string;
  context?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}): Promise<string> {
  return geminiService.generateResponse(params);
}

export async function generateRAGResponse(params: {
  query: string;
  relevantChunks: Array<{ content: string; similarity: number }>;
  conversationHistory?: Array<{ role: string; content: string }>;
  executiveContext?: any;
}): Promise<string> {
  return geminiService.generateResponseWithRAG(params);
}
