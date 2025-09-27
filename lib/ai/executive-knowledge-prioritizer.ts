// AIVY Executive Knowledge Prioritization Service
// Filters and prioritizes knowledge chunks for executive-level decision making

import { IntentAnalysis, ExecutiveProfile, ConversationState } from './conversation-memory'

interface KnowledgeChunk {
  content: string
  similarity: number
  metadata?: any
}

interface ExecutiveContext {
  profile: ExecutiveProfile
  state: ConversationState
  intent: IntentAnalysis
}

export class ExecutiveKnowledgePrioritizer {
  
  /**
   * Prioritizes knowledge chunks based on executive context and strategic relevance
   */
  static prioritizeForExecutive(
    chunks: KnowledgeChunk[], 
    executiveContext: ExecutiveContext
  ): KnowledgeChunk[] {
    const { profile, state, intent } = executiveContext
    
    // Score each chunk for executive relevance
    const scoredChunks = chunks.map(chunk => ({
      ...chunk,
      executiveScore: this.calculateExecutiveScore(chunk, executiveContext)
    }))
    
    // Sort by combined similarity and executive relevance
    const prioritizedChunks = scoredChunks.sort((a, b) => {
      const scoreA = (a.similarity * 0.6) + (a.executiveScore * 0.4)
      const scoreB = (b.similarity * 0.6) + (b.executiveScore * 0.4)
      return scoreB - scoreA
    })
    
    console.log('Executive prioritization applied:', prioritizedChunks.length, 'chunks')
    console.log('Top scores:', prioritizedChunks.slice(0, 3).map(c => ({
      similarity: c.similarity.toFixed(3),
      executiveScore: c.executiveScore.toFixed(3),
      preview: c.content.substring(0, 100) + '...'
    })))
    
    return prioritizedChunks.slice(0, 5) // Return top 5 executive-relevant chunks
  }
  
  /**
   * Calculates executive relevance score based on content analysis
   */
  private static calculateExecutiveScore(
    chunk: KnowledgeChunk, 
    context: ExecutiveContext
  ): number {
    const content = chunk.content.toLowerCase()
    let score = 0.0
    
    // Strategic leadership keywords (high weight)
    const strategicKeywords = [
      'strategic', 'leadership', 'executive', 'decision', 'roi', 'business case',
      'competitive advantage', 'market position', 'institutional excellence',
      'transformation', 'innovation', 'scalability', 'growth', 'efficiency'
    ]
    strategicKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 0.15
    })
    
    // Intent-specific scoring
    const { primaryIntent, executiveContext: execCtx } = context.intent
    
    switch (primaryIntent) {
      case 'decision_support':
        const decisionKeywords = ['implementation', 'cost', 'timeline', 'resource', 'risk', 'benefit']
        decisionKeywords.forEach(keyword => {
          if (content.includes(keyword)) score += 0.12
        })
        break
        
      case 'problem_solving':
        const solutionKeywords = ['solution', 'challenge', 'problem', 'resolve', 'address', 'overcome']
        solutionKeywords.forEach(keyword => {
          if (content.includes(keyword)) score += 0.12
        })
        break
        
      case 'relationship_building':
        const relationshipKeywords = ['partnership', 'collaboration', 'support', 'service', 'relationship']
        relationshipKeywords.forEach(keyword => {
          if (content.includes(keyword)) score += 0.12
        })
        break
    }
    
    // Urgency-based scoring
    if (execCtx?.urgency === 'high') {
      const urgencyKeywords = ['immediate', 'quick', 'fast', 'rapid', 'urgent']
      urgencyKeywords.forEach(keyword => {
        if (content.includes(keyword)) score += 0.10
      })
    }
    
    // Decision stage scoring
    switch (execCtx?.decisionStage) {
      case 'evaluation':
        const evalKeywords = ['comparison', 'vs', 'alternative', 'option', 'evaluate']
        evalKeywords.forEach(keyword => {
          if (content.includes(keyword)) score += 0.08
        })
        break
        
      case 'decision':
        const decisionKeywords = ['pricing', 'contract', 'agreement', 'implementation', 'onboarding']
        decisionKeywords.forEach(keyword => {
          if (content.includes(keyword)) score += 0.08
        })
        break
    }
    
    // Institution size relevance
    if (context.profile.institutionSize) {
      if (context.profile.institutionSize === 'large' && content.includes('multi-campus')) {
        score += 0.10
      }
      if (context.profile.institutionSize === 'small' && content.includes('single campus')) {
        score += 0.08
      }
    }
    
    // Previously discussed topics bonus
    context.state.discussedTopics.forEach(topic => {
      if (content.includes(topic)) {
        score += 0.05 // Small bonus for continuity
      }
    })
    
    // Strategic focus areas
    context.intent.strategicFocus.forEach(focus => {
      const focusKeywords = {
        'scalability': ['scale', 'growth', 'expansion', 'multiple', 'campus'],
        'operational_efficiency': ['efficiency', 'streamline', 'optimize', 'automate'],
        'student_success': ['student success', 'outcomes', 'achievement', 'performance'],
        'competitive_advantage': ['competitive', 'advantage', 'differentiate', 'unique']
      }
      
      const keywords = focusKeywords[focus as keyof typeof focusKeywords] || []
      keywords.forEach(keyword => {
        if (content.includes(keyword)) score += 0.07
      })
    })
    
    // Penalize overly technical content for executives
    const technicalKeywords = [
      'api', 'database', 'server', 'configuration', 'technical implementation',
      'code', 'developer', 'programming', 'debugging'
    ]
    technicalKeywords.forEach(keyword => {
      if (content.includes(keyword)) score -= 0.05
    })
    
    // Boost business outcome focused content
    const businessOutcomeKeywords = [
      'result', 'outcome', 'impact', 'benefit', 'value', 'return',
      'improvement', 'success', 'achievement', 'performance', 'metric'
    ]
    businessOutcomeKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 0.08
    })
    
    // Ensure score is within reasonable bounds
    return Math.max(0, Math.min(1, score))
  }
  
  /**
   * Filters chunks to ensure executive-appropriate content depth
   */
  static filterExecutiveAppropriate(chunks: KnowledgeChunk[]): KnowledgeChunk[] {
    return chunks.filter(chunk => {
      const content = chunk.content.toLowerCase()
      
      // Filter out overly detailed technical content
      const technicalDensity = this.calculateTechnicalDensity(content)
      if (technicalDensity > 0.3) return false
      
      // Ensure minimum strategic relevance
      const strategicRelevance = this.calculateStrategicRelevance(content)
      if (strategicRelevance < 0.1) return false
      
      return true
    })
  }
  
  private static calculateTechnicalDensity(content: string): number {
    const technicalTerms = [
      'api', 'json', 'http', 'sql', 'database schema', 'server',
      'configuration file', 'deployment', 'debugging', 'code',
      'function', 'variable', 'parameter'
    ]
    
    const termCount = technicalTerms.filter(term => content.includes(term)).length
    return termCount / content.split(' ').length * 100
  }
  
  private static calculateStrategicRelevance(content: string): number {
    const strategicTerms = [
      'strategic', 'business', 'institutional', 'leadership', 'decision',
      'value', 'benefit', 'outcome', 'impact', 'advantage', 'success'
    ]
    
    const termCount = strategicTerms.filter(term => content.includes(term)).length
    return termCount / content.split(' ').length * 100
  }
}