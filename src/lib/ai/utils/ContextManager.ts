// Context Manager class
export class ContextManager {
  private context: Record<string, any> = {}
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  
  // Set a context value
  setContext(key: string, value: any): void {
    this.context[key] = value
  }
  
  // Get a context value
  getContextValue(key: string): any {
    return this.context[key]
  }
  
  // Get the entire context
  getContext(): Record<string, any> {
    return { ...this.context }
  }
  
  // Clear the context
  clearContext(): void {
    this.context = {}
  }
  
  // Add a message to the conversation history
  addMessage(role: 'user' | 'assistant', content: string): void {
    this.conversationHistory.push({ role, content })
  }
  
  // Get the conversation history
  getConversationHistory(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return [...this.conversationHistory]
  }
  
  // Clear the conversation history
  clearConversationHistory(): void {
    this.conversationHistory = []
  }
  
  // Get the conversation history as a string
  getConversationHistoryString(): string {
    return this.conversationHistory
      .map(message => `${message.role}: ${message.content}`)
      .join('\n')
  }
  
  // Get the recent conversation history (last n messages)
  getRecentConversationHistory(n: number): Array<{ role: 'user' | 'assistant'; content: string }> {
    return this.conversationHistory.slice(-n)
  }
}

