interface ConversationEntry {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export class ContextManager {
  private context: any
  private conversationHistory: ConversationEntry[]
  private lastAction: string | null
  private maxHistoryLength: number
  
  constructor() {
    this.context = {}
    this.conversationHistory = []
    this.lastAction = null
    this.maxHistoryLength = 20
  }
  
  updateContext(newContext: any): void {
    this.context = {
      ...this.context,
      ...newContext
    }
  }
  
  getContext(): any {
    return {
      ...this.context,
      conversationHistory: this.conversationHistory,
      lastAction: this.lastAction
    }
  }
  
  addToConversation(role: 'user' | 'assistant' | 'system', content: string): void {
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
  
  getConversationHistory(count: number = this.maxHistoryLength): ConversationEntry[] {
    return this.conversationHistory.slice(-count)
  }
  
  setLastAction(action: string): void {
    this.lastAction = action
  }
  
  getLastAction(): string | null {
    return this.lastAction
  }
  
  resetContext(): void {
    this.context = {}
    this.conversationHistory = []
    this.lastAction = null
  }
  
  getRecentMessages(count: number = 5): string {
    const recentMessages = this.conversationHistory.slice(-count)
    
    return recentMessages.map(entry => 
      `${entry.role}: ${entry.content}`
    ).join('\n\n')
  }
  
  getFormattedContext(): string {
    const { conversationHistory, lastAction, ...restContext } = this.context
    
    let formattedContext = 'Current Context:\n'
    
    // Add basic context
    for (const [key, value] of Object.entries(restContext)) {
      formattedContext += `- ${key}: ${JSON.stringify(value)}\n`
    }
    
    // Add last action
    formattedContext += `- Last action: ${this.lastAction || 'None'}\n`
    
    // Add recent conversation
    formattedContext += '\nRecent Conversation:\n'
    formattedContext += this.getRecentMessages()
    
    return formattedContext
  }
}

