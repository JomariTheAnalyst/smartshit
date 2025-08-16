'use client'

import { useState, useCallback } from 'react'
import { ISelection } from '@/types/spreadsheet'
import { formatCellReference } from '@/lib/utils'

// Selection hook
export function useSelection() {
  const [selection, setSelection] = useState<ISelection | null>(null)
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null)
  
  // Select a single cell
  const selectCell = useCallback((row: number, col: number) => {
    setSelection({
      startRow: row,
      startCol: col,
      endRow: row,
      endCol: col,
      type: 'cell'
    })
    setActiveCell({ row, col })
  }, [])
  
  // Select a range of cells
  const selectRange = useCallback((startRow: number, startCol: number, endRow: number, endCol: number) => {
    setSelection({
      startRow,
      startCol,
      endRow,
      endCol,
      type: 'range'
    })
  }, [])
  
  // Select a row
  const selectRow = useCallback((row: number) => {
    setSelection({
      startRow: row,
      startCol: 0,
      endRow: row,
      endCol: 1000, // A large number to select all columns
      type: 'row'
    })
  }, [])
  
  // Select a column
  const selectColumn = useCallback((col: number) => {
    setSelection({
      startRow: 0,
      startCol: col,
      endRow: 1000, // A large number to select all rows
      endCol: col,
      type: 'column'
    })
  }, [])
  
  // Clear the selection
  const clearSelection = useCallback(() => {
    setSelection(null)
  }, [])
  
  // Clear the active cell
  const clearActiveCell = useCallback(() => {
    setActiveCell(null)
  }, [])
  
  // Check if a cell is selected
  const isCellSelected = useCallback((row: number, col: number) => {
    if (!selection) return false
    
    const { startRow, startCol, endRow, endCol } = selection
    
    // Normalize the selection coordinates
    const minRow = Math.min(startRow, endRow)
    const maxRow = Math.max(startRow, endRow)
    const minCol = Math.min(startCol, endCol)
    const maxCol = Math.max(startCol, endCol)
    
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol
  }, [selection])
  
  // Check if a cell is the active cell
  const isActiveCell = useCallback((row: number, col: number) => {
    if (!activeCell) return false
    
    return activeCell.row === row && activeCell.col === col
  }, [activeCell])
  
  // Get the selected range as an array of cell references
  const getSelectedCells = useCallback(() => {
    if (!selection) return []
    
    const { startRow, startCol, endRow, endCol } = selection
    
    // Normalize the selection coordinates
    const minRow = Math.min(startRow, endRow)
    const maxRow = Math.max(startRow, endRow)
    const minCol = Math.min(startCol, endCol)
    const maxCol = Math.max(startCol, endCol)
    
    const cells: string[] = []
    
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        cells.push(formatCellReference(col, row))
      }
    }
    
    return cells
  }, [selection])
  
  // Get the selected range as a string (e.g., "A1:B2")
  const getSelectedRange = useCallback(() => {
    if (!selection) return ''
    
    const { startRow, startCol, endRow, endCol } = selection
    
    // Normalize the selection coordinates
    const minRow = Math.min(startRow, endRow)
    const maxRow = Math.max(startRow, endRow)
    const minCol = Math.min(startCol, endCol)
    const maxCol = Math.max(startCol, endCol)
    
    const startCell = formatCellReference(minCol, minRow)
    const endCell = formatCellReference(maxCol, maxRow)
    
    return `${startCell}:${endCell}`
  }, [selection])
  
  return {
    selection,
    activeCell,
    selectCell,
    selectRange,
    selectRow,
    selectColumn,
    clearSelection,
    clearActiveCell,
    isCellSelected,
    isActiveCell,
    getSelectedCells,
    getSelectedRange
  }
}

