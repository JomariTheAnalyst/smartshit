import { Agent } from '../AgentFramework'
import { ProviderRouter } from '../providers/ProviderRouter'

// Chart type
export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'column' | 'doughnut' | 'radar'

// Chart configuration
export interface ChartConfig {
  type: ChartType
  title: string
  dataRange: string
  labels?: string
  series: Array<{
    name: string
    data: string
  }>
  options?: {
    xAxis?: {
      title?: string
      min?: number
      max?: number
    }
    yAxis?: {
      title?: string
      min?: number
      max?: number
    }
    legend?: boolean
    stacked?: boolean
    colors?: string[]
  }
}

// Charting Agent class
export class ChartingAgent implements Agent {
  id: string = 'charting_agent'
  name: string = 'Charting Agent'
  description: string = 'Creates and updates visualizations based on spreadsheet data'
  capabilities: string[] = [
    'chart_creation',
    'chart_recommendation',
    'chart_customization'
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
      // Determine the type of chart request
      const requestType = this.determineRequestType(request)
      
      // Handle the request based on its type
      switch (requestType) {
        case 'create':
          return await this.createChart(request, context)
        case 'recommend':
          return await this.recommendChart(request, context)
        case 'customize':
          return await this.customizeChart(request, context)
        default:
          return {
            response: 'I\'m not sure what you want to do with charts. Could you provide more details?',
            confidence: 0.5
          }
      }
    } catch (error) {
      console.error('Error in ChartingAgent:', error)
      return {
        response: 'I encountered an error while processing your chart request. Please try again.',
        confidence: 0
      }
    }
  }
  
  // Determine the type of chart request
  private determineRequestType(request: string): 'create' | 'recommend' | 'customize' {
    const lowerRequest = request.toLowerCase()
    
    if (lowerRequest.includes('recommend') || lowerRequest.includes('suggest') || lowerRequest.includes('what chart')) {
      return 'recommend'
    } else if (lowerRequest.includes('customize') || lowerRequest.includes('change') || lowerRequest.includes('update')) {
      return 'customize'
    } else {
      return 'create'
    }
  }
  
  // Create a chart
  private async createChart(
    request: string,
    context: any
  ): Promise<{ response: string; confidence: number }> {
    // Create a prompt for the LLM
    const prompt = `
      You are a data visualization expert. Create a chart configuration based on the following request:
      
      REQUEST: ${request}
      
      CONTEXT:
      ${JSON.stringify(context)}
      
      Analyze the request and determine the best chart type, data range, and configuration.
      Format your response as a JSON object with the following structure:
      {
        "chartConfig": {
          "type": "bar", // or line, pie, scatter, etc.
          "title": "Chart Title",
          "dataRange": "A1:B10", // The range of cells containing the data
          "labels": "A1:A10", // Optional: The range of cells containing the labels
          "series": [
            {
              "name": "Series 1",
              "data": "B1:B10"
            }
          ],
          "options": {
            "xAxis": {
              "title": "X-Axis Title"
            },
            "yAxis": {
              "title": "Y-Axis Title"
            },
            "legend": true,
            "stacked": false,
            "colors": ["#4e79a7", "#f28e2c"]
          }
        },
        "explanation": "Explanation of why this chart type and configuration was chosen",
        "confidence": 0.8 // A number between 0 and 1
      }
    `
    
    // Generate the chart configuration using the LLM
    const response = await this.providerRouter.routeRequest(prompt, {
      complexity: 'medium'
    })
    
    try {
      // Parse the JSON response
      const jsonStart = response.indexOf('{')
      const jsonEnd = response.lastIndexOf('}') + 1
      const jsonString = response.substring(jsonStart, jsonEnd)
      const parsedResponse = JSON.parse(jsonString)
      
      const chartConfig = parsedResponse.chartConfig
      const explanation = parsedResponse.explanation
      const confidence = parsedResponse.confidence || 0.5
      
      return {
        response: `I've created a ${chartConfig.type} chart titled "${chartConfig.title}" using data from ${chartConfig.dataRange}.
        
        ${explanation}
        
        The chart has been added to your spreadsheet. You can customize it further using the chart formatting options.`,
        confidence
      }
    } catch (error) {
      console.error('Error parsing chart configuration:', error)
      return {
        response: 'I had trouble creating a chart configuration. Could you provide more specific details about the data you want to visualize?',
        confidence: 0.3
      }
    }
  }
  
  // Recommend a chart
  private async recommendChart(
    request: string,
    context: any
  ): Promise<{ response: string; confidence: number }> {
    // Create a prompt for the LLM
    const prompt = `
      You are a data visualization expert. Recommend the best chart type for the following request:
      
      REQUEST: ${request}
      
      CONTEXT:
      ${JSON.stringify(context)}
      
      Analyze the request and determine the best chart type(s) for visualizing the data.
      Format your response as a JSON object with the following structure:
      {
        "recommendations": [
          {
            "chartType": "bar",
            "suitability": 0.9,
            "explanation": "Bar charts are good for comparing values across categories."
          },
          {
            "chartType": "line",
            "suitability": 0.7,
            "explanation": "Line charts are good for showing trends over time."
          }
        ],
        "bestOption": "bar",
        "confidence": 0.8
      }
    `
    
    // Generate the chart recommendations using the LLM
    const response = await this.providerRouter.routeRequest(prompt, {
      complexity: 'medium'
    })
    
    try {
      // Parse the JSON response
      const jsonStart = response.indexOf('{')
      const jsonEnd = response.lastIndexOf('}') + 1
      const jsonString = response.substring(jsonStart, jsonEnd)
      const parsedResponse = JSON.parse(jsonString)
      
      const recommendations = parsedResponse.recommendations
      const bestOption = parsedResponse.bestOption
      const confidence = parsedResponse.confidence || 0.5
      
      // Format the response
      let formattedResponse = `Based on your data, I recommend using a ${bestOption} chart.\n\nHere's why:\n`
      
      recommendations.forEach((rec: any) => {
        formattedResponse += `\n- ${rec.chartType.toUpperCase()} CHART (${Math.round(rec.suitability * 100)}% suitable): ${rec.explanation}`
      })
      
      formattedResponse += `\n\nWould you like me to create a ${bestOption} chart for you?`
      
      return {
        response: formattedResponse,
        confidence
      }
    } catch (error) {
      console.error('Error parsing chart recommendations:', error)
      return {
        response: 'I had trouble recommending a chart type. Could you provide more specific details about the data you want to visualize?',
        confidence: 0.3
      }
    }
  }
  
  // Customize a chart
  private async customizeChart(
    request: string,
    context: any
  ): Promise<{ response: string; confidence: number }> {
    // Create a prompt for the LLM
    const prompt = `
      You are a data visualization expert. Customize an existing chart based on the following request:
      
      REQUEST: ${request}
      
      CONTEXT:
      ${JSON.stringify(context)}
      
      Analyze the request and determine what changes should be made to the chart.
      Format your response as a JSON object with the following structure:
      {
        "changes": [
          {
            "property": "title",
            "value": "New Chart Title",
            "explanation": "Updated the title as requested."
          },
          {
            "property": "colors",
            "value": ["#4e79a7", "#f28e2c"],
            "explanation": "Changed the colors to be more visually appealing."
          }
        ],
        "confidence": 0.8
      }
    `
    
    // Generate the chart customization using the LLM
    const response = await this.providerRouter.routeRequest(prompt, {
      complexity: 'medium'
    })
    
    try {
      // Parse the JSON response
      const jsonStart = response.indexOf('{')
      const jsonEnd = response.lastIndexOf('}') + 1
      const jsonString = response.substring(jsonStart, jsonEnd)
      const parsedResponse = JSON.parse(jsonString)
      
      const changes = parsedResponse.changes
      const confidence = parsedResponse.confidence || 0.5
      
      // Format the response
      let formattedResponse = `I've updated the chart with the following changes:\n`
      
      changes.forEach((change: any) => {
        formattedResponse += `\n- ${change.property.toUpperCase()}: ${change.explanation}`
      })
      
      return {
        response: formattedResponse,
        confidence
      }
    } catch (error) {
      console.error('Error parsing chart customization:', error)
      return {
        response: 'I had trouble customizing the chart. Could you provide more specific details about the changes you want to make?',
        confidence: 0.3
      }
    }
  }
}

