import { AIAgent, AIResponse, AIAction } from '@/types/ai'
import { ProviderRouter } from '../providers/ProviderRouter'

interface PlanStep {
  agentType: string
  action: string
  parameters: any
  description: string
  dependsOn: number[]
}

interface Plan {
  steps: PlanStep[]
  description: string
}

export class PlannerAgent implements AIAgent {
  private providerRouter: ProviderRouter
  
  constructor(providerRouter: ProviderRouter) {
    this.providerRouter = providerRouter
  }
  
  async process(message: string, context: any): Promise<AIResponse> {
    // Enhance the prompt with planning-specific instructions
    const enhancedPrompt = this.createPlanningPrompt(message, context)
    
    // Use the provider router to get a response
    // Use a more powerful model for planning as it requires complex reasoning
    const response = await this.providerRouter.routeRequest(
      enhancedPrompt,
      context,
      'openrouter'
    )
    
    // Extract the plan from the response
    const plan = this.extractPlanFromResponse(response.response)
    
    // Create a more user-friendly response with the plan
    const formattedResponse = this.formatPlanResponse(plan, response.response)
    
    return {
      ...response,
      response: formattedResponse
    }
  }
  
  private createPlanningPrompt(message: string, context: any): string {
    return `
You are a Planner Agent for a spreadsheet application. Your task is to interpret user instructions and create a detailed plan for executing complex tasks using specialized agents.

Current context:
- Active sheet: ${context.activeSheet || 'None'}
- Active cell: ${context.activeCell || 'None'}
- Selection: ${context.selection ? JSON.stringify(context.selection) : 'None'}

User request: ${message}

Available agents:
1. FormulaAgent - Translates natural language into Excel formulas
2. DataCleaningAgent - Handles data preprocessing and normalization
3. ChartingAgent - Creates and customizes visualizations
4. ExecutionAgent - Runs code in a secure sandbox
5. MemoryAgent - Manages user preferences and context
6. InsightsAgent - Analyzes data and provides recommendations
7. ImportExportAgent - Handles file operations

Please analyze the user's request and create a detailed plan with the following structure:

PLAN DESCRIPTION:
[A brief description of the overall plan]

STEPS:
1. [Agent type]: [Action to perform]
   Description: [Detailed description of what this step will do]
   Parameters: [JSON object with parameters for this action]
   Depends on: [List of step numbers this step depends on, or "none"]

2. [Agent type]: [Action to perform]
   Description: [Detailed description of what this step will do]
   Parameters: [JSON object with parameters for this action]
   Depends on: [List of step numbers this step depends on, or "none"]

[Additional steps as needed]

VERIFICATION REQUIRED:
[Describe what the user should verify before proceeding]

Make sure each step is atomic, clearly defined, and includes all necessary parameters. The plan should be executable by the AI Orchestrator.
`
  }
  
  private extractPlanFromResponse(response: string): Plan {
    // Initialize an empty plan
    const plan: Plan = {
      steps: [],
      description: ''
    }
    
    // Extract the plan description
    const descriptionMatch = response.match(/PLAN DESCRIPTION:\s*([\s\S]*?)(?=\n\s*STEPS:|\n\s*$)/i)
    if (descriptionMatch) {
      plan.description = descriptionMatch[1].trim()
    }
    
    // Extract the steps
    const stepsMatch = response.match(/STEPS:\s*([\s\S]*?)(?=\n\s*VERIFICATION REQUIRED:|\n\s*$)/i)
    if (stepsMatch) {
      const stepsText = stepsMatch[1]
      const stepRegex = /(\d+)\.\s*([^:]+):\s*([^\n]+)\s*Description:\s*([\s\S]*?)Parameters:\s*([\s\S]*?)Depends on:\s*([\s\S]*?)(?=\n\s*\d+\.|\n\s*$)/g
      
      let match
      while ((match = stepRegex.exec(stepsText)) !== null) {
        const stepNumber = parseInt(match[1])
        const agentType = match[2].trim()
        const action = match[3].trim()
        const description = match[4].trim()
        
        // Parse parameters as JSON
        let parameters = {}
        try {
          const paramsText = match[5].trim()
          // Check if parameters are in JSON format
          if (paramsText.startsWith('{') && paramsText.endsWith('}')) {
            parameters = JSON.parse(paramsText)
          } else {
            // Simple key-value parsing for non-JSON format
            const paramLines = paramsText.split('\n')
            for (const line of paramLines) {
              const [key, value] = line.split(':').map(s => s.trim())
              if (key && value) {
                parameters[key] = value
              }
            }
          }
        } catch (error) {
          console.error('Failed to parse parameters:', error)
        }
        
        // Parse dependencies
        const dependsOnText = match[6].trim().toLowerCase()
        let dependsOn: number[] = []
        
        if (dependsOnText !== 'none') {
          dependsOn = dependsOnText
            .split(',')
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n))
        }
        
        plan.steps.push({
          agentType,
          action,
          parameters,
          description,
          dependsOn
        })
      }
    }
    
    return plan
  }
  
  private formatPlanResponse(plan: Plan, originalResponse: string): string {
    if (!plan.description || plan.steps.length === 0) {
      return originalResponse
    }
    
    let formattedResponse = `# Plan: ${plan.description}\n\n`
    
    // Add steps
    formattedResponse += '## Steps to Execute:\n\n'
    
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i]
      formattedResponse += `### Step ${i + 1}: ${step.action}\n`
      formattedResponse += `**Agent**: ${step.agentType}\n`
      formattedResponse += `**Description**: ${step.description}\n`
      
      if (step.dependsOn.length > 0) {
        formattedResponse += `**Depends on**: Steps ${step.dependsOn.join(', ')}\n`
      }
      
      formattedResponse += '\n'
    }
    
    // Extract verification required
    const verificationMatch = originalResponse.match(/VERIFICATION REQUIRED:\s*([\s\S]*?)(?=\n\s*$)/i)
    if (verificationMatch) {
      formattedResponse += `## Verification Required:\n${verificationMatch[1].trim()}\n\n`
    }
    
    formattedResponse += '---\n'
    formattedResponse += 'Each step will require your approval before execution. You can modify the plan at any time.'
    
    return formattedResponse
  }
  
  generateActions(plan: Plan): AIAction[] {
    const actions: AIAction[] = []
    
    for (const step of plan.steps) {
      const action: AIAction = {
        type: step.agentType,
        description: step.action,
        parameters: step.parameters,
        confidence: 0.85, // Default confidence level
        requiresConfirmation: true,
        preview: step.description
      }
      
      actions.push(action)
    }
    
    return actions
  }
}

