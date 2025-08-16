export class ContextManager {
  private context: any = {}
  private conversationHistory: Array<{ role: string; content: string }> = []
  private maxHistoryLength: number = 10
  
  constructor() {
    this.resetContext()
  }
  
  resetContext(): void {
    this.context = {
      activeSheet: null,
      activeCell: null,
      selection: null,
      lastAction: null,
      lastFormula: null,
      lastError: null,
      conversationHistory: []
    }
    
    this.conversationHistory = []
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
      conversationHistory: [...this.conversationHistory]
    }
  }
  
  addToConversation(role: string, content: string): void {
    this.conversationHistory.push({ role, content })
    
    // Limit the history length
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(
        this.conversationHistory.length - this.maxHistoryLength
      )
    }
  }
  
  setLastAction(action: string): void {
    this.context.lastAction = action
  }
  
  setLastFormula(formula: string): void {
    this.context.lastFormula = formula
  }
  
  setLastError(error: string): void {
    this.context.lastError = error
  }
}

