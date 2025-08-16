'use client'

import { useState, useCallback, useEffect } from 'react'
import RibbonToolbar from '@/components/layout/RibbonToolbar'
import StatusBar from '@/components/layout/StatusBar'
import AIPanel from '@/components/layout/AIPanel'
import Grid from '@/components/spreadsheet/Grid'
import { useSpreadsheetStore } from '@/store/spreadsheetStore'
import { useUndoRedo } from '@/hooks/useUndoRedo'
import { useSelection } from '@/hooks/useSelection'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { useAutosave } from '@/hooks/useAutosave'
import { useFileImport } from '@/hooks/useFileImport'
import { SpreadsheetEngine } from '@/lib/spreadsheet/SpreadsheetEngine'
import { AIOrchestrator } from '@/lib/ai/AIOrchestrator'
import { SetCellValueCommand } from '@/lib/commands/CellCommands'
import { exportWorkbook } from '@/lib/io/xlsx'
import { formatCellReference } from '@/lib/utils'

export default function Spreadsheet() {
  // State
  const [engine] = useState(() => new SpreadsheetEngine(useSpreadsheetStore.getState().workbook))
  const [aiOrchestrator] = useState(() => new AIOrchestrator())
  
  // Hooks
  const {
    workbook,
    activeCell,
    selection,
    isEditing,
    setCellValue,
    setActiveCell,
    setSelection,
    startEditing,
    stopEditing
  } = useSpreadsheetStore()
  
  const {
    execute,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo()
  
  const {
    selectCell,
    selectRange,
    selectRow,
    selectColumn,
    isCellSelected,
    isActiveCell,
    getSelectedRange
  } = useSelection()
  
  const { lastSaved, saveNow } = useAutosave(workbook)
  const { importFile, handleFileInputChange } = useFileImport()
  
  // Update the engine when the workbook changes
  useEffect(() => {
    engine.setWorkbook(workbook)
  }, [engine, workbook])
  
  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    setActiveCell(row, col)
    selectCell(row, col)
  }, [setActiveCell, selectCell])
  
  // Handle cell double click
  const handleCellDoubleClick = useCallback((row: number, col: number) => {
    setActiveCell(row, col)
    selectCell(row, col)
    startEditing()
  }, [setActiveCell, selectCell, startEditing])
  
  // Handle cell change
  const handleCellChange = useCallback((row: number, col: number, value: string) => {
    const command = new SetCellValueCommand(engine, workbook.activeSheetIndex, row, col, value)
    execute(command)
    stopEditing()
  }, [engine, workbook.activeSheetIndex, execute, stopEditing])
  
  // Handle keyboard navigation
  useKeyboardNavigation({
    onMoveUp: () => {
      if (activeCell && activeCell.row > 0) {
        handleCellClick(activeCell.row - 1, activeCell.col)
      }
    },
    onMoveDown: () => {
      if (activeCell && activeCell.row < workbook.sheets[workbook.activeSheetIndex].rowCount - 1) {
        handleCellClick(activeCell.row + 1, activeCell.col)
      }
    },
    onMoveLeft: () => {
      if (activeCell && activeCell.col > 0) {
        handleCellClick(activeCell.row, activeCell.col - 1)
      }
    },
    onMoveRight: () => {
      if (activeCell && activeCell.col < workbook.sheets[workbook.activeSheetIndex].columnCount - 1) {
        handleCellClick(activeCell.row, activeCell.col + 1)
      }
    },
    onEnter: () => {
      if (activeCell) {
        if (isEditing) {
          stopEditing()
          if (activeCell.row < workbook.sheets[workbook.activeSheetIndex].rowCount - 1) {
            handleCellClick(activeCell.row + 1, activeCell.col)
          }
        } else {
          startEditing()
        }
      }
    },
    onTab: () => {
      if (activeCell) {
        if (isEditing) {
          stopEditing()
        }
        
        if (activeCell.col < workbook.sheets[workbook.activeSheetIndex].columnCount - 1) {
          handleCellClick(activeCell.row, activeCell.col + 1)
        } else if (activeCell.row < workbook.sheets[workbook.activeSheetIndex].rowCount - 1) {
          handleCellClick(activeCell.row + 1, 0)
        }
      }
    },
    onEscape: () => {
      if (isEditing) {
        stopEditing()
      }
    },
    onDelete: () => {
      if (activeCell && !isEditing) {
        const command = new SetCellValueCommand(engine, workbook.activeSheetIndex, activeCell.row, activeCell.col, '')
        execute(command)
      }
    },
    onSelectAll: () => {
      selectRange(0, 0, workbook.sheets[workbook.activeSheetIndex].rowCount - 1, workbook.sheets[workbook.activeSheetIndex].columnCount - 1)
    },
    isEditing
  })
  
  // Handle save
  const handleSave = useCallback(() => {
    saveNow()
  }, [saveNow])
  
  // Handle import
  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls'
    input.onchange = (e) => handleFileInputChange(e as any, (importedWorkbook) => {
      useSpreadsheetStore.setState({ workbook: importedWorkbook })
    })
    input.click()
  }, [handleFileInputChange])
  
  // Handle export
  const handleExport = useCallback(() => {
    exportWorkbook(workbook)
  }, [workbook])
  
  // Handle sending a message to the AI assistant
  const handleSendMessage = useCallback(async (message: string) => {
    // Get the current context
    const context = {
      activeSheet: workbook.sheets[workbook.activeSheetIndex].name,
      activeCell: activeCell ? formatCellReference(activeCell.col, activeCell.row) : null,
      selection: selection ? getSelectedRange() : null
    }
    
    // Process the message with the AI orchestrator
    const response = await aiOrchestrator.processRequest(message, context)
    
    return response.response
  }, [workbook, workbook.activeSheetIndex, activeCell, selection, getSelectedRange, aiOrchestrator])
  
  // Get the active sheet
  const activeSheet = workbook.sheets[workbook.activeSheetIndex]
  
  // Get the active cell value and formula
  const activeCellValue = activeCell
    ? engine.getCellByPosition(workbook.activeSheetIndex, activeCell.row, activeCell.col)?.value || ''
    : ''
  
  const activeCellFormula = activeCell && engine.getCellByPosition(workbook.activeSheetIndex, activeCell.row, activeCell.col)?.type === 'formula'
    ? engine.getCellByPosition(workbook.activeSheetIndex, activeCell.row, activeCell.col)?.value as string
    : null
  
  return (
    <div className="spreadsheet-container flex flex-col h-screen">
      <RibbonToolbar
        onSave={handleSave}
        onImport={handleImport}
        onExport={handleExport}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onAIAssistant={() => {}}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <Grid
            sheet={activeSheet}
            activeCell={activeCell}
            selection={selection}
            isEditing={isEditing}
            onCellClick={handleCellClick}
            onCellDoubleClick={handleCellDoubleClick}
            onCellChange={handleCellChange}
          />
          
          <StatusBar
            activeCell={activeCell}
            cellValue={String(activeCellValue)}
            cellFormula={activeCellFormula}
            sheetName={activeSheet.name}
            isEditing={isEditing}
            lastSaved={lastSaved}
          />
        </div>
        
        <div className="w-80">
          <AIPanel onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  )
}

