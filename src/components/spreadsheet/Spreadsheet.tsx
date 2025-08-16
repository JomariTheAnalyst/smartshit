'use client'

import { useState, useCallback, useEffect } from 'react'
import RibbonToolbar from '@/components/layout/RibbonToolbar'
import StatusBar from '@/components/layout/StatusBar'
import AIPanel from '@/components/layout/AIPanel'
import Grid from '@/components/spreadsheet/Grid'
import ChartCreator from '@/components/charts/ChartCreator'
import ChartView from '@/components/charts/ChartView'
import { useSpreadsheetStore } from '@/store/spreadsheetStore'
import { useUndoRedo } from '@/hooks/useUndoRedo'
import { useSelection } from '@/hooks/useSelection'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { useAutosave } from '@/hooks/useAutosave'
import { useFileImport } from '@/hooks/useFileImport'
import { SpreadsheetEngine } from '@/lib/spreadsheet/SpreadsheetEngine'
import { AIOrchestrator } from '@/lib/ai/AIOrchestrator'
import { SetCellValueCommand } from '@/lib/commands/CellCommands'
import { SetCellFormatCommand } from '@/lib/commands/FormatCommands'
import { MoveCellCommand, CopyCellCommand, MoveRangeCommand, CopyRangeCommand } from '@/lib/commands/DragCommands'
import { exportWorkbook } from '@/lib/io/xlsx'
import { formatCellReference } from '@/lib/utils'
import { CellFormat, CellDragEvent, ChartOptions, Chart } from '@/types/spreadsheet'
import { AIAction } from '@/types/ai'

export default function Spreadsheet() {
  // State
  const [engine] = useState(() => new SpreadsheetEngine(useSpreadsheetStore.getState().workbook))
  const [aiOrchestrator] = useState(() => new AIOrchestrator())
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [showChartCreator, setShowChartCreator] = useState(false)
  const [charts, setCharts] = useState<Chart[]>([])
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
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
  
  // Handle cell format change
  const handleCellFormatChange = useCallback((format: Partial<CellFormat>) => {
    if (!activeCell) return
    
    const command = new SetCellFormatCommand(
      engine,
      workbook.activeSheetIndex,
      activeCell.row,
      activeCell.col,
      format
    )
    execute(command)
  }, [engine, workbook.activeSheetIndex, activeCell, execute])
  
  // Handle cell drag
  const handleCellDrag = useCallback((event: CellDragEvent) => {
    const { sourceRow, sourceCol, targetRow, targetCol, isCopy } = event
    
    // If source and target are the same, do nothing
    if (sourceRow === targetRow && sourceCol === targetCol) {
      return
    }
    
    // Check if we're dragging a single cell or a range
    if (selection && 
        selection.startRow === selection.endRow && 
        selection.startCol === selection.endCol &&
        selection.startRow === sourceRow && 
        selection.startCol === sourceCol) {
      // Single cell drag
      if (isCopy) {
        const command = new CopyCellCommand(
          engine,
          workbook.activeSheetIndex,
          sourceRow,
          sourceCol,
          targetRow,
          targetCol
        )
        execute(command)
      } else {
        const command = new MoveCellCommand(
          engine,
          workbook.activeSheetIndex,
          sourceRow,
          sourceCol,
          targetRow,
          targetCol
        )
        execute(command)
      }
    } else if (selection) {
      // Range drag
      const rowOffset = targetRow - sourceRow
      const colOffset = targetCol - sourceCol
      
      if (isCopy) {
        const command = new CopyRangeCommand(
          engine,
          workbook.activeSheetIndex,
          selection.startRow,
          selection.startCol,
          selection.endRow,
          selection.endCol,
          selection.startRow + rowOffset,
          selection.startCol + colOffset
        )
        execute(command)
      } else {
        const command = new MoveRangeCommand(
          engine,
          workbook.activeSheetIndex,
          selection.startRow,
          selection.startCol,
          selection.endRow,
          selection.endCol,
          selection.startRow + rowOffset,
          selection.startCol + colOffset
        )
        execute(command)
      }
    }
  }, [engine, workbook.activeSheetIndex, selection, execute])
  
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
  
  // Toggle AI panel
  const toggleAIPanel = useCallback(() => {
    setShowAIPanel(prev => !prev)
  }, [])
  
  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
    
    // Apply theme to document
    if (theme === 'light') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])
  
  // Open chart creator
  const openChartCreator = useCallback(() => {
    setShowChartCreator(true)
  }, [])
  
  // Handle chart creation
  const handleCreateChart = useCallback((options: ChartOptions) => {
    const newChart: Chart = {
      id: `chart-${Date.now()}`,
      sheetIndex: workbook.activeSheetIndex,
      options,
      position: {
        top: 100,
        left: 100,
        width: 400,
        height: 300
      }
    }
    
    setCharts(prev => [...prev, newChart])
  }, [workbook.activeSheetIndex])
  
  // Handle chart removal
  const handleRemoveChart = useCallback((chartId: string) => {
    setCharts(prev => prev.filter(chart => chart.id !== chartId))
  }, [])
  
  // Handle chart position change
  const handleChartPositionChange = useCallback((chartId: string, position: { top: number; left: number }) => {
    setCharts(prev => prev.map(chart => 
      chart.id === chartId
        ? { ...chart, position: { ...chart.position, ...position } }
        : chart
    ))
  }, [])
  
  // Handle chart resize
  const handleChartResize = useCallback((chartId: string, size: { width: number; height: number }) => {
    setCharts(prev => prev.map(chart => 
      chart.id === chartId
        ? { ...chart, position: { ...chart.position, ...size } }
        : chart
    ))
  }, [])
  
  // Handle AI action
  const handleAIAction = useCallback((action: AIAction) => {
    if (!action) return
    
    switch (action.type) {
      case 'formula_suggestion':
        if (activeCell) {
          const command = new SetCellValueCommand(
            engine,
            workbook.activeSheetIndex,
            activeCell.row,
            activeCell.col,
            action.parameters.formula
          )
          execute(command)
        }
        break
        
      case 'chart_suggestion':
        const chartOptions: ChartOptions = {
          type: action.parameters.type,
          title: `${action.parameters.type.charAt(0).toUpperCase() + action.parameters.type.slice(1)} Chart`,
          dataRange: selection 
            ? `${String.fromCharCode(65 + selection.startCol)}${selection.startRow + 1}:${String.fromCharCode(65 + selection.endCol)}${selection.endRow + 1}`
            : '',
          headerRow: true,
          headerColumn: false,
          legendPosition: 'top'
        }
        
        handleCreateChart(chartOptions)
        break
        
      case 'data_cleaning_suggestion':
        // This would be more sophisticated in a real implementation
        // For now, we'll just show a message
        alert('Data cleaning would be performed here')
        break
        
      default:
        console.warn('Unknown action type:', action.type)
    }
  }, [activeCell, engine, workbook.activeSheetIndex, execute, selection, handleCreateChart])
  
  // Handle sending a message to the AI assistant
  const handleSendMessage = useCallback(async (message: string) => {
    // Get the current context
    const context = {
      activeSheet: workbook.sheets[workbook.activeSheetIndex].name,
      activeCell: activeCell ? formatCellReference(activeCell.col, activeCell.row) : null,
      selection: selection ? getSelectedRange() : null,
      data: getSheetData() // Pass the sheet data for analysis
    }
    
    // Process the message with the AI orchestrator
    const result = await aiOrchestrator.processRequest(message, context)
    
    return result.response
  }, [workbook, workbook.activeSheetIndex, activeCell, selection, getSelectedRange, aiOrchestrator])
  
  // Handle clearing AI memory
  const handleClearAIMemory = useCallback(() => {
    aiOrchestrator.resetContext()
  }, [aiOrchestrator])
  
  // Get the active sheet
  const activeSheet = workbook.sheets[workbook.activeSheetIndex]
  
  // Get the active cell value and formula
  const activeCellValue = activeCell
    ? engine.getCellByPosition(workbook.activeSheetIndex, activeCell.row, activeCell.col)?.value || ''
    : ''
  
  const activeCellFormula = activeCell && engine.getCellByPosition(workbook.activeSheetIndex, activeCell.row, activeCell.col)?.type === 'formula'
    ? engine.getCellByPosition(workbook.activeSheetIndex, activeCell.row, activeCell.col)?.value as string
    : null
  
  // Get the active cell format
  const activeCellFormat = activeCell
    ? engine.getCellByPosition(workbook.activeSheetIndex, activeCell.row, activeCell.col)?.format || {}
    : {}
  
  // Get the sheet data for charts and AI analysis
  function getSheetData(): any[][] {
    const data: any[][] = []
    
    // Initialize with empty rows
    for (let row = 0; row < activeSheet.rowCount; row++) {
      data[row] = []
      for (let col = 0; col < activeSheet.columnCount; col++) {
        data[row][col] = null
      }
    }
    
    // Fill in the data from cells
    for (const key in activeSheet.cells) {
      const [row, col] = key.split(',').map(Number)
      data[row][col] = activeSheet.cells[key].displayValue
    }
    
    return data
  }
  
  const sheetData = getSheetData()
  
  return (
    <div className={`spreadsheet-container flex flex-col h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <RibbonToolbar
        onSave={handleSave}
        onImport={handleImport}
        onExport={handleExport}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onAIAssistant={toggleAIPanel}
        onFormatChange={handleCellFormatChange}
        currentFormat={activeCellFormat}
        onCreateChart={openChartCreator}
        onToggleTheme={toggleTheme}
        theme={theme}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col relative">
          <Grid
            sheet={activeSheet}
            activeCell={activeCell}
            selection={selection}
            isEditing={isEditing}
            onCellClick={handleCellClick}
            onCellDoubleClick={handleCellDoubleClick}
            onCellChange={handleCellChange}
            onCellDrag={handleCellDrag}
          />
          
          {/* Charts */}
          {charts
            .filter(chart => chart.sheetIndex === workbook.activeSheetIndex)
            .map(chart => (
              <ChartView
                key={chart.id}
                chart={chart}
                data={sheetData}
                onRemove={handleRemoveChart}
                onPositionChange={handleChartPositionChange}
                onResize={handleChartResize}
              />
            ))}
          
          <StatusBar
            activeCell={activeCell}
            cellValue={String(activeCellValue)}
            cellFormula={activeCellFormula}
            sheetName={activeSheet.name}
            isEditing={isEditing}
            lastSaved={lastSaved}
          />
        </div>
        
        {showAIPanel && (
          <div className="w-80">
            <AIPanel 
              onSendMessage={handleSendMessage} 
              onClearMemory={handleClearAIMemory}
            />
          </div>
        )}
      </div>
      
      {/* Chart Creator Dialog */}
      <ChartCreator
        isOpen={showChartCreator}
        onClose={() => setShowChartCreator(false)}
        onCreateChart={handleCreateChart}
        data={sheetData}
        selection={selection}
      />
    </div>
  )
}

