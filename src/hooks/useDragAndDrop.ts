import { useState, useCallback } from 'react'
import { CellDragEvent } from '@/types/spreadsheet'

interface UseDragAndDropProps {
  onDragComplete: (event: CellDragEvent) => void
}

export function useDragAndDrop({ onDragComplete }: UseDragAndDropProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartCell, setDragStartCell] = useState<{ row: number; col: number } | null>(null)
  const [dragEndCell, setDragEndCell] = useState<{ row: number; col: number } | null>(null)
  
  // Start dragging
  const handleDragStart = useCallback((row: number, col: number) => {
    setIsDragging(true)
    setDragStartCell({ row, col })
    setDragEndCell({ row, col })
  }, [])
  
  // Update drag end position
  const handleDragOver = useCallback((row: number, col: number) => {
    if (isDragging) {
      setDragEndCell({ row, col })
    }
  }, [isDragging])
  
  // Complete the drag operation
  const handleDragEnd = useCallback((isCopy: boolean = false) => {
    if (isDragging && dragStartCell && dragEndCell) {
      onDragComplete({
        sourceRow: dragStartCell.row,
        sourceCol: dragStartCell.col,
        targetRow: dragEndCell.row,
        targetCol: dragEndCell.col,
        isCopy
      })
    }
    
    setIsDragging(false)
    setDragStartCell(null)
    setDragEndCell(null)
  }, [isDragging, dragStartCell, dragEndCell, onDragComplete])
  
  // Cancel the drag operation
  const handleDragCancel = useCallback(() => {
    setIsDragging(false)
    setDragStartCell(null)
    setDragEndCell(null)
  }, [])
  
  // Get the drag selection
  const getDragSelection = useCallback(() => {
    if (!isDragging || !dragStartCell || !dragEndCell) {
      return null
    }
    
    return {
      startRow: Math.min(dragStartCell.row, dragEndCell.row),
      startCol: Math.min(dragStartCell.col, dragEndCell.col),
      endRow: Math.max(dragStartCell.row, dragEndCell.row),
      endCol: Math.max(dragStartCell.col, dragEndCell.col)
    }
  }, [isDragging, dragStartCell, dragEndCell])
  
  return {
    isDragging,
    dragStartCell,
    dragEndCell,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    getDragSelection
  }
}

