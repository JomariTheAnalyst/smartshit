'use client'

import { formatCellReference } from '@/lib/utils'

interface StatusBarProps {
  activeCell: { row: number; col: number } | null
  cellValue: string
  cellFormula: string | null
  sheetName: string
  isEditing: boolean
  lastSaved: Date | null
}

export default function StatusBar({
  activeCell,
  cellValue,
  cellFormula,
  sheetName,
  isEditing,
  lastSaved
}: StatusBarProps) {
  // Format the active cell reference
  const activeCellRef = activeCell
    ? formatCellReference(activeCell.col, activeCell.row)
    : ''
  
  // Format the last saved time
  const lastSavedText = lastSaved
    ? `Last saved: ${lastSaved.toLocaleTimeString()}`
    : 'Not saved yet'
  
  return (
    <div className="status-bar flex items-center justify-between p-2 border-t text-sm bg-muted">
      <div className="flex items-center space-x-4">
        <div className="status-item">
          <span className="font-medium">Sheet:</span> {sheetName}
        </div>
        
        <div className="status-item">
          <span className="font-medium">Cell:</span> {activeCellRef}
        </div>
        
        {isEditing && (
          <div className="status-item">
            <span className="font-medium text-blue-500">Editing</span>
          </div>
        )}
        
        {cellFormula && (
          <div className="status-item">
            <span className="font-medium">Formula:</span> {cellFormula}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="status-item">
          {lastSavedText}
        </div>
      </div>
    </div>
  )
}

