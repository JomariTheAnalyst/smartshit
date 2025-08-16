import { Agent } from '../AgentFramework'
import { ProviderRouter } from '../providers/ProviderRouter'

// Data cleaning operation type
export type CleaningOperationType = 
  | 'remove_duplicates'
  | 'fill_missing_values'
  | 'standardize_format'
  | 'trim_whitespace'
  | 'fix_case'
  | 'parse_dates'
  | 'normalize_numbers'
  | 'remove_outliers'
  | 'validate_data'

// Data cleaning operation
export interface CleaningOperation {
  type: CleaningOperationType
  range: string
  options?: Record<string, any>
  description: string
}

// Data Cleaning Agent class
export class DataCleaningAgent implements Agent {
  id: string = 'data_cleaning_agent'
  name: string = 'Data Cleaning Agent'
  description: string = 'Cleans and normalizes spreadsheet data'
  capabilities: string[] = [
    'duplicate_removal',
    'missing_value_handling',
    'format_standardization',
    'data_validation',
    'outlier_detection'
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
      // Determine the type of data cleaning request
      const requestType = this.determineRequestType(request)
      
      // Handle the request based on its type
      switch (requestType) {
        case 'analyze':
          return await this.analyzeData(request, context)
        case 'clean':
          return await this.cleanData(request, context)
        case 'validate':
          return await this.validateData(request, context)
        default:
          return {
            response: 'I\'m not sure what you want to do with your data. Could you provide more details?',
            confidence: 0.5
          }
      }
    } catch (error) {
      console.error('Error in DataCleaningAgent:', error)
      return {
        response: 'I encountered an error while processing your data cleaning request. Please try again.',
        confidence: 0
      }
    }
  }
  
  // Determine the type of data cleaning request
  private determineRequestType(request: string): 'analyze' | 'clean' | 'validate' {
    const lowerRequest = request.toLowerCase()
    
    if (lowerRequest.includes('analyze') || lowerRequest.includes('check') || lowerRequest.includes('look at')) {
      return 'analyze'
    } else if (lowerRequest.includes('validate') || lowerRequest.includes('verify') || lowerRequest.includes('check if')) {
      return 'validate'
    } else {
      return 'clean'
    }
  }
  
  // Analyze data
  private async analyzeData(
    request: string,
    context: any
  ): Promise<{ response: string; confidence: number }> {
    // Create a prompt for the LLM
    const prompt = `
      You are a data cleaning expert. Analyze the data described in the following request:
      
      REQUEST: ${request}
      
      CONTEXT:
      ${JSON.stringify(context)}
      
      Analyze the data and identify potential issues that need to be addressed.
      Format your response as a JSON object with the following structure:
      {
        "dataRange": "A1:D100", // The range of cells containing the data
        "issues": [
          {
            "type": "duplicates",
            "severity": "high",
            "description": "Found 5 duplicate rows in the data.",
            "recommendation": "Remove duplicates based on all columns."
          },
          {
            "type": "missing_values",
            "severity": "medium",
            "description": "Found 10 missing values in column B.",
            "recommendation": "Fill missing values with the average of the column."
          }
        ],
        "summary": "The data has several issues that should be addressed before analysis.",
        "confidence": 0.8
      }
    `
    
    // Generate the data analysis using the LLM
    const response = await this.providerRouter.routeRequest(prompt, {
      complexity: 'medium'
    })
    
    try {
      // Parse the JSON response
      const jsonStart = response.indexOf('{')
      const jsonEnd = response.lastIndexOf('}') + 1
      const jsonString = response.substring(jsonStart, jsonEnd)
      const parsedResponse = JSON.parse(jsonString)
      
      const dataRange = parsedResponse.dataRange
      const issues = parsedResponse.issues
      const summary = parsedResponse.summary
      const confidence = parsedResponse.confidence || 0.5
      
      // Format the response
      let formattedResponse = `I've analyzed the data in ${dataRange} and found the following issues:\n`
      
      issues.forEach((issue: any) => {
        formattedResponse += `\n- ${issue.type.toUpperCase()} (${issue.severity} severity): ${issue.description}\n  Recommendation: ${issue.recommendation}`
      })
      
      formattedResponse += `\n\n${summary}\n\nWould you like me to clean this data for you?`
      
      return {
        response: formattedResponse,
        confidence
      }
    } catch (error) {
      console.error('Error parsing data analysis:', error)
      return {
        response: 'I had trouble analyzing the data. Could you provide more specific details about the data you want to analyze?',
        confidence: 0.3
      }
    }
  }
  
  // Clean data
  private async cleanData(
    request: string,
    context: any
  ): Promise<{ response: string; confidence: number }> {
    // Create a prompt for the LLM
    const prompt = `
      You are a data cleaning expert. Clean the data described in the following request:
      
      REQUEST: ${request}
      
      CONTEXT:
      ${JSON.stringify(context)}
      
      Determine what cleaning operations should be performed on the data.
      Format your response as a JSON object with the following structure:
      {
        "dataRange": "A1:D100", // The range of cells containing the data
        "operations": [
          {
            "type": "remove_duplicates",
            "range": "A1:D100",
            "options": {
              "columns": [0, 1, 2, 3]
            },
            "description": "Remove duplicate rows based on all columns."
          },
          {
            "type": "fill_missing_values",
            "range": "B1:B100",
            "options": {
              "method": "average"
            },
            "description": "Fill missing values in column B with the average of the column."
          }
        ],
        "summary": "Performed 2 cleaning operations on the data.",
        "confidence": 0.8
      }
    `
    
    // Generate the data cleaning operations using the LLM
    const response = await this.providerRouter.routeRequest(prompt, {
      complexity: 'medium'
    })
    
    try {
      // Parse the JSON response
      const jsonStart = response.indexOf('{')
      const jsonEnd = response.lastIndexOf('}') + 1
      const jsonString = response.substring(jsonStart, jsonEnd)
      const parsedResponse = JSON.parse(jsonString)
      
      const dataRange = parsedResponse.dataRange
      const operations = parsedResponse.operations
      const summary = parsedResponse.summary
      const confidence = parsedResponse.confidence || 0.5
      
      // Format the response
      let formattedResponse = `I've cleaned the data in ${dataRange} with the following operations:\n`
      
      operations.forEach((operation: any) => {
        formattedResponse += `\n- ${operation.description}`
      })
      
      formattedResponse += `\n\n${summary}`
      
      return {
        response: formattedResponse,
        confidence
      }
    } catch (error) {
      console.error('Error parsing data cleaning operations:', error)
      return {
        response: 'I had trouble cleaning the data. Could you provide more specific details about the data you want to clean?',
        confidence: 0.3
      }
    }
  }
  
  // Validate data
  private async validateData(
    request: string,
    context: any
  ): Promise<{ response: string; confidence: number }> {
    // Create a prompt for the LLM
    const prompt = `
      You are a data validation expert. Validate the data described in the following request:
      
      REQUEST: ${request}
      
      CONTEXT:
      ${JSON.stringify(context)}
      
      Determine what validation checks should be performed on the data.
      Format your response as a JSON object with the following structure:
      {
        "dataRange": "A1:D100", // The range of cells containing the data
        "validationChecks": [
          {
            "type": "range_check",
            "range": "B1:B100",
            "criteria": "between",
            "min": 0,
            "max": 100,
            "description": "Check if values in column B are between 0 and 100."
          },
          {
            "type": "format_check",
            "range": "C1:C100",
            "format": "email",
            "description": "Check if values in column C are valid email addresses."
          }
        ],
        "validationResults": {
          "passed": 90,
          "failed": 10,
          "details": [
            {
              "cell": "B5",
              "value": 150,
              "issue": "Value exceeds maximum (100)."
            },
            {
              "cell": "C10",
              "value": "not-an-email",
              "issue": "Not a valid email address."
            }
          ]
        },
        "summary": "Found 10 validation issues in the data.",
        "confidence": 0.8
      }
    `
    
    // Generate the data validation results using the LLM
    const response = await this.providerRouter.routeRequest(prompt, {
      complexity: 'medium'
    })
    
    try {
      // Parse the JSON response
      const jsonStart = response.indexOf('{')
      const jsonEnd = response.lastIndexOf('}') + 1
      const jsonString = response.substring(jsonStart, jsonEnd)
      const parsedResponse = JSON.parse(jsonString)
      
      const dataRange = parsedResponse.dataRange
      const validationChecks = parsedResponse.validationChecks
      const validationResults = parsedResponse.validationResults
      const summary = parsedResponse.summary
      const confidence = parsedResponse.confidence || 0.5
      
      // Format the response
      let formattedResponse = `I've validated the data in ${dataRange} with the following checks:\n`
      
      validationChecks.forEach((check: any) => {
        formattedResponse += `\n- ${check.description}`
      })
      
      formattedResponse += `\n\nResults: ${validationResults.passed} cells passed, ${validationResults.failed} cells failed.`
      
      if (validationResults.details && validationResults.details.length > 0) {
        formattedResponse += `\n\nIssues found:`
        
        validationResults.details.slice(0, 5).forEach((detail: any) => {
          formattedResponse += `\n- Cell ${detail.cell} (${detail.value}): ${detail.issue}`
        })
        
        if (validationResults.details.length > 5) {
          formattedResponse += `\n- ... and ${validationResults.details.length - 5} more issues.`
        }
      }
      
      formattedResponse += `\n\n${summary}\n\nWould you like me to fix these issues for you?`
      
      return {
        response: formattedResponse,
        confidence
      }
    } catch (error) {
      console.error('Error parsing data validation results:', error)
      return {
        response: 'I had trouble validating the data. Could you provide more specific details about the data you want to validate?',
        confidence: 0.3
      }
    }
  }
}

