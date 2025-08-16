'use client'

import { useState, useRef, useEffect } from 'react'
import { Cell as CellType, CellFormat } from '@/types/spreadsheet'
import { cn } from '@/lib/cn'

interface CellProps {
  cell: CellType | null
  isActiveCell: boolean
  isSelected: boolean
  isEditing: boolean
  onCellClick: (row: number, col: number) => void
  onCellDoubleClick: (row: number, col: number) => void
  onCellChange: (row: number, col: number, value: string) => void
  row: number
  col: number
}

export default function Cell({
  cell,
  isActiveCell,
  isSelected,
  isEditing,
  onCellClick,
  onCellDoubleClick,
  onCellChange,
  row,
  col
}: CellProps) {
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Update the edit value when the cell value changes
  useEffect(() => {
    if (cell) {
      setEditValue(cell.value)
    }
  }, [cell])
  
  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])
  
  // Handle cell click
  const handleClick = () => {
    onCellClick(row, col)
  }
  
  // Handle cell double click
  const handleDoubleClick = () => {
    onCellDoubleClick(row, col)
  }
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }
  
  // Handle input blur
  const handleBlur = () => {
    if (isEditing) {
      onCellChange(row, col, editValue)
    }
  }
  
  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onCellChange(row, col, editValue)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditValue(cell?.value || '')
      onCellChange(row, col, cell?.value || '')
    }
  }
  
  // Get the display value
  const getDisplayValue = () => {
    if (!cell) {
      return ''
    }
    
    if (cell.type === 'formula' && typeof cell.displayValue === 'string' && cell.displayValue.startsWith('#ERROR')) {
      return cell.displayValue
    }
    
    if (Array.isArray(cell.displayValue)) {
      return '[Array]'
    }
    
    return cell.displayValue
  }
  
  // Get the cell style based on formatting
  const getCellStyle = () => {
    if (!cell || !cell.format) {
      return {}
    }
    
    const format = cell.format as CellFormat
    const style: React.CSSProperties = {}
    
    // Text formatting
    if (format.fontFamily) style.fontFamily = format.fontFamily
    if (format.fontSize) style.fontSize = `${format.fontSize}px`
    if (format.fontWeight) style.fontWeight = format.fontWeight
    if (format.fontStyle) style.fontStyle = format.fontStyle
    if (format.textDecoration) style.textDecoration = format.textDecoration
    if (format.color) style.color = format.color
    
    // Cell formatting
    if (format.backgroundColor) style.backgroundColor = format.backgroundColor
    
    // Border
    if (format.border) {
      if (format.border.top) style.borderTop = format.border.top
      if (format.border.right) style.borderRight = format.border.right
      if (format.border.bottom) style.borderBottom = format.border.bottom
      if (format.border.left) style.borderLeft = format.border.left
    }
    
    // Alignment
    if (format.horizontalAlign) style.textAlign = format.horizontalAlign
    if (format.verticalAlign) style.verticalAlign = format.verticalAlign
    
    return style
  }
  
  // Apply conditional formatting
  const applyConditionalFormatting = () => {
    if (!cell || !cell.format || !cell.format.conditionalFormat) {
      return {}
    }
    
    const { conditionalFormat } = cell.format
    const style: React.CSSProperties = {}
    
    for (const cf of conditionalFormat) {
      if (cf.type === 'rule' && cf.rule) {
        const { type, value1, value2, format } = cf.rule
        const cellValue = cell.displayValue
        
        let conditionMet = false
        
        switch (type) {
          case 'greaterThan':
            conditionMet = Number(cellValue) > Number(value1)
            break
          case 'lessThan':
            conditionMet = Number(cellValue) < Number(value1)
            break
          case 'equal':
            conditionMet = cellValue === value1
            break
          case 'between':
            conditionMet = Number(cellValue) >= Number(value1) && Number(cellValue) <= Number(value2)
            break
          case 'containsText':
            conditionMet = String(cellValue).includes(String(value1))
            break
          case 'dateOccurring':
            // Simplified date check
            conditionMet = String(cellValue) === String(value1)
            break
        }
        
        if (conditionMet) {
          // Apply the conditional format
          if (format.backgroundColor) style.backgroundColor = format.backgroundColor
          if (format.color) style.color = format.color
          if (format.fontWeight) style.fontWeight = format.fontWeight
          if (format.fontStyle) style.fontStyle = format.fontStyle
          if (format.textDecoration) style.textDecoration = format.textDecoration
        }
      }
      
      // Data bars, color scales, and icon sets would require more complex rendering
      // and are not implemented in this simplified version
    }
    
    return style
  }
  
  // Combine all styles
  const combinedStyle = {
    ...getCellStyle(),
    ...applyConditionalFormatting()
  }
  
  return (
    <div
      className={cn(
        'cell relative border border-gray-200 p-1 overflow-hidden whitespace-nowrap',
        isActiveCell && 'active-cell border-2 border-blue-500',
        isSelected && !isActiveCell && 'selected-cell bg-blue-100',
        cell?.type === 'formula' && cell.displayValue && String(cell.displayValue).startsWith('#ERROR') && 'text-red-500'
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={combinedStyle}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="w-full h-full outline-none bg-white"
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div className="w-full h-full overflow-hidden text-ellipsis">
          {getDisplayValue()}
        </div>
      )}
    </div>
  )
}

