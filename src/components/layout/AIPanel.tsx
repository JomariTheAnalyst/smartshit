'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Wand2, X, Send, Loader2, PaperPlane } from 'lucide-react'

interface AIPanelProps {
  onSendMessage: (message: string) => Promise<string>
}

export default function AIPanel({
  onSendMessage
}: AIPanelProps) {
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  // Scroll to the bottom of the conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  // Focus the input when the panel opens
  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  
  // Scroll to the bottom when the conversation changes
  useEffect(() => {
    scrollToBottom()
  }, [conversation])
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return
    
    // Add the user message to the conversation
    const userMessage = message.trim()
    setConversation(prev => [...prev, { role: 'user', content: userMessage }])
    setMessage('')
    setIsLoading(true)
    
    try {
      // Get the assistant's response
      const response = await onSendMessage(userMessage)
      
      // Add the assistant's response to the conversation
      setConversation(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add an error message to the conversation
      setConversation(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again.'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle key press events
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  return (
    <div className="ai-panel h-full flex flex-col border-l">
      <div className="ai-panel-header flex items-center justify-between p-2 border-b bg-muted">
        <div className="flex items-center">
          <span className="font-medium text-sm">New Chat</span>
        </div>
        <Button variant="ghost" size="sm" className="text-xs">
          + New Chat
        </Button>
      </div>
      
      <div className="ai-panel-conversation flex-1 overflow-y-auto p-3 space-y-4">
        {conversation.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            <p>How can I help you with your spreadsheet today?</p>
            <p className="text-sm mt-2">Try asking:</p>
            <ul className="text-sm mt-1 space-y-1">
              <li>"Create a formula to calculate sales tax"</li>
              <li>"Clean this data by removing duplicates"</li>
              <li>"Create a bar chart showing monthly sales"</li>
              <li>"Format this table with alternating row colors"</li>
            </ul>
          </div>
        ) : (
          conversation.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.role === 'user' ? 'user-message ml-4' : 'assistant-message mr-4'
              }`}
            >
              <div
                className={`p-2 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="message assistant-message mr-4">
            <div className="p-2 rounded-lg bg-muted flex items-center text-sm">
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="ai-panel-input p-2 border-t">
        <div className="flex items-end">
          <textarea
            ref={inputRef}
            className="flex-1 p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Type your message here..."
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <Button
            className="ml-2 h-8 w-8 p-0"
            size="sm"
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
          >
            <PaperPlane className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Make targeted edits</span>
          <span>Prompt history</span>
        </div>
      </div>
    </div>
  )
}

