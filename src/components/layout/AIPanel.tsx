'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Send, Sparkles, Lightbulb, Trash2, Info } from 'lucide-react'
import AIActionVerification from '@/components/ai/AIActionVerification'
import { AIAction } from '@/types/ai'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  actions?: AIAction[]
}

interface AIAssistantProps {
  onSendMessage: (message: string) => Promise<string>
  onClearMemory?: () => void
}

export default function AIPanel({ onSendMessage, onClearMemory }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      content: 'New Chat',
      timestamp: new Date()
    },
    {
      id: 'tip',
      role: 'system',
      content: 'Tip: Ask Shortcut to do your work for you. Most tasks take 1-15 minutes to complete. All changes can be reverted.',
      timestamp: new Date()
    },
    {
      id: 'welcome-assistant',
      role: 'assistant',
      content: 'How can I help you today?',
      timestamp: new Date()
    }
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // For action verification
  const [pendingAction, setPendingAction] = useState<AIAction | null>(null)
  const [isVerificationOpen, setIsVerificationOpen] = useState(false)
  
  // Suggested prompts
  const suggestedPrompts = [
    'Create a formula to calculate the average of cells A1:A10',
    'Clean missing values in column B',
    'Create a bar chart of sales by region',
    'Analyze this data and show me trends',
    'Help me import a CSV file'
  ]
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }
  
  // Handle send message
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      const response = await onSendMessage(input)
      
      // Extract actions from the response
      const actions = extractActionsFromResponse(response)
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        actions: actions.length > 0 ? actions : undefined
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      // If there are actions, show the first one for verification
      if (actions.length > 0) {
        setPendingAction(actions[0])
        setIsVerificationOpen(true)
      }
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }
  
  // Handle action confirmation
  const handleActionConfirm = () => {
    setIsVerificationOpen(false)
    
    // In a real implementation, we would execute the action here
    // For now, let's just add a confirmation message
    const confirmationMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: `Action confirmed: ${pendingAction?.description}`,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, confirmationMessage])
    setPendingAction(null)
  }
  
  // Handle action cancellation
  const handleActionCancel = () => {
    setIsVerificationOpen(false)
    
    // Add a cancellation message
    const cancellationMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: 'Action cancelled.',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, cancellationMessage])
    setPendingAction(null)
  }
  
  // Handle suggested prompt click
  const handleSuggestedPromptClick = (prompt: string) => {
    setInput(prompt)
  }
  
  // Handle clear memory
  const handleClearMemory = () => {
    if (onClearMemory) {
      onClearMemory()
    }
    
    // Clear messages except for the welcome messages
    setMessages([
      {
        id: 'clear',
        role: 'system',
        content: 'New Chat',
        timestamp: new Date()
      },
      {
        id: 'tip',
        role: 'system',
        content: 'Tip: Ask Shortcut to do your work for you. Most tasks take 1-15 minutes to complete. All changes can be reverted.',
        timestamp: new Date()
      },
      {
        id: 'clear-2',
        role: 'assistant',
        content: 'How can I help you today?',
        timestamp: new Date()
      }
    ])
  }
  
  // Extract actions from response
  const extractActionsFromResponse = (response: string): AIAction[] => {
    const actions: AIAction[] = []
    
    // Extract formula suggestions
    const formulaMatch = response.match(/```(?:excel|formula)?\s*(=[\s\S]*?)```/g)
    if (formulaMatch) {
      for (const match of formulaMatch) {
        const formula = match.replace(/```(?:excel|formula)?\s*/, '').replace(/```$/, '').trim()
        
        actions.push({
          type: 'formula_suggestion',
          description: 'Apply formula to the selected cell',
          parameters: {
            formula,
            cell: 'active'
          },
          confidence: 0.9,
          preview: formula,
          requiresConfirmation: true
        })
      }
    }
    
    // Extract chart suggestions
    if (response.includes('chart') || response.includes('visualization')) {
      const chartTypes = ['bar', 'line', 'pie', 'scatter']
      
      for (const type of chartTypes) {
        if (response.toLowerCase().includes(type + ' chart')) {
          actions.push({
            type: 'chart_suggestion',
            description: `Create a ${type} chart from the selected data`,
            parameters: {
              type,
              dataRange: 'selection'
            },
            confidence: 0.8,
            preview: `Create a ${type} chart based on the selected data`,
            requiresConfirmation: true
          })
          break
        }
      }
    }
    
    // Extract data cleaning suggestions
    if (response.includes('clean') || response.includes('missing values') || response.includes('normalize')) {
      actions.push({
        type: 'data_cleaning_suggestion',
        description: 'Clean the selected data',
        parameters: {
          range: 'selection'
        },
        confidence: 0.85,
        preview: 'Clean data by removing missing values and normalizing formats',
        requiresConfirmation: true
      })
    }
    
    return actions
  }
  
  return (
    <div className="ai-panel flex flex-col h-full">
      {/* Header */}
      <div className="ai-panel-header p-3 border-b flex items-center justify-between bg-gray-50">
        <div className="flex items-center">
          <h3 className="font-medium text-green-600">New Chat</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearMemory}
            title="Clear memory"
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Your AI Preferences"
            className="h-8 w-8 p-0"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="ai-panel-messages flex-1 overflow-y-auto p-3 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`message ${
              message.role === 'user' 
                ? 'user-message ml-8' 
                : message.role === 'system'
                ? 'system-message'
                : 'assistant-message mr-8'
            }`}
          >
            <div
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white ml-auto'
                  : message.role === 'system'
                  ? 'bg-gray-100 text-gray-600 text-sm italic'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            
            {message.actions && message.actions.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.actions.map((action, index) => (
                  <div key={index} className="bg-blue-50 p-2 rounded border border-blue-200">
                    <p className="text-sm font-medium">{action.description}</p>
                    <div className="flex mt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs mr-2"
                        onClick={() => {
                          setPendingAction(action)
                          setIsVerificationOpen(true)
                        }}
                      >
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs"
                        onClick={() => {
                          // Add a message indicating the action was rejected
                          const rejectionMessage: Message = {
                            id: Date.now().toString(),
                            role: 'system',
                            content: 'Action rejected.',
                            timestamp: new Date()
                          }
                          
                          setMessages(prev => [...prev, rejectionMessage])
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {message.role !== 'system' && (
              <div
                className={`text-xs text-gray-500 mt-1 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggested prompts */}
      {messages.length <= 5 && (
        <div className="px-3 py-2 border-t">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 text-gray-700 flex items-center"
                onClick={() => handleSuggestedPromptClick(prompt)}
              >
                <Lightbulb className="h-3 w-3 mr-1" />
                {prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input */}
      <div className="ai-panel-input p-3 border-t">
        <div className="flex items-center bg-gray-100 rounded-md p-1">
          <Input
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            disabled={isLoading}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="ml-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {isLoading && <p className="text-xs text-gray-500 mt-1">AI is thinking...</p>}
      </div>
      
      {/* Action verification dialog */}
      <AIActionVerification
        action={pendingAction}
        isOpen={isVerificationOpen}
        onConfirm={handleActionConfirm}
        onCancel={handleActionCancel}
      />
    </div>
  )
}

