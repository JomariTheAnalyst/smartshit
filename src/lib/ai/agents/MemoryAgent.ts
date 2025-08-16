import { AIAgent, AIResponse } from '@/types/ai'
import { ProviderRouter } from '../providers/ProviderRouter'

interface UserPreference {
  key: string
  value: any
  timestamp: number
}

interface ConversationEntry {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ContextualInsight {
  type: string
  content: string
  timestamp: number
}

export class MemoryAgent implements AIAgent {
  private providerRouter: ProviderRouter
  private userPreferences: Map<string, UserPreference>
  private conversationHistory: ConversationEntry[]
  private contextualInsights: ContextualInsight[]
  private maxHistoryLength: number
  private maxInsightsLength: number
  
  constructor(providerRouter: ProviderRouter) {
    this.providerRouter = providerRouter
    this.userPreferences = new Map()
    this.conversationHistory = []
    this.contextualInsights = []
    this.maxHistoryLength = 50
    this.maxInsightsLength = 20
    
    // Load memory from localStorage if available
    this.loadMemory()
  }
  
  async process(message: string, context: any): Promise<AIResponse> {
    // Add the user message to conversation history
    this.addToConversationHistory('user', message)
    
    // Enhance the prompt with memory-specific instructions
    const enhancedPrompt = this.createMemoryPrompt(message, context)
    
    // Use the provider router to get a response
    const response = await this.providerRouter.routeRequest(
      enhancedPrompt,
      context,
      'gemini' // Use a fast model for memory operations
    )
    
    // Add the assistant response to conversation history
    this.addToConversationHistory('assistant', response.response)
    
    // Extract and store any preferences or insights from the message
    this.extractPreferences(message)
    this.generateInsights(message, context)
    
    // Save memory to localStorage
    this.saveMemory()
    
    return response
  }
  
  private createMemoryPrompt(message: string, context: any): string {
    // Get relevant preferences and insights
    const relevantPreferences = this.getRelevantPreferences(message)
    const relevantInsights = this.getRelevantInsights(message, context)
    const recentConversation = this.getRecentConversation(5)
    
    return `
You are a Memory Agent for a spreadsheet application. Your task is to remember user preferences, conversation history, and contextual insights to provide personalized assistance.

Current context:
- Active sheet: ${context.activeSheet || 'None'}
- Active cell: ${context.activeCell || 'None'}
- Selection: ${context.selection ? JSON.stringify(context.selection) : 'None'}

User preferences:
${relevantPreferences.length > 0 
  ? relevantPreferences.map(pref => `- ${pref.key}: ${pref.value}`).join('\n') 
  : '- No relevant preferences found'}

Recent conversation:
${recentConversation.map(entry => `${entry.role}: ${entry.content}`).join('\n')}

Contextual insights:
${relevantInsights.length > 0 
  ? relevantInsights.map(insight => `- ${insight.type}: ${insight.content}`).join('\n') 
  : '- No relevant insights found'}

User request: ${message}

Please analyze the user's request in the context of their preferences and history. Identify if:
1. There are any new preferences to store
2. This request relates to previous conversations
3. There are any insights that should be remembered for future interactions

Then, provide a response that takes into account the user's preferences and history.
`
  }
  
  // User Preferences Management
  
  setPreference(key: string, value: any): void {
    this.userPreferences.set(key, {
      key,
      value,
      timestamp: Date.now()
    })
    
    this.saveMemory()
  }
  
  getPreference(key: string): any {
    const preference = this.userPreferences.get(key)
    return preference ? preference.value : null
  }
  
  private extractPreferences(message: string): void {
    // Simple preference extraction based on common patterns
    const currencyMatch = message.match(/prefer ([\w]+) currency|use ([\w]+) as currency|always use ([\w]+)/i)
    if (currencyMatch) {
      const currency = currencyMatch[1] || currencyMatch[2] || currencyMatch[3]
      this.setPreference('preferredCurrency', currency.toUpperCase())
    }
    
    const chartMatch = message.match(/prefer ([\w]+) charts|use ([\w]+) charts/i)
    if (chartMatch) {
      const chartType = chartMatch[1] || chartMatch[2]
      this.setPreference('preferredChartType', chartType.toLowerCase())
    }
    
    const colorMatch = message.match(/prefer ([\w]+) color|use ([\w]+) color/i)
    if (colorMatch) {
      const color = colorMatch[1] || colorMatch[2]
      this.setPreference('preferredColor', color.toLowerCase())
    }
    
    // More sophisticated preference extraction would be implemented here
  }
  
  private getRelevantPreferences(message: string): UserPreference[] {
    const relevantPreferences: UserPreference[] = []
    
    // Check for currency-related queries
    if (message.includes('currency') || message.includes('money') || message.includes('dollar') || message.includes('euro')) {
      const currencyPref = this.userPreferences.get('preferredCurrency')
      if (currencyPref) relevantPreferences.push(currencyPref)
    }
    
    // Check for chart-related queries
    if (message.includes('chart') || message.includes('graph') || message.includes('plot') || message.includes('visualization')) {
      const chartPref = this.userPreferences.get('preferredChartType')
      if (chartPref) relevantPreferences.push(chartPref)
    }
    
    // Check for color-related queries
    if (message.includes('color') || message.includes('format') || message.includes('style')) {
      const colorPref = this.userPreferences.get('preferredColor')
      if (colorPref) relevantPreferences.push(colorPref)
    }
    
    // If no specific preferences are found, return all preferences (limited to 5)
    if (relevantPreferences.length === 0) {
      let count = 0
      for (const pref of this.userPreferences.values()) {
        relevantPreferences.push(pref)
        count++
        if (count >= 5) break
      }
    }
    
    return relevantPreferences
  }
  
  // Conversation History Management
  
  private addToConversationHistory(role: 'user' | 'assistant', content: string): void {
    this.conversationHistory.push({
      role,
      content,
      timestamp: Date.now()
    })
    
    // Limit the history length
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(
        this.conversationHistory.length - this.maxHistoryLength
      )
    }
  }
  
  private getRecentConversation(count: number): ConversationEntry[] {
    return this.conversationHistory.slice(-count)
  }
  
  // Contextual Insights Management
  
  addInsight(type: string, content: string): void {
    this.contextualInsights.push({
      type,
      content,
      timestamp: Date.now()
    })
    
    // Limit the insights length
    if (this.contextualInsights.length > this.maxInsightsLength) {
      this.contextualInsights = this.contextualInsights.slice(
        this.contextualInsights.length - this.maxInsightsLength
      )
    }
    
    this.saveMemory()
  }
  
  private generateInsights(message: string, context: any): void {
    // Generate insights based on user interactions
    // This would be more sophisticated in a real implementation
    
    // Example: If user frequently works with a specific range
    if (context.selection && this.conversationHistory.length > 5) {
      const selectionStr = JSON.stringify(context.selection)
      const recentSelections = this.conversationHistory
        .slice(-5)
        .filter(entry => entry.content.includes(selectionStr))
      
      if (recentSelections.length >= 2) {
        this.addInsight('frequentSelection', `User frequently works with range ${selectionStr}`)
      }
    }
    
    // Example: If user frequently uses specific functions
    const functionMatch = message.match(/use (SUM|AVERAGE|COUNT|VLOOKUP|XLOOKUP|INDEX|MATCH)/i)
    if (functionMatch) {
      const func = functionMatch[1].toUpperCase()
      this.addInsight('frequentFunction', `User frequently uses ${func} function`)
    }
  }
  
  private getRelevantInsights(message: string, context: any): ContextualInsight[] {
    const relevantInsights: ContextualInsight[] = []
    
    // Check for function-related insights
    if (message.includes('function') || message.includes('formula')) {
      const functionInsights = this.contextualInsights.filter(
        insight => insight.type === 'frequentFunction'
      )
      relevantInsights.push(...functionInsights)
    }
    
    // Check for selection-related insights
    if (context.selection) {
      const selectionInsights = this.contextualInsights.filter(
        insight => insight.type === 'frequentSelection'
      )
      relevantInsights.push(...selectionInsights)
    }
    
    // Limit to 5 most recent insights
    return relevantInsights.slice(-5)
  }
  
  // Persistence
  
  private saveMemory(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('userPreferences', JSON.stringify(Array.from(this.userPreferences.entries())))
        localStorage.setItem('conversationHistory', JSON.stringify(this.conversationHistory))
        localStorage.setItem('contextualInsights', JSON.stringify(this.contextualInsights))
      } catch (error) {
        console.error('Failed to save memory to localStorage:', error)
      }
    }
  }
  
  private loadMemory(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const preferencesStr = localStorage.getItem('userPreferences')
        if (preferencesStr) {
          const preferences = JSON.parse(preferencesStr)
          this.userPreferences = new Map(preferences)
        }
        
        const historyStr = localStorage.getItem('conversationHistory')
        if (historyStr) {
          this.conversationHistory = JSON.parse(historyStr)
        }
        
        const insightsStr = localStorage.getItem('contextualInsights')
        if (insightsStr) {
          this.contextualInsights = JSON.parse(insightsStr)
        }
      } catch (error) {
        console.error('Failed to load memory from localStorage:', error)
      }
    }
  }
  
  clearMemory(): void {
    this.userPreferences.clear()
    this.conversationHistory = []
    this.contextualInsights = []
    
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('userPreferences')
      localStorage.removeItem('conversationHistory')
      localStorage.removeItem('contextualInsights')
    }
  }
}

