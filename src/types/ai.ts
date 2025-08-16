export interface AIResponse {
  response: string
  provider: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface AIProvider {
  generateResponse(prompt: string, context: any): Promise<AIResponse>
}

export interface AIAgent {
  process(message: string, context: any): Promise<AIResponse>
}

export interface AIAction {
  type: string
  description: string
  parameters: any
  confidence: number
  preview?: string
  requiresConfirmation: boolean
}

export interface AIVerificationRequest {
  action: AIAction
  context: any
  message: string
}

export interface AIVerificationResponse {
  approved: boolean
  feedback?: string
}

export interface AIToolCall {
  name: string
  arguments: any
}

export interface AIToolResponse {
  result: any
  error?: string
}

export interface AITool {
  name: string
  description: string
  parameters: any
  execute(args: any): Promise<AIToolResponse>
}

export interface AIOrchestrationResult {
  response: string
  actions: AIAction[]
  toolCalls: AIToolCall[]
  provider: string
  model: string
}

export interface AIAgentConfig {
  name: string
  description: string
  capabilities: string[]
  defaultProvider: string
  defaultModel: string
}

