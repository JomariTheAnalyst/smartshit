'use client'

import { useState, useCallback, useEffect } from 'react'
import { CommandHistory } from '@/lib/commands/CommandHistory'
import { ICommand } from '@/types/spreadsheet'

// Undo/Redo hook
export function useUndoRedo(maxStackSize: number = 100) {
  const [commandHistory] = useState(() => new CommandHistory(maxStackSize))
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  
  // Update the state when the command history changes
  const updateState = useCallback(() => {
    setCanUndo(commandHistory.canUndo())
    setCanRedo(commandHistory.canRedo())
  }, [commandHistory])
  
  // Execute a command
  const execute = useCallback((command: ICommand) => {
    commandHistory.execute(command)
    updateState()
  }, [commandHistory, updateState])
  
  // Undo the last command
  const undo = useCallback(() => {
    const result = commandHistory.undo()
    updateState()
    return result
  }, [commandHistory, updateState])
  
  // Redo the last undone command
  const redo = useCallback(() => {
    const result = commandHistory.redo()
    updateState()
    return result
  }, [commandHistory, updateState])
  
  // Clear the command history
  const clear = useCallback(() => {
    commandHistory.clear()
    updateState()
  }, [commandHistory, updateState])
  
  // Get the undo stack
  const getUndoStack = useCallback(() => {
    return commandHistory.getUndoStack()
  }, [commandHistory])
  
  // Get the redo stack
  const getRedoStack = useCallback(() => {
    return commandHistory.getRedoStack()
  }, [commandHistory])
  
  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        redo()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [undo, redo])
  
  return {
    execute,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
    getUndoStack,
    getRedoStack
  }
}

