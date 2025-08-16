'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CellProps {
  row: number
  col: number
  value: string
  isSelected: boolean
  isActive: boolean
  isEditing: boolean
  onClick: () => void
  onDoubleClick: () => void
  onChange: (value: string) => void
  style: React.CSSProperties
}

export default function Cell({
  row,
  col,
  value,
  isSelected,
  isActive,
  isEditing,
  onClick,
  onDoubleClick,
  onChange,
  style
}: CellProps) {
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Update the edit value when the value changes
  useEffect(() => {
    setEditValue(value)
  }, [value])
  
  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])
  
  // Handle key press events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onChange(editValue)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditValue(value)
      onChange(value)
    }
  }
  
  // Handle blur events
  const handleBlur = () => {
    onChange(editValue)
  }
  
  return (
    <div
      className={cn(
        'cell absolute border-r border-b flex items-center',
        isSelected && 'bg-primary/10',
        isActive && 'ring-2 ring-primary ring-inset'
      )}
      style={style}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="w-full h-full px-1 bg-background focus:outline-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      ) : (
        <div className="w-full h-full px-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {value}
        </div>
      )}
    </div>
  )
}

