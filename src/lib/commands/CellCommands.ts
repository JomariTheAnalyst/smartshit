import { ICommand, ICell } from '@/types/spreadsheet'
import { SpreadsheetEngine } from '@/lib/spreadsheet/SpreadsheetEngine'

// Set Cell Value Command
export class SetCellValueCommand implements ICommand {
  private engine: SpreadsheetEngine
  private sheetIndex: number
  private row: number
  private col: number
  private newValue: string
  private oldValue: string
  private description: string
  
  constructor(
    engine: SpreadsheetEngine,
    sheetIndex: number,
    row: number,
    col: number,
    newValue: string
  ) {
    this.engine = engine
    this.sheetIndex = sheetIndex
    this.row = row
    this.col = col
    this.newValue = newValue
    
    // Get the current value
    const cell = this.engine.getCellByPosition(sheetIndex, row, col)
    this.oldValue = cell ? String(cell.value || '') : ''
    
    this.description = `Set cell value at (${row}, ${col}) to "${newValue}"`
  }
  
  execute(): void {
    this.engine.setCellValueByPosition(this.sheetIndex, this.row, this.col, this.newValue)
  }
  
  undo(): void {
    this.engine.setCellValueByPosition(this.sheetIndex, this.row, this.col, this.oldValue)
  }
  
  redo(): void {
    this.execute()
  }
}

// Set Cell Format Command
export class SetCellFormatCommand implements ICommand {
  private engine: SpreadsheetEngine
  private sheetIndex: number
  private row: number
  private col: number
  private newFormat: Partial<ICell['format']>
  private oldFormat: Partial<ICell['format']> | undefined
  private description: string
  
  constructor(
    engine: SpreadsheetEngine,
    sheetIndex: number,
    row: number,
    col: number,
    newFormat: Partial<ICell['format']>
  ) {
    this.engine = engine
    this.sheetIndex = sheetIndex
    this.row = row
    this.col = col
    this.newFormat = newFormat
    
    // Get the current format
    const cell = this.engine.getCellByPosition(sheetIndex, row, col)
    this.oldFormat = cell?.format
    
    this.description = `Set cell format at (${row}, ${col})`
  }
  
  execute(): void {
    // This is a placeholder implementation
    // In a real implementation, this would call a method on the engine to set the cell format
  }
  
  undo(): void {
    // This is a placeholder implementation
    // In a real implementation, this would call a method on the engine to restore the old format
  }
  
  redo(): void {
    this.execute()
  }
}

// Clear Cell Command
export class ClearCellCommand implements ICommand {
  private engine: SpreadsheetEngine
  private sheetIndex: number
  private row: number
  private col: number
  private oldValue: string
  private oldFormat: Partial<ICell['format']> | undefined
  private description: string
  
  constructor(
    engine: SpreadsheetEngine,
    sheetIndex: number,
    row: number,
    col: number
  ) {
    this.engine = engine
    this.sheetIndex = sheetIndex
    this.row = row
    this.col = col
    
    // Get the current value and format
    const cell = this.engine.getCellByPosition(sheetIndex, row, col)
    this.oldValue = cell ? String(cell.value || '') : ''
    this.oldFormat = cell?.format
    
    this.description = `Clear cell at (${row}, ${col})`
  }
  
  execute(): void {
    this.engine.setCellValueByPosition(this.sheetIndex, this.row, this.col, '')
    
    // In a real implementation, this would also clear the cell format
  }
  
  undo(): void {
    this.engine.setCellValueByPosition(this.sheetIndex, this.row, this.col, this.oldValue)
    
    // In a real implementation, this would also restore the cell format
  }
  
  redo(): void {
    this.execute()
  }
}

// Set Range Values Command
export class SetRangeValuesCommand implements ICommand {
  private engine: SpreadsheetEngine
  private sheetIndex: number
  private startRow: number
  private startCol: number
  private endRow: number
  private endCol: number
  private newValues: string[][]
  private oldValues: string[][]
  private description: string
  
  constructor(
    engine: SpreadsheetEngine,
    sheetIndex: number,
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    newValues: string[][]
  ) {
    this.engine = engine
    this.sheetIndex = sheetIndex
    this.startRow = startRow
    this.startCol = startCol
    this.endRow = endRow
    this.endCol = endCol
    this.newValues = newValues
    
    // Get the current values
    this.oldValues = []
    for (let row = startRow; row <= endRow; row++) {
      const rowValues: string[] = []
      for (let col = startCol; col <= endCol; col++) {
        const cell = this.engine.getCellByPosition(sheetIndex, row, col)
        rowValues.push(cell ? String(cell.value || '') : '')
      }
      this.oldValues.push(rowValues)
    }
    
    this.description = `Set range values from (${startRow}, ${startCol}) to (${endRow}, ${endCol})`
  }
  
  execute(): void {
    for (let row = this.startRow; row <= this.endRow; row++) {
      for (let col = this.startCol; col <= this.endCol; col++) {
        const rowIndex = row - this.startRow
        const colIndex = col - this.startCol
        
        if (rowIndex < this.newValues.length && colIndex < this.newValues[rowIndex].length) {
          this.engine.setCellValueByPosition(
            this.sheetIndex,
            row,
            col,
            this.newValues[rowIndex][colIndex]
          )
        }
      }
    }
  }
  
  undo(): void {
    for (let row = this.startRow; row <= this.endRow; row++) {
      for (let col = this.startCol; col <= this.endCol; col++) {
        const rowIndex = row - this.startRow
        const colIndex = col - this.startCol
        
        if (rowIndex < this.oldValues.length && colIndex < this.oldValues[rowIndex].length) {
          this.engine.setCellValueByPosition(
            this.sheetIndex,
            row,
            col,
            this.oldValues[rowIndex][colIndex]
          )
        }
      }
    }
  }
  
  redo(): void {
    this.execute()
  }
}

