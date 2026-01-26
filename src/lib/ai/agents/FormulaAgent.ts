import { AIAgent, AIResponse } from '@/types/ai'
import { ProviderRouter } from '../providers/ProviderRouter'

export class FormulaAgent implements AIAgent {
  private providerRouter: ProviderRouter
  
  constructor(providerRouter: ProviderRouter) {
    this.providerRouter = providerRouter
  }
  
  async process(message: string, context: any): Promise<AIResponse> {
    // Enhance the prompt with formula-specific instructions
    const enhancedPrompt = this.createFormulaPrompt(message, context)
    
    // Use OpenRouter (GPT-4) for formula generation as it tends to be more accurate
    return await this.providerRouter.routeRequest(
      enhancedPrompt,
      context,
      'openrouter'
    )
  }
  
  private createFormulaPrompt(message: string, context: any): string {
    return `
You are a Formula Agent for a spreadsheet application. Your task is to translate the user's natural language request into a valid Excel formula.

Current context:
- Active sheet: ${context.activeSheet || 'None'}
- Active cell: ${context.activeCell || 'None'}
- Selection: ${context.selection ? JSON.stringify(context.selection) : 'None'}

User request: ${message}

Please provide:
1. The Excel formula that addresses the user's request
2. A brief explanation of how the formula works
3. Any assumptions you made in creating the formula

Format your response as follows:
FORMULA: [The Excel formula]
EXPLANATION: [Brief explanation of how the formula works]
ASSUMPTIONS: [Any assumptions you made]

Only use standard Excel functions and syntax. Ensure the formula is syntactically correct.
`
  }
  
  // Method to validate a formula
  validateFormula(formula: string): boolean {
    // In a real implementation, this would check if the formula is valid
    // For now, we'll just do some basic checks
    
    // Check if the formula starts with =
    if (!formula.startsWith('=')) {
      return false
    }
    
    // Check for balanced parentheses
    let parenCount = 0
    for (const char of formula) {
      if (char === '(') parenCount++
      if (char === ')') parenCount--
      if (parenCount < 0) return false
    }
    
    return parenCount === 0
  }
}

