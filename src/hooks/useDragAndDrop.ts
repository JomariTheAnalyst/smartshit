import { useState, useCallback } from 'react'
import { CellDragEvent } from '@/types/spreadsheet'

interface DragSelection {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
}

interface UseDragAndDropProps {
  onDragComplete: (event: CellDragEvent) => void
}

export function useDragAndDrop({ onDragComplete }: UseDragAndDropProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartRow, setDragStartRow] = useState<number | null>(null)
  const [dragStartCol, setDragStartCol] = useState<number | null>(null)
  const [dragEndRow, setDragEndRow] = useState<number | null>(null)
  const [dragEndCol, setDragEndCol] = useState<number | null>(null)
  
  // Start dragging
  const handleDragStart = useCallback((row: number, col: number) => {
    setIsDragging(true)
    setDragStartRow(row)
    setDragStartCol(col)
    setDragEndRow(row)
    setDragEndCol(col)
  }, [])
  
  // Update drag position
  const handleDragOver = useCallback((row: number, col: number) => {
    if (!isDragging) return
    
    setDragEndRow(row)
    setDragEndCol(col)
  }, [isDragging])
  
  // End dragging
  const handleDragEnd = useCallback((isCopy: boolean = false) => {
    if (!isDragging || dragStartRow === null || dragStartCol === null || dragEndRow === null || dragEndCol === null) {
      setIsDragging(false)
      return
    }
    
    // Call the onDragComplete callback
    onDragComplete({
      sourceRow: dragStartRow,
      sourceCol: dragStartCol,
      targetRow: dragEndRow,
      targetCol: dragEndCol,
      isCopy
    })
    
    // Reset drag state
    setIsDragging(false)
    setDragStartRow(null)
    setDragStartCol(null)
    setDragEndRow(null)
    setDragEndCol(null)
  }, [isDragging, dragStartRow, dragStartCol, dragEndRow, dragEndCol, onDragComplete])
  
  // Cancel dragging
  const handleDragCancel = useCallback(() => {
    setIsDragging(false)
    setDragStartRow(null)
    setDragStartCol(null)
    setDragEndRow(null)
    setDragEndCol(null)
  }, [])
  
  // Get the current drag selection
  const getDragSelection = useCallback((): DragSelection | null => {
    if (!isDragging || dragStartRow === null || dragStartCol === null || dragEndRow === null || dragEndCol === null) {
      return null
    }
    
    return {
      startRow: Math.min(dragStartRow, dragEndRow),
      startCol: Math.min(dragStartCol, dragEndCol),
      endRow: Math.max(dragStartRow, dragEndRow),
      endCol: Math.max(dragStartCol, dragEndCol)
    }
  }, [isDragging, dragStartRow, dragStartCol, dragEndRow, dragEndCol])
  
  return {
    isDragging,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    getDragSelection
  }
}

