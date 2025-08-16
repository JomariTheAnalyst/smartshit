import { Agent } from '../AgentFramework'
import { ProviderRouter } from '../providers/ProviderRouter'

// Formula Agent class
export class FormulaAgent implements Agent {
  id: string = 'formula_agent'
  name: string = 'Formula Agent'
  description: string = 'Translates natural language descriptions into Excel formulas'
  capabilities: string[] = [
    'formula_generation',
    'formula_explanation',
    'formula_debugging'
  ]
  
  private providerRouter: ProviderRouter
  
  constructor(providerRouter: ProviderRouter) {
    this.providerRouter = providerRouter
  }
  
  // Process a request
  async process(
    request: string,
    context: any
  ): Promise<{ response: string; confidence: number }> {
    try {
      // Determine the type of formula request
      const requestType = this.determineRequestType(request)
      
      // Handle the request based on its type
      switch (requestType) {
        case 'generate':
          return await this.generateFormula(request, context)
        case 'explain':
          return await this.explainFormula(request, context)
        case 'debug':
          return await this.debugFormula(request, context)
        default:
          return {
            response: 'I\'m not sure what you want to do with formulas. Could you provide more details?',
            confidence: 0.5
          }
      }
    } catch (error) {
      console.error('Error in FormulaAgent:', error)
      return {
        response: 'I encountered an error while processing your formula request. Please try again.',
        confidence: 0
      }
    }
  }
  
  // Determine the type of formula request
  private determineRequestType(request: string): 'generate' | 'explain' | 'debug' {
    const lowerRequest = request.toLowerCase()
    
    if (lowerRequest.includes('explain') || lowerRequest.includes('what does') || lowerRequest.includes('how does')) {
      return 'explain'
    } else if (lowerRequest.includes('fix') || lowerRequest.includes('debug') || lowerRequest.includes('error')) {
      return 'debug'
    } else {
      return 'generate'
    }
  }
  
  // Generate a formula
  private async generateFormula(
    request: string,
    context: any
  ): Promise<{ response: string; confidence: number }> {
    // Create a prompt for the LLM
    const prompt = `
      You are an Excel formula expert. Generate an Excel formula based on the following request:
      
      REQUEST: ${request}
      
      CONTEXT:
      ${JSON.stringify(context)}
      
      Provide the formula and a brief explanation of how it works.
      Format your response as:
      FORMULA: [the Excel formula]
      EXPLANATION: [explanation of how the formula works]
      CONFIDENCE: [a number between 0 and 1 indicating your confidence in the formula]
    `
    
    // Generate the formula using the LLM
    const response = await this.providerRouter.routeRequest(prompt, {
      complexity: 'medium'
    })
    
    // Parse the response
    const formulaMatch = response.match(/FORMULA: (.+)/)
    const explanationMatch = response.match(/EXPLANATION: (.+)/)
    const confidenceMatch = response.match(/CONFIDENCE: (.+)/)
    
    const formula = formulaMatch ? formulaMatch[1] : 'Could not generate a formula.'
    const explanation = explanationMatch ? explanationMatch[1] : 'No explanation available.'
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5
    
    return {
      response: `Here's a formula that should work for you:
        
        ${formula}
        
        ${explanation}`,
      confidence
    }
  }
  
  // Explain a formula
  private async explainFormula(
    request: string,
    context: any
  ): Promise<{ response: string; confidence: number }> {
    // Extract the formula from the request
    const formulaMatch = request.match(/=.+/)
    const formula = formulaMatch ? formulaMatch[0] : ''
    
    if (!formula) {
      return {
        response: 'I couldn\'t find a formula in your request. Please include the formula you want me to explain.',
        confidence: 0.5
      }
    }
    
    // Create a prompt for the LLM
    const prompt = `
      You are an Excel formula expert. Explain the following Excel formula in simple terms:
      
      FORMULA: ${formula}
      
      Break down each part of the formula and explain what it does.
      Format your response as:
      EXPLANATION: [detailed explanation of the formula]
      CONFIDENCE: [a number between 0 and 1 indicating your confidence in the explanation]
    `
    
    // Generate the explanation using the LLM
    const response = await this.providerRouter.routeRequest(prompt, {
      complexity: 'medium'
    })
    
    // Parse the response
    const explanationMatch = response.match(/EXPLANATION: (.+)/s)
    const confidenceMatch = response.match(/CONFIDENCE: (.+)/)
    
    const explanation = explanationMatch ? explanationMatch[1] : 'Could not explain the formula.'
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5
    
    return {
      response: `Here's an explanation of the formula ${formula}:
        
        ${explanation}`,
      confidence
    }
  }
  
  // Debug a formula
  private async debugFormula(
    request: string,
    context: any
  ): Promise<{ response: string; confidence: number }> {
    // Extract the formula from the request
    const formulaMatch = request.match(/=.+/)
    const formula = formulaMatch ? formulaMatch[0] : ''
    
    if (!formula) {
      return {
        response: 'I couldn\'t find a formula in your request. Please include the formula you want me to debug.',
        confidence: 0.5
      }
    }
    
    // Create a prompt for the LLM
    const prompt = `
      You are an Excel formula expert. Debug the following Excel formula:
      
      FORMULA: ${formula}
      
      REQUEST: ${request}
      
      CONTEXT:
      ${JSON.stringify(context)}
      
      Identify any errors in the formula and provide a corrected version.
      Format your response as:
      ERRORS: [list of errors found]
      CORRECTED_FORMULA: [the corrected Excel formula]
      EXPLANATION: [explanation of the fixes]
      CONFIDENCE: [a number between 0 and 1 indicating your confidence in the correction]
    `
    
    // Generate the debug response using the LLM
    const response = await this.providerRouter.routeRequest(prompt, {
      complexity: 'medium'
    })
    
    // Parse the response
    const errorsMatch = response.match(/ERRORS: (.+)/s)
    const correctedFormulaMatch = response.match(/CORRECTED_FORMULA: (.+)/)
    const explanationMatch = response.match(/EXPLANATION: (.+)/s)
    const confidenceMatch = response.match(/CONFIDENCE: (.+)/)
    
    const errors = errorsMatch ? errorsMatch[1] : 'No specific errors found.'
    const correctedFormula = correctedFormulaMatch ? correctedFormulaMatch[1] : formula
    const explanation = explanationMatch ? explanationMatch[1] : 'No explanation available.'
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5
    
    return {
      response: `I've analyzed the formula ${formula} and found the following issues:
        
        ${errors}
        
        Here's the corrected formula:
        ${correctedFormula}
        
        ${explanation}`,
      confidence
    }
  }
}

