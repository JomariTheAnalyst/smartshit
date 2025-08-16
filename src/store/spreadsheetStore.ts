'use client'

import { create } from 'zustand'
import { IWorkbook, ISheet, ICell, ISelection } from '@/types/spreadsheet'
import { formatCellReference } from '@/lib/utils'

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11)
}

// Create an empty sheet
const createEmptySheet = (name: string): ISheet => {
  return {
    id: generateId(),
    name,
    cells: {},
    rowCount: 1000,
    columnCount: 26,
    rowHeights: {},
    columnWidths: {},
    mergedCells: [],
    hiddenRows: [],
    hiddenColumns: [],
    frozenRows: 0,
    frozenColumns: 0
  }
}

// Create an empty workbook
const createEmptyWorkbook = (name: string): IWorkbook => {
  const sheet = createEmptySheet('Sheet1')
  return {
    id: generateId(),
    name,
    sheets: [sheet],
    activeSheetIndex: 0
  }
}

// Define the spreadsheet store state
interface SpreadsheetState {
  workbook: IWorkbook
  selection: ISelection | null
  activeCell: { row: number; col: number } | null
  isEditing: boolean
  undoStack: any[]
  redoStack: any[]
  
  // Actions
  createNewWorkbook: (name: string) => void
  setActiveSheet: (index: number) => void
  addSheet: () => void
  renameSheet: (index: number, name: string) => void
  deleteSheet: (index: number) => void
  setCellValue: (sheetIndex: number, row: number, col: number, value: string) => void
  getCellValue: (sheetIndex: number, row: number, col: number) => string
  setSelection: (selection: ISelection | null) => void
  setActiveCell: (row: number, col: number) => void
  clearActiveCell: () => void
  startEditing: () => void
  stopEditing: () => void
  undo: () => void
  redo: () => void
}

// Create the spreadsheet store
export const useSpreadsheetStore = create<SpreadsheetState>((set, get) => ({
  workbook: createEmptyWorkbook('Untitled'),
  selection: null,
  activeCell: null,
  isEditing: false,
  undoStack: [],
  redoStack: [],
  
  // Create a new workbook
  createNewWorkbook: (name: string) => {
    set({ workbook: createEmptyWorkbook(name) })
  },
  
  // Set the active sheet
  setActiveSheet: (index: number) => {
    set((state) => ({
      workbook: {
        ...state.workbook,
        activeSheetIndex: index
      }
    }))
  },
  
  // Add a new sheet
  addSheet: () => {
    set((state) => {
      const sheetCount = state.workbook.sheets.length
      const newSheet = createEmptySheet(`Sheet${sheetCount + 1}`)
      
      return {
        workbook: {
          ...state.workbook,
          sheets: [...state.workbook.sheets, newSheet],
          activeSheetIndex: sheetCount
        }
      }
    })
  },
  
  // Rename a sheet
  renameSheet: (index: number, name: string) => {
    set((state) => {
      const sheets = [...state.workbook.sheets]
      sheets[index] = { ...sheets[index], name }
      
      return {
        workbook: {
          ...state.workbook,
          sheets
        }
      }
    })
  },
  
  // Delete a sheet
  deleteSheet: (index: number) => {
    set((state) => {
      if (state.workbook.sheets.length <= 1) {
        return state // Don't delete the last sheet
      }
      
      const sheets = state.workbook.sheets.filter((_, i) => i !== index)
      const activeSheetIndex = state.workbook.activeSheetIndex >= index
        ? Math.max(0, state.workbook.activeSheetIndex - 1)
        : state.workbook.activeSheetIndex
      
      return {
        workbook: {
          ...state.workbook,
          sheets,
          activeSheetIndex
        }
      }
    })
  },
  
  // Set a cell value
  setCellValue: (sheetIndex: number, row: number, col: number, value: string) => {
    set((state) => {
      const sheets = [...state.workbook.sheets]
      const sheet = { ...sheets[sheetIndex] }
      const cellKey = formatCellReference(col, row)
      
      // Create or update the cell
      const cell: ICell = sheet.cells[cellKey] || {
        value: null,
        type: 'empty'
      }
      
      // Determine the cell type and value
      let type: ICell['type'] = 'string'
      let cellValue: any = value
      
      if (value === '') {
        type = 'empty'
        cellValue = null
      } else if (value.startsWith('=')) {
        type = 'formula'
        cellValue = value
      } else if (!isNaN(Number(value))) {
        type = 'number'
        cellValue = Number(value)
      } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
        type = 'boolean'
        cellValue = value.toLowerCase() === 'true'
      }
      
      // Update the cell
      sheet.cells[cellKey] = {
        ...cell,
        value: cellValue,
        type
      }
      
      sheets[sheetIndex] = sheet
      
      return {
        workbook: {
          ...state.workbook,
          sheets
        }
      }
    })
  },
  
  // Get a cell value
  getCellValue: (sheetIndex: number, row: number, col: number) => {
    const state = get()
    const sheet = state.workbook.sheets[sheetIndex]
    const cellKey = formatCellReference(col, row)
    const cell = sheet.cells[cellKey]
    
    if (!cell) {
      return ''
    }
    
    if (cell.type === 'formula') {
      // For now, just return the formula text
      // In a real implementation, this would evaluate the formula
      return cell.value as string
    }
    
    return cell.value !== null ? String(cell.value) : ''
  },
  
  // Set the selection
  setSelection: (selection: ISelection | null) => {
    set({ selection })
  },
  
  // Set the active cell
  setActiveCell: (row: number, col: number) => {
    set({ 
      activeCell: { row, col },
      selection: {
        startRow: row,
        startCol: col,
        endRow: row,
        endCol: col,
        type: 'cell'
      }
    })
  },
  
  // Clear the active cell
  clearActiveCell: () => {
    set({ activeCell: null })
  },
  
  // Start editing
  startEditing: () => {
    set({ isEditing: true })
  },
  
  // Stop editing
  stopEditing: () => {
    set({ isEditing: false })
  },
  
  // Undo the last action
  undo: () => {
    // To be implemented
  },
  
  // Redo the last undone action
  redo: () => {
    // To be implemented
  }
}))

export default useSpreadsheetStore

