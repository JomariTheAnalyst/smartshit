'use client'

import { ActiveCell } from '@/types/spreadsheet'
import { formatCellReference } from '@/lib/utils'

interface StatusBarProps {
  activeCell: ActiveCell | null
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
  const cellRef = activeCell
    ? formatCellReference(activeCell.col, activeCell.row)
    : ''
  
  // Format the last saved time
  const lastSavedStr = lastSaved
    ? lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Never'
  
  return (
    <div className="status-bar flex items-center justify-between px-2 py-1 bg-gray-100 dark:bg-gray-800 border-t text-xs text-gray-600 dark:text-gray-300">
      <div className="flex items-center space-x-4">
        <div>
          <span className="font-medium">Sheet1</span>
        </div>
        
        <div>
          <span className="font-medium">{cellRef}</span>
          {cellFormula && (
            <span className="ml-2">{cellFormula}</span>
          )}
        </div>
        
        {isEditing && (
          <div>
            <span className="text-green-600">Editing</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <div>
          <span>Last saved: {lastSavedStr}</span>
        </div>
        
        <div>
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}

