import { ICommand } from '@/types/spreadsheet'

// Command History class
export class CommandHistory {
  private undoStack: ICommand[] = []
  private redoStack: ICommand[] = []
  private maxStackSize: number
  
  constructor(maxStackSize: number = 100) {
    this.maxStackSize = maxStackSize
  }
  
  // Execute a command and add it to the undo stack
  execute(command: ICommand): void {
    // Execute the command
    command.execute()
    
    // Add the command to the undo stack
    this.undoStack.push(command)
    
    // Limit the undo stack size
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift()
    }
    
    // Clear the redo stack
    this.redoStack = []
  }
  
  // Undo the last command
  undo(): boolean {
    if (this.undoStack.length === 0) {
      return false
    }
    
    // Get the last command from the undo stack
    const command = this.undoStack.pop()!
    
    // Undo the command
    command.undo()
    
    // Add the command to the redo stack
    this.redoStack.push(command)
    
    return true
  }
  
  // Redo the last undone command
  redo(): boolean {
    if (this.redoStack.length === 0) {
      return false
    }
    
    // Get the last command from the redo stack
    const command = this.redoStack.pop()!
    
    // Redo the command
    command.redo()
    
    // Add the command to the undo stack
    this.undoStack.push(command)
    
    return true
  }
  
  // Check if undo is available
  canUndo(): boolean {
    return this.undoStack.length > 0
  }
  
  // Check if redo is available
  canRedo(): boolean {
    return this.redoStack.length > 0
  }
  
  // Get the undo stack
  getUndoStack(): ICommand[] {
    return [...this.undoStack]
  }
  
  // Get the redo stack
  getRedoStack(): ICommand[] {
    return [...this.redoStack]
  }
  
  // Clear the command history
  clear(): void {
    this.undoStack = []
    this.redoStack = []
  }
  
  // Get the last executed command
  getLastCommand(): ICommand | null {
    if (this.undoStack.length === 0) {
      return null
    }
    
    return this.undoStack[this.undoStack.length - 1]
  }
  
  // Get the last undone command
  getLastUndoneCommand(): ICommand | null {
    if (this.redoStack.length === 0) {
      return null
    }
    
    return this.redoStack[this.redoStack.length - 1]
  }
}

