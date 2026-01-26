import { AIProvider, AIResponse } from '@/types/ai'

export class OpenRouterProvider implements AIProvider {
  private apiKey: string
  private baseUrl: string = 'https://openrouter.ai/api/v1'
  private model: string
  
  constructor(apiKey: string, model: string = 'openai/gpt-4-turbo') {
    this.apiKey = apiKey
    this.model = model
  }
  
  async generateResponse(prompt: string, context: any): Promise<AIResponse> {
    try {
      const url = `${this.baseUrl}/chat/completions`
      
      const requestBody = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(context)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://smartsheet-ai.vercel.app', // Replace with your actual domain
          'X-Title': 'AI-Powered Spreadsheet'
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`)
      }
      
      const data = await response.json()
      
      // Extract the response text from the OpenRouter API response
      const responseText = data.choices?.[0]?.message?.content || ''
      
      return {
        response: responseText,
        provider: 'openrouter',
        model: this.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        }
      }
    } catch (error) {
      console.error('Error calling OpenRouter API:', error)
      throw error
    }
  }
  
  private getSystemPrompt(context: any): string {
    return `
You are an AI assistant for a spreadsheet application. You help users with spreadsheet tasks.

Current context:
- Active sheet: ${context.activeSheet || 'None'}
- Active cell: ${context.activeCell || 'None'}
- Selection: ${context.selection ? JSON.stringify(context.selection) : 'None'}

Your role is to assist the user with their spreadsheet tasks. You can help with formulas, data analysis, formatting, and other spreadsheet-related tasks.

Always provide clear, concise, and helpful responses. If you need to suggest a formula or code, format it properly.
`
  }
}

