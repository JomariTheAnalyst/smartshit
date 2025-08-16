import { ProviderRouter } from './providers/ProviderRouter'
import { GeminiProvider } from './providers/GeminiProvider'
import { OpenRouterProvider } from './providers/OpenRouterProvider'
import { FormulaAgent } from './agents/FormulaAgent'
import { DataCleaningAgent } from './agents/DataCleaningAgent'
import { ChartingAgent } from './agents/ChartingAgent'
import { PlannerAgent } from './agents/PlannerAgent'
import { ExecutionAgent } from './agents/ExecutionAgent'
import { MemoryAgent } from './agents/MemoryAgent'
import { InsightsAgent } from './agents/InsightsAgent'
import { ImportExportAgent } from './agents/ImportExportAgent'
import { ContextManager } from './utils/ContextManager'
import { AIAction, AIOrchestrationResult } from '@/types/ai'

export class AIOrchestrator {
  private providerRouter: ProviderRouter
  private formulaAgent: FormulaAgent
  private dataCleaningAgent: DataCleaningAgent
  private chartingAgent: ChartingAgent
  private plannerAgent: PlannerAgent
  private executionAgent: ExecutionAgent
  private memoryAgent: MemoryAgent
  private insightsAgent: InsightsAgent
  private importExportAgent: ImportExportAgent
  private contextManager: ContextManager
  
  constructor() {
    // Initialize providers
    const geminiProvider = new GeminiProvider('AIzaSyDGOmGxyEWKofCBxcDQ4SBKrrzGhIPY8hE')
    const openRouterProvider = new OpenRouterProvider('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')
    
    // Initialize provider router
    this.providerRouter = new ProviderRouter([
      { name: 'gemini', provider: geminiProvider, priority: 1 },
      { name: 'openrouter', provider: openRouterProvider, priority: 2 }
    ])
    
    // Initialize context manager
    this.contextManager = new ContextManager()
    
    // Initialize agents
    this.formulaAgent = new FormulaAgent(this.providerRouter)
    this.dataCleaningAgent = new DataCleaningAgent(this.providerRouter)
    this.chartingAgent = new ChartingAgent(this.providerRouter)
    this.plannerAgent = new PlannerAgent(this.providerRouter)
    this.executionAgent = new ExecutionAgent(this.providerRouter, 'e2b_f9daf6ff9395b3facf8a2af84778ff4aa3bc6c95')
    this.memoryAgent = new MemoryAgent(this.providerRouter)
    this.insightsAgent = new InsightsAgent(this.providerRouter)
    this.importExportAgent = new ImportExportAgent(this.providerRouter)
  }
  
  async processRequest(message: string, context: any): Promise<AIOrchestrationResult> {
    // Update context with the current request
    this.contextManager.updateContext(context)
    this.contextManager.addToConversation('user', message)
    
    // Get the full context including conversation history
    const fullContext = this.contextManager.getContext()
    
    // First, use the memory agent to retrieve relevant preferences and history
    await this.memoryAgent.process(message, fullContext)
    
    // Then, use the planner agent to determine the best course of action
    const plannerResponse = await this.plannerAgent.process(message, fullContext)
    
    // Extract actions from the planner response
    const actions = this.extractActionsFromResponse(plannerResponse.response)
    
    // Route the request to the appropriate agent based on the message content
    let agentResponse
    
    if (message.includes('formula') || message.includes('function') || message.includes('calculate')) {
      agentResponse = await this.formulaAgent.process(message, fullContext)
      this.contextManager.setLastAction('formula')
    } else if (message.includes('clean') || message.includes('normalize') || message.includes('preprocess')) {
      agentResponse = await this.dataCleaningAgent.process(message, fullContext)
      this.contextManager.setLastAction('data_cleaning')
    } else if (message.includes('chart') || message.includes('graph') || message.includes('plot') || message.includes('visualize')) {
      agentResponse = await this.chartingAgent.process(message, fullContext)
      this.contextManager.setLastAction('charting')
    } else if (message.includes('code') || message.includes('script') || message.includes('run') || message.includes('execute')) {
      agentResponse = await this.executionAgent.process(message, fullContext)
      this.contextManager.setLastAction('execution')
    } else if (message.includes('analyze') || message.includes('insight') || message.includes('summary') || message.includes('trend')) {
      agentResponse = await this.insightsAgent.process(message, fullContext)
      this.contextManager.setLastAction('insights')
    } else if (message.includes('import') || message.includes('export') || message.includes('file') || message.includes('save')) {
      agentResponse = await this.importExportAgent.process(message, fullContext)
      this.contextManager.setLastAction('import_export')
    } else {
      // Default to using the planner agent's response
      agentResponse = plannerResponse
      this.contextManager.setLastAction('planning')
    }
    
    // Add the assistant's response to the conversation history
    this.contextManager.addToConversation('assistant', agentResponse.response)
    
    // Return the orchestration result
    return {
      response: agentResponse.response,
      actions,
      toolCalls: [],
      provider: agentResponse.provider,
      model: agentResponse.model
    }
  }
  
  private extractActionsFromResponse(response: string): AIAction[] {
    const actions: AIAction[] = []
    
    // Extract formula suggestions
    const formulaMatch = response.match(/```(?:excel|formula)?\s*(=[\s\S]*?)```/g)
    if (formulaMatch) {
      for (const match of formulaMatch) {
        const formula = match.replace(/```(?:excel|formula)?\s*/, '').replace(/```$/, '').trim()
        
        actions.push({
          type: 'formula_suggestion',
          description: 'Apply formula to the selected cell',
          parameters: {
            formula,
            cell: 'active'
          },
          confidence: 0.9,
          preview: formula,
          requiresConfirmation: true
        })
      }
    }
    
    // Extract chart suggestions
    const chartMatch = response.match(/SUGGESTED VISUALIZATIONS:\s*([\s\S]*?)(?=\n\s*$|\n\s*\n)/i)
    if (chartMatch) {
      const chartSuggestions = chartMatch[1].split('\n').filter(line => line.trim().startsWith('-'))
      
      for (const suggestion of chartSuggestions) {
        const chartDescription = suggestion.replace(/^-\s*/, '').trim()
        
        let chartType = 'bar'
        if (chartDescription.toLowerCase().includes('line')) chartType = 'line'
        if (chartDescription.toLowerCase().includes('pie')) chartType = 'pie'
        if (chartDescription.toLowerCase().includes('scatter')) chartType = 'scatter'
        
        actions.push({
          type: 'chart_suggestion',
          description: chartDescription,
          parameters: {
            type: chartType,
            dataRange: 'selection'
          },
          confidence: 0.8,
          preview: `Create a ${chartType} chart based on the selected data`,
          requiresConfirmation: true
        })
      }
    }
    
    // Extract data cleaning suggestions
    const cleaningMatch = response.match(/DATA TRANSFORMATIONS:\s*([\s\S]*?)(?=\n\s*$|\n\s*\n)/i)
    if (cleaningMatch) {
      const cleaningSuggestions = cleaningMatch[1].split('\n').filter(line => line.trim().startsWith('-'))
      
      for (const suggestion of cleaningSuggestions) {
        const cleaningDescription = suggestion.replace(/^-\s*/, '').trim()
        
        actions.push({
          type: 'data_cleaning_suggestion',
          description: cleaningDescription,
          parameters: {
            range: 'selection'
          },
          confidence: 0.85,
          preview: `Clean data: ${cleaningDescription}`,
          requiresConfirmation: true
        })
      }
    }
    
    return actions
  }
  
  getContextManager(): ContextManager {
    return this.contextManager
  }
  
  resetContext(): void {
    this.contextManager.resetContext()
  }
}

