'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { AIAction } from '@/types/ai'

interface VerificationDialogProps {
  action: AIAction
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function VerificationDialog({
  action,
  isOpen,
  onConfirm,
  onCancel
}: VerificationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleConfirm = () => {
    setIsLoading(true)
    // In a real implementation, we might want to add a delay here
    // to simulate processing
    setTimeout(() => {
      setIsLoading(false)
      onConfirm()
    }, 500)
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm AI Action</DialogTitle>
          <DialogDescription>
            The AI assistant wants to perform the following action:
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium">Action Type:</h3>
            <p className="text-sm">{action.type}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium">Description:</h3>
            <p className="text-sm">{action.description}</p>
          </div>
          
          {action.preview && (
            <div className="mb-4">
              <h3 className="text-sm font-medium">Preview:</h3>
              <div className="bg-muted p-2 rounded text-sm font-mono whitespace-pre-wrap">
                {action.preview}
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <h3 className="text-sm font-medium">Confidence Level:</h3>
            <div className="flex items-center mt-1">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${action.confidence * 100}%` }}
                />
              </div>
              <span className="ml-2 text-sm">{Math.round(action.confidence * 100)}%</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

