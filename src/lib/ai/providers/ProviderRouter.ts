import { AIProvider, AIResponse } from '@/types/ai'
import { GeminiProvider } from './GeminiProvider'
import { OpenRouterProvider } from './OpenRouterProvider'

export class ProviderRouter {
  private providers: Map<string, AIProvider>
  private defaultProvider: string
  
  constructor(
    geminiApiKey: string,
    openRouterApiKey: string,
    defaultProvider: string = 'gemini'
  ) {
    this.providers = new Map()
    
    // Initialize providers
    this.providers.set('gemini', new GeminiProvider(geminiApiKey))
    this.providers.set('openrouter', new OpenRouterProvider(openRouterApiKey))
    
    this.defaultProvider = defaultProvider
  }
  
  async routeRequest(
    prompt: string,
    context: any,
    provider?: string,
    model?: string
  ): Promise<AIResponse> {
    // Determine which provider to use
    const providerKey = provider || this.defaultProvider
    
    // Get the provider
    const selectedProvider = this.providers.get(providerKey)
    
    if (!selectedProvider) {
      throw new Error(`Provider ${providerKey} not found`)
    }
    
    // Generate the response
    return await selectedProvider.generateResponse(prompt, context)
  }
  
  // Method to route based on task complexity
  async routeByComplexity(prompt: string, context: any): Promise<AIResponse> {
    // Simple heuristic for complexity: longer prompts or those with specific keywords
    // are considered more complex
    const complexityKeywords = [
      'analyze', 'complex', 'advanced', 'predict', 
      'statistical', 'correlation', 'regression', 'forecast',
      'vlookup', 'xlookup', 'index match', 'pivot'
    ]
    
    const isComplex = prompt.length > 100 || 
      complexityKeywords.some(keyword => 
        prompt.toLowerCase().includes(keyword)
      )
    
    // Use OpenRouter (GPT-4) for complex tasks, Gemini for simpler ones
    const provider = isComplex ? 'openrouter' : 'gemini'
    
    return this.routeRequest(prompt, context, provider)
  }
}

