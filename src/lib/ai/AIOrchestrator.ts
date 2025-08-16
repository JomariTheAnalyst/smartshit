import { AIResponse } from '@/types/ai'
import { ProviderRouter } from './providers/ProviderRouter'
import { FormulaAgent } from './agents/FormulaAgent'
import { DataCleaningAgent } from './agents/DataCleaningAgent'
import { ChartingAgent } from './agents/ChartingAgent'
import { ContextManager } from './utils/ContextManager'

// API keys
const GEMINI_API_KEY = 'AIzaSyDGOmGxyEWKofCBxcDQ4SBKrrzGhIPY8hE'
const OPENROUTER_API_KEY = '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'

export class AIOrchestrator {
  private providerRouter: ProviderRouter
  private formulaAgent: FormulaAgent
  private dataCleaningAgent: DataCleaningAgent
  private chartingAgent: ChartingAgent
  private contextManager: ContextManager
  
  constructor() {
    // Initialize the provider router with API keys
    this.providerRouter = new ProviderRouter(
      GEMINI_API_KEY,
      OPENROUTER_API_KEY,
      'gemini' // Default provider
    )
    
    // Initialize agents
    this.formulaAgent = new FormulaAgent(this.providerRouter)
    this.dataCleaningAgent = new DataCleaningAgent(this.providerRouter)
    this.chartingAgent = new ChartingAgent(this.providerRouter)
    
    // Initialize context manager
    this.contextManager = new ContextManager()
  }
  
  async processRequest(message: string, context: any = {}): Promise<AIResponse> {
    try {
      // Update context with the current request
      this.contextManager.updateContext(context)
      const enrichedContext = this.contextManager.getContext()
      
      // Determine the intent of the request
      const intent = await this.determineIntent(message, enrichedContext)
      
      // Route to the appropriate agent based on intent
      switch (intent) {
        case 'formula':
          return await this.formulaAgent.process(message, enrichedContext)
        
        case 'data_cleaning':
          return await this.dataCleaningAgent.process(message, enrichedContext)
        
        case 'charting':
          return await this.chartingAgent.process(message, enrichedContext)
        
        case 'general':
        default:
          // For general queries, route based on complexity
          return await this.providerRouter.routeByComplexity(message, enrichedContext)
      }
    } catch (error) {
      console.error('Error in AIOrchestrator:', error)
      
      // Return a fallback response
      return {
        response: 'I encountered an error while processing your request. Please try again.',
        provider: 'fallback',
        model: 'fallback',
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        }
      }
    }
  }
  
  private async determineIntent(message: string, context: any): Promise<string> {
    // Simple keyword-based intent detection
    const lowerMessage = message.toLowerCase()
    
    if (
      lowerMessage.includes('formula') ||
      lowerMessage.includes('calculate') ||
      lowerMessage.includes('compute') ||
      lowerMessage.includes('sum') ||
      lowerMessage.includes('average') ||
      lowerMessage.includes('vlookup') ||
      lowerMessage.includes('xlookup') ||
      lowerMessage.includes('if ')
    ) {
      return 'formula'
    }
    
    if (
      lowerMessage.includes('clean') ||
      lowerMessage.includes('duplicate') ||
      lowerMessage.includes('normalize') ||
      lowerMessage.includes('standardize') ||
      lowerMessage.includes('format data')
    ) {
      return 'data_cleaning'
    }
    
    if (
      lowerMessage.includes('chart') ||
      lowerMessage.includes('graph') ||
      lowerMessage.includes('plot') ||
      lowerMessage.includes('visualize') ||
      lowerMessage.includes('bar chart') ||
      lowerMessage.includes('line chart') ||
      lowerMessage.includes('pie chart')
    ) {
      return 'charting'
    }
    
    // Default to general intent
    return 'general'
  }
  
  // Method to verify an action with the user before executing
  async verifyAction(action: string, context: any): Promise<boolean> {
    // In a real implementation, this would show a confirmation dialog to the user
    // For now, we'll just log the action and return true
    console.log('Action verification requested:', action)
    console.log('Context:', context)
    
    // In a real implementation, this would wait for user confirmation
    return true
  }
}

