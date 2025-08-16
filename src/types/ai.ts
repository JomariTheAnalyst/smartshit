export interface AIAction {
  type: string
  description: string
  parameters: any
  confidence: number
  preview?: string
  requiresConfirmation: boolean
}

export interface AIResponse {
  response: string
  provider: string
  model: string
}

export interface AIOrchestrationResult {
  response: string
  actions: AIAction[]
  toolCalls: any[]
  provider: string
  model: string
}

export interface AIAgent {
  process(message: string, context: any): Promise<AIResponse>
}

export interface LLMProvider {
  generateResponse(prompt: string, context: any): Promise<AIResponse>
}

export interface ProviderConfig {
  name: string
  provider: LLMProvider
  priority: number
}

