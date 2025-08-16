'use client'

import { useCallback, useRef, useEffect } from 'react'
import Cell from './Cell'
import { Sheet, ActiveCell, Selection, CellDragEvent } from '@/types/spreadsheet'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'
import { formatCellReference, columnIndexToLetter } from '@/lib/utils'

interface GridProps {
  sheet: Sheet
  activeCell: ActiveCell | null
  selection: Selection | null
  isEditing: boolean
  onCellClick: (row: number, col: number) => void
  onCellDoubleClick: (row: number, col: number) => void
  onCellChange: (row: number, col: number, value: string) => void
  onCellDrag?: (event: CellDragEvent) => void
}

export default function Grid({
  sheet,
  activeCell,
  selection,
  isEditing,
  onCellClick,
  onCellDoubleClick,
  onCellChange,
  onCellDrag
}: GridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  
  // Drag and drop
  const { 
    isDragging, 
    handleDragStart, 
    handleDragOver, 
    handleDragEnd, 
    handleDragCancel,
    getDragSelection
  } = useDragAndDrop({
    onDragComplete: (event) => {
      if (onCellDrag) {
        onCellDrag(event)
      }
    }
  })
  
  // Handle mouse down on a cell
  const handleMouseDown = useCallback((e: React.MouseEvent, row: number, col: number) => {
    // Right click - don't start drag
    if (e.button === 2) {
      return
    }
    
    // Start drag if shift key is pressed
    if (e.shiftKey) {
      handleDragStart(row, col)
    }
  }, [handleDragStart])
  
  // Handle mouse move over a cell
  const handleMouseMove = useCallback((row: number, col: number) => {
    handleDragOver(row, col)
  }, [handleDragOver])
  
  // Handle mouse up
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    handleDragEnd(e.ctrlKey)
  }, [handleDragEnd])
  
  // Handle key down
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleDragCancel()
    }
  }, [handleDragCancel])
  
  // Add event listeners
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      handleDragEnd((e as MouseEvent).ctrlKey)
    }
    
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDragCancel()
      }
    }
    
    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('keydown', handleGlobalKeyDown)
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [handleDragEnd, handleDragCancel])
  
  // Check if a cell is selected
  const isCellSelected = useCallback((row: number, col: number) => {
    if (!selection) {
      return false
    }
    
    return (
      row >= selection.startRow &&
      row <= selection.endRow &&
      col >= selection.startCol &&
      col <= selection.endCol
    )
  }, [selection])
  
  // Check if a cell is the active cell
  const isActiveCellFn = useCallback((row: number, col: number) => {
    if (!activeCell) {
      return false
    }
    
    return activeCell.row === row && activeCell.col === col
  }, [activeCell])
  
  // Check if a cell is being dragged
  const isCellDragged = useCallback((row: number, col: number) => {
    const dragSelection = getDragSelection()
    
    if (!dragSelection) {
      return false
    }
    
    return (
      row >= dragSelection.startRow &&
      row <= dragSelection.endRow &&
      col >= dragSelection.startCol &&
      col <= dragSelection.endCol
    )
  }, [getDragSelection])
  
  // Generate column headers
  const columnHeaders = []
  for (let col = 0; col < sheet.columnCount; col++) {
    columnHeaders.push(
      <div key={`header-${col}`} className="column-header bg-gray-100 border border-gray-200 p-1 text-center">
        {columnIndexToLetter(col)}
      </div>
    )
  }
  
  // Generate row headers and cells
  const rows = []
  for (let row = 0; row < sheet.rowCount; row++) {
    const cells = []
    
    // Row header
    cells.push(
      <div key={`header-${row}`} className="row-header bg-gray-100 border border-gray-200 p-1 text-center">
        {row + 1}
      </div>
    )
    
    // Cells
    for (let col = 0; col < sheet.columnCount; col++) {
      const cellKey = `${row},${col}`
      const cell = sheet.cells[cellKey] || null
      
      cells.push(
        <div
          key={cellKey}
          className="cell-container"
          onMouseDown={(e) => handleMouseDown(e, row, col)}
          onMouseMove={() => handleMouseMove(row, col)}
        >
          <Cell
            cell={cell}
            isActiveCell={isActiveCellFn(row, col)}
            isSelected={isCellSelected(row, col) || isCellDragged(row, col)}
            isEditing={isEditing && isActiveCellFn(row, col)}
            onCellClick={() => onCellClick(row, col)}
            onCellDoubleClick={() => onCellDoubleClick(row, col)}
            onCellChange={onCellChange}
            row={row}
            col={col}
          />
        </div>
      )
    }
    
    rows.push(
      <div key={`row-${row}`} className="grid-row flex">
        {cells}
      </div>
    )
  }
  
  return (
    <div 
      ref={gridRef}
      className="grid-container flex-1 overflow-auto"
      onMouseUp={handleMouseUp}
    >
      <div className="grid">
        {/* Corner */}
        <div className="grid-corner bg-gray-100 border border-gray-200"></div>
        
        {/* Column headers */}
        <div className="column-headers flex">
          <div className="grid-corner bg-gray-100 border border-gray-200"></div>
          {columnHeaders}
        </div>
        
        {/* Rows */}
        <div className="rows">
          {rows}
        </div>
      </div>
    </div>
  )
}

