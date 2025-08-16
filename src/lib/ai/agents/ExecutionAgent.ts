import { AIAgent, AIResponse } from '@/types/ai'
import { ProviderRouter } from '../providers/ProviderRouter'
import { E2B } from '@e2b/sdk'

export class ExecutionAgent implements AIAgent {
  private providerRouter: ProviderRouter
  private e2bClient: any
  
  constructor(providerRouter: ProviderRouter, apiKey: string) {
    this.providerRouter = providerRouter
    
    // Initialize E2B client with the provided API key
    this.initializeE2B(apiKey)
  }
  
  private async initializeE2B(apiKey: string) {
    try {
      // Initialize E2B SDK with the provided API key
      this.e2bClient = new E2B({
        apiKey: apiKey
      })
      
      console.log('E2B client initialized successfully')
    } catch (error) {
      console.error('Failed to initialize E2B client:', error)
    }
  }
  
  async process(message: string, context: any): Promise<AIResponse> {
    // Enhance the prompt with execution-specific instructions
    const enhancedPrompt = this.createExecutionPrompt(message, context)
    
    // Use the provider router to get a response
    const response = await this.providerRouter.routeRequest(
      enhancedPrompt,
      context,
      'openrouter' // Use a more powerful model for code generation
    )
    
    // Extract code from the response if present
    const extractedCode = this.extractCodeFromResponse(response.response)
    
    if (extractedCode) {
      try {
        // Execute the code in the E2B sandbox
        const executionResult = await this.executeCode(extractedCode, context)
        
        // Append the execution result to the response
        return {
          ...response,
          response: `${response.response}\n\nExecution Result:\n${executionResult}`
        }
      } catch (error) {
        // If execution fails, append the error to the response
        return {
          ...response,
          response: `${response.response}\n\nExecution Error:\n${error}`
        }
      }
    }
    
    return response
  }
  
  private createExecutionPrompt(message: string, context: any): string {
    return `
You are an Execution Agent for a spreadsheet application. Your task is to generate and execute code based on the user's request.

Current context:
- Active sheet: ${context.activeSheet || 'None'}
- Active cell: ${context.activeCell || 'None'}
- Selection: ${context.selection ? JSON.stringify(context.selection) : 'None'}

User request: ${message}

Please provide:
1. A clear explanation of what code needs to be executed
2. The code to execute (Python or JavaScript)
3. Expected output and how it should be integrated into the spreadsheet

Format your response as follows:
EXPLANATION: [Brief explanation of what the code will do]

CODE:
\`\`\`python
# Your code here
\`\`\`

EXPECTED OUTPUT: [Description of expected output]

INTEGRATION: [How the output should be integrated into the spreadsheet]

Remember that the code will be executed in a secure sandbox environment with limited access to resources.
`
  }
  
  private extractCodeFromResponse(response: string): string | null {
    // Extract code blocks from the response
    const codeBlockRegex = /```(?:python|javascript|js)?\s*([\s\S]*?)```/g
    const matches = response.match(codeBlockRegex)
    
    if (matches && matches.length > 0) {
      // Extract the code from the first code block
      const codeBlock = matches[0]
      const code = codeBlock.replace(/```(?:python|javascript|js)?\s*/, '').replace(/```$/, '')
      return code.trim()
    }
    
    return null
  }
  
  private async executeCode(code: string, context: any): Promise<string> {
    if (!this.e2bClient) {
      throw new Error('E2B client not initialized')
    }
    
    try {
      // Create a new sandbox session
      const sandbox = await this.e2bClient.sandbox.create({
        template: 'base',
        metadata: {
          source: 'spreadsheet-app'
        }
      })
      
      // Write the code to a file in the sandbox
      const filename = code.includes('import pandas') || code.includes('import numpy') 
        ? 'script.py' 
        : 'script.js'
      
      await sandbox.filesystem.write(filename, code)
      
      // Execute the code
      let result
      if (filename === 'script.py') {
        result = await sandbox.process.start({
          cmd: 'python3',
          args: [filename],
          onStdout: (data) => console.log('stdout:', data.line),
          onStderr: (data) => console.error('stderr:', data.line)
        })
      } else {
        result = await sandbox.process.start({
          cmd: 'node',
          args: [filename],
          onStdout: (data) => console.log('stdout:', data.line),
          onStderr: (data) => console.error('stderr:', data.line)
        })
      }
      
      // Close the sandbox
      await sandbox.close()
      
      return result.stdout.join('\n')
    } catch (error) {
      console.error('Error executing code in E2B sandbox:', error)
      throw new Error(`Failed to execute code: ${error.message}`)
    }
  }
}

