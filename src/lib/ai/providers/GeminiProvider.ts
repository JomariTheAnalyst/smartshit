import { AIProvider, AIResponse } from '@/types/ai'

export class GeminiProvider implements AIProvider {
  private apiKey: string
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models'
  private model: string = 'gemini-pro'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateResponse(prompt: string, context: any): Promise<AIResponse> {
    try {
      const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: this.formatPrompt(prompt, context)
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      
      // Extract the response text from the Gemini API response
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      
      return {
        response: responseText,
        provider: 'gemini',
        model: this.model,
        usage: {
          promptTokens: 0, // Gemini doesn't provide token usage info in the same way
          completionTokens: 0,
          totalTokens: 0
        }
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error)
      throw error
    }
  }

  private formatPrompt(prompt: string, context: any): string {
    // Create a formatted prompt with context information
    return `
You are an AI assistant for a spreadsheet application. You help users with spreadsheet tasks.

Current context:
- Active sheet: ${context.activeSheet || 'None'}
- Active cell: ${context.activeCell || 'None'}
- Selection: ${context.selection ? JSON.stringify(context.selection) : 'None'}

User request: ${prompt}

Provide a helpful response that addresses the user's request in the context of their spreadsheet.
`
  }
}

