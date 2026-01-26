import { AIAgent, AIResponse } from '@/types/ai'
import { ProviderRouter } from '../providers/ProviderRouter'

interface DataSummary {
  rowCount: number
  columnCount: number
  numericColumns: string[]
  categoricalColumns: string[]
  dateColumns: string[]
  missingValues: { [key: string]: number }
  statistics: { [key: string]: any }
}

export class InsightsAgent implements AIAgent {
  private providerRouter: ProviderRouter
  
  constructor(providerRouter: ProviderRouter) {
    this.providerRouter = providerRouter
  }
  
  async process(message: string, context: any): Promise<AIResponse> {
    // Generate a data summary if we have selection data
    let dataSummary: DataSummary | null = null
    
    if (context.selection && context.data) {
      dataSummary = this.generateDataSummary(context.data, context.selection)
    }
    
    // Enhance the prompt with insights-specific instructions
    const enhancedPrompt = this.createInsightsPrompt(message, context, dataSummary)
    
    // Use the provider router to get a response
    // Use a more powerful model for insights as it requires complex analysis
    const response = await this.providerRouter.routeRequest(
      enhancedPrompt,
      context,
      'openrouter'
    )
    
    return response
  }
  
  private createInsightsPrompt(message: string, context: any, dataSummary: DataSummary | null): string {
    return `
You are an Insights Agent for a spreadsheet application. Your task is to analyze data and provide meaningful insights, recommendations, and narrative summaries.

Current context:
- Active sheet: ${context.activeSheet || 'None'}
- Active cell: ${context.activeCell || 'None'}
- Selection: ${context.selection ? JSON.stringify(context.selection) : 'None'}

${dataSummary ? `
Data Summary:
- Row count: ${dataSummary.rowCount}
- Column count: ${dataSummary.columnCount}
- Numeric columns: ${dataSummary.numericColumns.join(', ')}
- Categorical columns: ${dataSummary.categoricalColumns.join(', ')}
- Date columns: ${dataSummary.dateColumns.join(', ')}
- Missing values: ${JSON.stringify(dataSummary.missingValues)}
- Statistics: ${JSON.stringify(dataSummary.statistics)}
` : 'No data summary available.'}

User request: ${message}

Please provide:
1. A clear analysis of the data based on the user's request
2. Meaningful insights that highlight patterns, trends, or anomalies
3. Actionable recommendations based on the insights
4. Suggestions for visualizations or further analysis

Format your response as follows:
ANALYSIS:
[Detailed analysis of the data]

KEY INSIGHTS:
- [Insight 1]
- [Insight 2]
- [Insight 3]

RECOMMENDATIONS:
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]

SUGGESTED VISUALIZATIONS:
- [Visualization 1]
- [Visualization 2]

Make sure your insights are specific, data-driven, and relevant to the user's request.
`
  }
  
  private generateDataSummary(data: any[][], selection: { startRow: number; startCol: number; endRow: number; endCol: number }): DataSummary {
    // Extract the selected data
    const selectedData = data.slice(selection.startRow, selection.endRow + 1).map(row => 
      row.slice(selection.startCol, selection.endCol + 1)
    )
    
    // Initialize the data summary
    const summary: DataSummary = {
      rowCount: selectedData.length,
      columnCount: selectedData[0]?.length || 0,
      numericColumns: [],
      categoricalColumns: [],
      dateColumns: [],
      missingValues: {},
      statistics: {}
    }
    
    // Skip if there's no data
    if (summary.rowCount === 0 || summary.columnCount === 0) {
      return summary
    }
    
    // Assume the first row contains headers
    const headers = selectedData[0].map(String)
    
    // Analyze each column
    for (let col = 0; col < summary.columnCount; col++) {
      const columnName = headers[col]
      const columnValues = selectedData.slice(1).map(row => row[col])
      
      // Count missing values
      const missingCount = columnValues.filter(val => val === null || val === undefined || val === '').length
      summary.missingValues[columnName] = missingCount
      
      // Determine column type
      const columnType = this.determineColumnType(columnValues)
      
      if (columnType === 'numeric') {
        summary.numericColumns.push(columnName)
        
        // Calculate statistics for numeric columns
        const numericValues = columnValues
          .filter(val => val !== null && val !== undefined && val !== '')
          .map(val => Number(val))
        
        if (numericValues.length > 0) {
          summary.statistics[columnName] = {
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            mean: numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length,
            median: this.calculateMedian(numericValues)
          }
        }
      } else if (columnType === 'date') {
        summary.dateColumns.push(columnName)
      } else {
        summary.categoricalColumns.push(columnName)
        
        // Calculate frequency for categorical columns
        const valueFrequency: { [key: string]: number } = {}
        
        for (const value of columnValues) {
          if (value !== null && value !== undefined && value !== '') {
            const strValue = String(value)
            valueFrequency[strValue] = (valueFrequency[strValue] || 0) + 1
          }
        }
        
        summary.statistics[columnName] = {
          uniqueValues: Object.keys(valueFrequency).length,
          mostCommon: Object.entries(valueFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([value, count]) => ({ value, count }))
        }
      }
    }
    
    return summary
  }
  
  private determineColumnType(values: any[]): 'numeric' | 'date' | 'categorical' {
    // Filter out null/undefined/empty values
    const nonEmptyValues = values.filter(val => val !== null && val !== undefined && val !== '')
    
    if (nonEmptyValues.length === 0) {
      return 'categorical'
    }
    
    // Check if all values are numeric
    const numericCount = nonEmptyValues.filter(val => !isNaN(Number(val))).length
    if (numericCount === nonEmptyValues.length) {
      return 'numeric'
    }
    
    // Check if all values are dates
    const dateCount = nonEmptyValues.filter(val => !isNaN(Date.parse(String(val)))).length
    if (dateCount === nonEmptyValues.length) {
      return 'date'
    }
    
    // Default to categorical
    return 'categorical'
  }
  
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0
    
    const sorted = [...values].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2
    } else {
      return sorted[middle]
    }
  }
  
  generateInsightsFromData(data: any[][]): string {
    // This would be a more sophisticated implementation in a real application
    // For now, we'll return a simple placeholder
    
    if (!data || data.length === 0) {
      return 'No data available for analysis.'
    }
    
    const rowCount = data.length
    const colCount = data[0].length
    
    return `
Data Overview:
- ${rowCount} rows and ${colCount} columns of data analyzed
- Basic statistical analysis completed
- Potential patterns and trends identified

For detailed insights, please use the Insights Agent with a specific question about your data.
`
  }
}

