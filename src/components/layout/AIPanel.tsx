'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Send, Sparkles } from 'lucide-react'
import AIActionVerification from '@/components/ai/AIActionVerification'
import { AIAction } from '@/types/ai'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  actions?: AIAction[]
}

interface AIAssistantProps {
  onSendMessage: (message: string) => Promise<string>
}

export default function AIPanel({ onSendMessage }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you with your spreadsheet today?',
      timestamp: new Date()
    }
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // For action verification
  const [pendingAction, setPendingAction] = useState<AIAction | null>(null)
  const [isVerificationOpen, setIsVerificationOpen] = useState(false)
  
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
      
      // In a real implementation, the AI might return actions that require verification
      // For demonstration purposes, let's simulate an action that requires verification
      // about 30% of the time
      const shouldRequireVerification = Math.random() < 0.3
      
      if (shouldRequireVerification) {
        const action: AIAction = {
          type: 'formula_suggestion',
          description: 'Add a formula to calculate the sum of the selected range',
          parameters: {
            formula: '=SUM(A1:B10)',
            cell: 'C1'
          },
          confidence: 0.85,
          preview: '=SUM(A1:B10) will be inserted into cell C1',
          requiresConfirmation: true
        }
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          actions: [action]
        }
        
        setMessages(prev => [...prev, assistantMessage])
        setPendingAction(action)
        setIsVerificationOpen(true)
      } else {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, assistantMessage])
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
      role: 'assistant',
      content: 'Action confirmed! I\'ve applied the formula =SUM(A1:B10) to cell C1.',
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
      role: 'assistant',
      content: 'Action cancelled. Is there anything else you\'d like me to help with?',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, cancellationMessage])
    setPendingAction(null)
  }
  
  return (
    <div className="ai-panel flex flex-col h-full border-l">
      <div className="ai-panel-header p-3 border-b flex items-center justify-between bg-gray-50">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="font-medium">AI Assistant</h3>
        </div>
      </div>
      
      <div className="ai-panel-messages flex-1 overflow-y-auto p-3 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`message ${
              message.role === 'user' ? 'user-message ml-8' : 'assistant-message mr-8'
            }`}
          >
            <div
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white ml-auto'
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
                            role: 'assistant',
                            content: 'Action rejected. Is there anything else you\'d like me to help with?',
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
            
            <div
              className={`text-xs text-gray-500 mt-1 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="ai-panel-input p-3 border-t">
        <div className="flex items-center">
          <Input
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI assistant..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="ml-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {isLoading && <p className="text-xs text-gray-500 mt-1">AI is thinking...</p>}
      </div>
      
      <AIActionVerification
        action={pendingAction}
        isOpen={isVerificationOpen}
        onConfirm={handleActionConfirm}
        onCancel={handleActionCancel}
      />
    </div>
  )
}

