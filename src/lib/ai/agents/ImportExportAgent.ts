import { AIAgent, AIResponse } from '@/types/ai'
import { ProviderRouter } from '../providers/ProviderRouter'

export class ImportExportAgent implements AIAgent {
  private providerRouter: ProviderRouter
  
  constructor(providerRouter: ProviderRouter) {
    this.providerRouter = providerRouter
  }
  
  async process(message: string, context: any): Promise<AIResponse> {
    // Enhance the prompt with import/export-specific instructions
    const enhancedPrompt = this.createImportExportPrompt(message, context)
    
    // Use the provider router to get a response
    const response = await this.providerRouter.routeRequest(
      enhancedPrompt,
      context
    )
    
    return response
  }
  
  private createImportExportPrompt(message: string, context: any): string {
    return `
You are an Import/Export Agent for a spreadsheet application. Your task is to help users import data from various sources and export data to different formats.

Current context:
- Active sheet: ${context.activeSheet || 'None'}
- Active cell: ${context.activeCell || 'None'}
- Selection: ${context.selection ? JSON.stringify(context.selection) : 'None'}

User request: ${message}

Please provide:
1. A clear explanation of the import/export operation needed
2. The appropriate format and settings for the operation
3. Any data transformations that might be required
4. Potential issues to watch out for

Format your response as follows:
OPERATION TYPE:
[Import or Export]

FORMAT:
[Format details (e.g., CSV, XLSX, JSON)]

SETTINGS:
[Recommended settings for the operation]

DATA TRANSFORMATIONS:
[Any transformations needed]

POTENTIAL ISSUES:
[Issues to watch out for]

VERIFICATION REQUIRED:
[What the user should verify before proceeding]

Remember that all actions will require user verification before being applied to the spreadsheet.
`
  }
  
  async importData(fileType: string, fileContent: string, options: any = {}): Promise<any[][]> {
    // This would be a more sophisticated implementation in a real application
    // For now, we'll return a simple placeholder
    
    console.log(`Importing ${fileType} data with options:`, options)
    
    // Parse CSV data as an example
    if (fileType.toLowerCase() === 'csv') {
      return this.parseCSV(fileContent, options.delimiter || ',', options.hasHeader || true)
    }
    
    // For other formats, return empty data
    return []
  }
  
  async exportData(data: any[][], fileType: string, options: any = {}): Promise<string> {
    // This would be a more sophisticated implementation in a real application
    // For now, we'll return a simple placeholder
    
    console.log(`Exporting data to ${fileType} with options:`, options)
    
    // Export to CSV as an example
    if (fileType.toLowerCase() === 'csv') {
      return this.exportToCSV(data, options.delimiter || ',', options.includeHeader || true)
    }
    
    // For other formats, return empty string
    return ''
  }
  
  private parseCSV(csvContent: string, delimiter: string = ',', hasHeader: boolean = true): any[][] {
    if (!csvContent) return []
    
    // Split the content into lines
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '')
    
    // Parse each line
    const data = lines.map(line => {
      // Handle quoted values with commas inside
      const values: string[] = []
      let currentValue = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === delimiter && !inQuotes) {
          values.push(currentValue)
          currentValue = ''
        } else {
          currentValue += char
        }
      }
      
      // Add the last value
      values.push(currentValue)
      
      // Clean up quoted values
      return values.map(value => {
        // Remove surrounding quotes
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1)
        }
        
        // Replace double quotes with single quotes
        value = value.replace(/""/g, '"')
        
        return value
      })
    })
    
    return data
  }
  
  private exportToCSV(data: any[][], delimiter: string = ',', includeHeader: boolean = true): string {
    if (!data || data.length === 0) return ''
    
    // Convert each row to a CSV line
    const csvLines = data.map(row => {
      return row.map(cell => {
        // Convert to string
        const value = String(cell ?? '')
        
        // Quote values that contain delimiters, quotes, or newlines
        if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
          // Replace quotes with double quotes
          const escapedValue = value.replace(/"/g, '""')
          return `"${escapedValue}"`
        }
        
        return value
      }).join(delimiter)
    })
    
    return csvLines.join('\n')
  }
  
  detectFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || ''
    
    switch (extension) {
      case 'csv':
        return 'CSV'
      case 'xlsx':
      case 'xls':
        return 'Excel'
      case 'json':
        return 'JSON'
      case 'txt':
        return 'Text'
      case 'xml':
        return 'XML'
      default:
        return 'Unknown'
    }
  }
  
  suggestImportOptions(fileType: string): any {
    switch (fileType.toLowerCase()) {
      case 'csv':
        return {
          delimiter: ',',
          hasHeader: true,
          encoding: 'UTF-8',
          skipEmptyLines: true
        }
      case 'excel':
        return {
          sheetIndex: 0,
          hasHeader: true,
          dateFormat: 'MM/DD/YYYY'
        }
      case 'json':
        return {
          rootPath: '',
          flattenObjects: false
        }
      default:
        return {}
    }
  }
  
  suggestExportOptions(fileType: string): any {
    switch (fileType.toLowerCase()) {
      case 'csv':
        return {
          delimiter: ',',
          includeHeader: true,
          encoding: 'UTF-8'
        }
      case 'excel':
        return {
          sheetName: 'Sheet1',
          includeHeader: true,
          dateFormat: 'MM/DD/YYYY'
        }
      case 'json':
        return {
          pretty: true,
          includeHeader: true
        }
      default:
        return {}
    }
  }
}

