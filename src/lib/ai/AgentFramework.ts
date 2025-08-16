import { ToolRegistry } from './ToolRegistry'
import { ContextManager } from './utils/ContextManager'
import { ProviderRouter } from './providers/ProviderRouter'

// Agent interface
export interface Agent {
  id: string
  name: string
  description: string
  capabilities: string[]
  process: (request: string, context: any) => Promise<{ response: string; confidence: number }>
}

// Tool interface
export interface Tool {
  id: string
  name: string
  description: string
  parameters: ToolParameter[]
  execute: (params: Record<string, any>) => Promise<any>
}

// Tool parameter interface
export interface ToolParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description: string
  required: boolean
  default?: any
}

// Agent Framework class
export class AgentFramework {
  private agents: Map<string, Agent> = new Map()
  private toolRegistry: ToolRegistry
  private contextManager: ContextManager
  private providerRouter: ProviderRouter
  
  constructor(
    toolRegistry: ToolRegistry,
    contextManager: ContextManager,
    providerRouter: ProviderRouter
  ) {
    this.toolRegistry = toolRegistry
    this.contextManager = contextManager
    this.providerRouter = providerRouter
  }
  
  // Register an agent
  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent)
  }
  
  // Get an agent by ID
  getAgent(id: string): Agent | undefined {
    return this.agents.get(id)
  }
  
  // Get all registered agents
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values())
  }
  
  // Process a request with a specific agent
  async processWithAgent(
    agentId: string,
    request: string
  ): Promise<{ response: string; confidence: number }> {
    const agent = this.getAgent(agentId)
    
    if (!agent) {
      return {
        response: `Agent with ID "${agentId}" not found.`,
        confidence: 0
      }
    }
    
    // Get the context for this request
    const context = this.contextManager.getContext()
    
    // Process the request with the agent
    return await agent.process(request, context)
  }
  
  // Execute a tool
  async executeTool(
    toolId: string,
    params: Record<string, any>
  ): Promise<any> {
    const tool = this.toolRegistry.getTool(toolId)
    
    if (!tool) {
      throw new Error(`Tool with ID "${toolId}" not found.`)
    }
    
    // Validate the parameters
    this.validateToolParameters(tool, params)
    
    // Execute the tool
    return await tool.execute(params)
  }
  
  // Validate tool parameters
  private validateToolParameters(
    tool: Tool,
    params: Record<string, any>
  ): void {
    // Check for required parameters
    for (const param of tool.parameters) {
      if (param.required && !(param.name in params)) {
        throw new Error(`Required parameter "${param.name}" missing for tool "${tool.name}".`)
      }
    }
    
    // Add default values for missing optional parameters
    for (const param of tool.parameters) {
      if (!param.required && !(param.name in params) && 'default' in param) {
        params[param.name] = param.default
      }
    }
  }
}

