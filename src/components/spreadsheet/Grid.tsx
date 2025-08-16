'use client'

import { useState, useRef, useCallback } from 'react'
import { FixedSizeGrid } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import Cell from './Cell'
import HeaderRow from './HeaderRow'
import HeaderColumn from './HeaderColumn'
import { colIndexToLetter } from '@/lib/utils'
import { ISheet } from '@/types/spreadsheet'

interface GridProps {
  sheet: ISheet
  activeCell: { row: number; col: number } | null
  selection: {
    startRow: number
    startCol: number
    endRow: number
    endCol: number
    type: 'cell' | 'row' | 'column' | 'range'
  } | null
  isEditing: boolean
  onCellClick: (row: number, col: number) => void
  onCellDoubleClick: (row: number, col: number) => void
  onCellChange: (row: number, col: number, value: string) => void
}

export default function Grid({
  sheet,
  activeCell,
  selection,
  isEditing,
  onCellClick,
  onCellDoubleClick,
  onCellChange
}: GridProps) {
  // Default cell dimensions
  const [columnWidth, setColumnWidth] = useState(100)
  const [rowHeight, setRowHeight] = useState(25)
  
  // Header dimensions
  const headerColumnWidth = 50
  const headerRowHeight = 25
  
  // Refs for scrolling
  const gridRef = useRef<any>(null)
  
  // Get a cell value
  const getCellValue = useCallback((row: number, col: number) => {
    const cellKey = `${colIndexToLetter(col)}${row + 1}`
    const cell = sheet.cells[cellKey]
    
    if (!cell) {
      return ''
    }
    
    return cell.value !== null ? String(cell.value) : ''
  }, [sheet.cells])
  
  // Check if a cell is selected
  const isCellSelected = useCallback((row: number, col: number) => {
    if (!selection) return false
    
    const { startRow, startCol, endRow, endCol, type } = selection
    
    // Normalize the selection coordinates
    const minRow = Math.min(startRow, endRow)
    const maxRow = Math.max(startRow, endRow)
    const minCol = Math.min(startCol, endCol)
    const maxCol = Math.max(startCol, endCol)
    
    if (type === 'cell' || type === 'range') {
      return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol
    } else if (type === 'row') {
      return row >= minRow && row <= maxRow
    } else if (type === 'column') {
      return col >= minCol && col <= maxCol
    }
    
    return false
  }, [selection])
  
  // Check if a cell is the active cell
  const isActiveCell = useCallback((row: number, col: number) => {
    if (!activeCell) return false
    
    return activeCell.row === row && activeCell.col === col
  }, [activeCell])
  
  // Render a cell
  const renderCell = useCallback(({ columnIndex, rowIndex, style }) => {
    return (
      <Cell
        row={rowIndex}
        col={columnIndex}
        value={getCellValue(rowIndex, columnIndex)}
        isSelected={isCellSelected(rowIndex, columnIndex)}
        isActive={isActiveCell(rowIndex, columnIndex)}
        isEditing={isEditing && isActiveCell(rowIndex, columnIndex)}
        onClick={() => onCellClick(rowIndex, columnIndex)}
        onDoubleClick={() => onCellDoubleClick(rowIndex, columnIndex)}
        onChange={(value) => onCellChange(rowIndex, columnIndex, value)}
        style={style}
      />
    )
  }, [
    getCellValue,
    isCellSelected,
    isActiveCell,
    isEditing,
    onCellClick,
    onCellDoubleClick,
    onCellChange
  ])
  
  return (
    <div className="grid-container relative flex-1">
      <div
        className="header-row absolute top-0 left-0 z-10"
        style={{ left: headerColumnWidth, right: 0, height: headerRowHeight }}
      >
        <HeaderRow
          columnCount={sheet.columnCount}
          columnWidth={columnWidth}
          height={headerRowHeight}
        />
      </div>
      
      <div
        className="header-column absolute top-0 left-0 z-10"
        style={{ top: headerRowHeight, bottom: 0, width: headerColumnWidth }}
      >
        <HeaderColumn
          rowCount={sheet.rowCount}
          rowHeight={rowHeight}
          width={headerColumnWidth}
        />
      </div>
      
      <div
        className="grid-content absolute"
        style={{
          top: headerRowHeight,
          left: headerColumnWidth,
          right: 0,
          bottom: 0
        }}
      >
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeGrid
              ref={gridRef}
              columnCount={sheet.columnCount}
              columnWidth={columnWidth}
              height={height}
              rowCount={sheet.rowCount}
              rowHeight={rowHeight}
              width={width}
            >
              {renderCell}
            </FixedSizeGrid>
          )}
        </AutoSizer>
      </div>
    </div>
  )
}

