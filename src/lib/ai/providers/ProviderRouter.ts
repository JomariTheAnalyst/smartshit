// LLM Provider interface
export interface LLMProvider {
  id: string
  name: string
  description: string
  capabilities: string[]
  maxTokens: number
  costPerToken: number
  latency: 'low' | 'medium' | 'high'
  
  generateText: (prompt: string, options?: any) => Promise<string>
  generateChat: (messages: Array<{ role: string; content: string }>, options?: any) => Promise<string>
}

// Provider Router class
export class ProviderRouter {
  private providers: Map<string, LLMProvider> = new Map()
  private defaultProviderId: string | null = null
  
  // Register a provider
  registerProvider(provider: LLMProvider): void {
    this.providers.set(provider.id, provider)
    
    // Set as default if no default is set
    if (this.defaultProviderId === null) {
      this.defaultProviderId = provider.id
    }
  }
  
  // Set the default provider
  setDefaultProvider(id: string): void {
    if (!this.providers.has(id)) {
      throw new Error(`Provider with ID "${id}" not found.`)
    }
    
    this.defaultProviderId = id
  }
  
  // Get a provider by ID
  getProvider(id: string): LLMProvider | undefined {
    return this.providers.get(id)
  }
  
  // Get the default provider
  getDefaultProvider(): LLMProvider | null {
    if (this.defaultProviderId === null) {
      return null
    }
    
    return this.providers.get(this.defaultProviderId) || null
  }
  
  // Get all registered providers
  getAllProviders(): LLMProvider[] {
    return Array.from(this.providers.values())
  }
  
  // Route a request to the appropriate provider based on complexity
  async routeRequest(
    prompt: string,
    options?: {
      preferredProviderId?: string
      complexity?: 'low' | 'medium' | 'high'
      maxCost?: number
    }
  ): Promise<string> {
    const complexity = options?.complexity || 'medium'
    const maxCost = options?.maxCost || Infinity
    
    // If a preferred provider is specified and available, use it
    if (options?.preferredProviderId && this.providers.has(options.preferredProviderId)) {
      const provider = this.providers.get(options.preferredProviderId)!
      return await provider.generateText(prompt)
    }
    
    // Otherwise, select a provider based on complexity and cost
    const suitableProviders = Array.from(this.providers.values()).filter(provider => {
      // Filter by complexity
      if (complexity === 'high' && !provider.capabilities.includes('complex_reasoning')) {
        return false
      }
      
      // Filter by cost (assuming a 1000 token response)
      if (provider.costPerToken * 1000 > maxCost) {
        return false
      }
      
      return true
    })
    
    // Sort by latency (for low complexity), capabilities (for high complexity), or a balance
    let selectedProvider: LLMProvider
    
    if (complexity === 'low') {
      // For low complexity, prioritize speed
      selectedProvider = suitableProviders.sort((a, b) => {
        const latencyScore = { low: 0, medium: 1, high: 2 }
        return latencyScore[a.latency] - latencyScore[b.latency]
      })[0]
    } else if (complexity === 'high') {
      // For high complexity, prioritize capabilities
      selectedProvider = suitableProviders.sort((a, b) => {
        return b.capabilities.length - a.capabilities.length
      })[0]
    } else {
      // For medium complexity, balance speed and capabilities
      selectedProvider = suitableProviders.sort((a, b) => {
        const latencyScore = { low: 0, medium: 1, high: 2 }
        const capabilityScore = b.capabilities.length - a.capabilities.length
        return latencyScore[a.latency] - latencyScore[b.latency] + capabilityScore
      })[0]
    }
    
    // If no suitable provider is found, use the default provider
    if (!selectedProvider) {
      selectedProvider = this.getDefaultProvider()!
      
      if (!selectedProvider) {
        throw new Error('No suitable provider found and no default provider set.')
      }
    }
    
    // Generate text with the selected provider
    return await selectedProvider.generateText(prompt)
  }
  
  // Route a chat request to the appropriate provider
  async routeChatRequest(
    messages: Array<{ role: string; content: string }>,
    options?: {
      preferredProviderId?: string
      complexity?: 'low' | 'medium' | 'high'
      maxCost?: number
    }
  ): Promise<string> {
    const complexity = options?.complexity || 'medium'
    const maxCost = options?.maxCost || Infinity
    
    // If a preferred provider is specified and available, use it
    if (options?.preferredProviderId && this.providers.has(options.preferredProviderId)) {
      const provider = this.providers.get(options.preferredProviderId)!
      return await provider.generateChat(messages)
    }
    
    // Otherwise, select a provider based on complexity and cost
    const suitableProviders = Array.from(this.providers.values()).filter(provider => {
      // Filter by complexity
      if (complexity === 'high' && !provider.capabilities.includes('complex_reasoning')) {
        return false
      }
      
      // Filter by cost (assuming a 1000 token response)
      if (provider.costPerToken * 1000 > maxCost) {
        return false
      }
      
      return true
    })
    
    // Sort by latency (for low complexity), capabilities (for high complexity), or a balance
    let selectedProvider: LLMProvider
    
    if (complexity === 'low') {
      // For low complexity, prioritize speed
      selectedProvider = suitableProviders.sort((a, b) => {
        const latencyScore = { low: 0, medium: 1, high: 2 }
        return latencyScore[a.latency] - latencyScore[b.latency]
      })[0]
    } else if (complexity === 'high') {
      // For high complexity, prioritize capabilities
      selectedProvider = suitableProviders.sort((a, b) => {
        return b.capabilities.length - a.capabilities.length
      })[0]
    } else {
      // For medium complexity, balance speed and capabilities
      selectedProvider = suitableProviders.sort((a, b) => {
        const latencyScore = { low: 0, medium: 1, high: 2 }
        const capabilityScore = b.capabilities.length - a.capabilities.length
        return latencyScore[a.latency] - latencyScore[b.latency] + capabilityScore
      })[0]
    }
    
    // If no suitable provider is found, use the default provider
    if (!selectedProvider) {
      selectedProvider = this.getDefaultProvider()!
      
      if (!selectedProvider) {
        throw new Error('No suitable provider found and no default provider set.')
      }
    }
    
    // Generate chat response with the selected provider
    return await selectedProvider.generateChat(messages)
  }
}

