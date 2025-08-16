import { Tool } from './AgentFramework'

// Tool Registry class
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map()
  
  // Register a tool
  registerTool(tool: Tool): void {
    this.tools.set(tool.id, tool)
  }
  
  // Get a tool by ID
  getTool(id: string): Tool | undefined {
    return this.tools.get(id)
  }
  
  // Get all registered tools
  getAllTools(): Tool[] {
    return Array.from(this.tools.values())
  }
  
  // Get tools by category
  getToolsByCategory(category: string): Tool[] {
    return this.getAllTools().filter(tool => tool.id.startsWith(`${category}:`))
  }
}

