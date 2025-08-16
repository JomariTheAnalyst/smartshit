import { Command } from './Command'
import { SpreadsheetEngine } from '../spreadsheet/SpreadsheetEngine'
import { CellFormat } from '@/types/spreadsheet'

export class SetCellFormatCommand implements Command {
  private engine: SpreadsheetEngine
  private sheetIndex: number
  private row: number
  private col: number
  private newFormat: Partial<CellFormat>
  private oldFormat: Partial<CellFormat>
  
  constructor(
    engine: SpreadsheetEngine,
    sheetIndex: number,
    row: number,
    col: number,
    format: Partial<CellFormat>
  ) {
    this.engine = engine
    this.sheetIndex = sheetIndex
    this.row = row
    this.col = col
    this.newFormat = format
    
    // Get the current format
    const cell = this.engine.getCellByPosition(this.sheetIndex, this.row, this.col)
    this.oldFormat = cell?.format || {}
  }
  
  execute(): void {
    this.engine.setCellFormat(
      this.sheetIndex,
      this.row,
      this.col,
      this.newFormat
    )
  }
  
  undo(): void {
    this.engine.setCellFormat(
      this.sheetIndex,
      this.row,
      this.col,
      this.oldFormat
    )
  }
  
  toString(): string {
    return `Set format for cell at row ${this.row}, column ${this.col}`
  }
}

export class SetRangeFormatCommand implements Command {
  private engine: SpreadsheetEngine
  private sheetIndex: number
  private startRow: number
  private startCol: number
  private endRow: number
  private endCol: number
  private newFormat: Partial<CellFormat>
  private oldFormats: { [key: string]: Partial<CellFormat> }
  
  constructor(
    engine: SpreadsheetEngine,
    sheetIndex: number,
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    format: Partial<CellFormat>
  ) {
    this.engine = engine
    this.sheetIndex = sheetIndex
    this.startRow = startRow
    this.startCol = startCol
    this.endRow = endRow
    this.endCol = endCol
    this.newFormat = format
    this.oldFormats = {}
    
    // Get the current formats
    for (let row = this.startRow; row <= this.endRow; row++) {
      for (let col = this.startCol; col <= this.endCol; col++) {
        const cell = this.engine.getCellByPosition(this.sheetIndex, row, col)
        this.oldFormats[`${row},${col}`] = cell?.format || {}
      }
    }
  }
  
  execute(): void {
    for (let row = this.startRow; row <= this.endRow; row++) {
      for (let col = this.startCol; col <= this.endCol; col++) {
        this.engine.setCellFormat(
          this.sheetIndex,
          row,
          col,
          this.newFormat
        )
      }
    }
  }
  
  undo(): void {
    for (let row = this.startRow; row <= this.endRow; row++) {
      for (let col = this.startCol; col <= this.endCol; col++) {
        const key = `${row},${col}`
        this.engine.setCellFormat(
          this.sheetIndex,
          row,
          col,
          this.oldFormats[key] || {}
        )
      }
    }
  }
  
  toString(): string {
    return `Set format for range from row ${this.startRow}, column ${this.startCol} to row ${this.endRow}, column ${this.endCol}`
  }
}

export class AddConditionalFormatCommand implements Command {
  private engine: SpreadsheetEngine
  private sheetIndex: number
  private startRow: number
  private startCol: number
  private endRow: number
  private endCol: number
  private conditionalFormat: any
  private oldFormats: { [key: string]: Partial<CellFormat> }
  
  constructor(
    engine: SpreadsheetEngine,
    sheetIndex: number,
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    conditionalFormat: any
  ) {
    this.engine = engine
    this.sheetIndex = sheetIndex
    this.startRow = startRow
    this.startCol = startCol
    this.endRow = endRow
    this.endCol = endCol
    this.conditionalFormat = conditionalFormat
    this.oldFormats = {}
    
    // Get the current formats
    for (let row = this.startRow; row <= this.endRow; row++) {
      for (let col = this.startCol; col <= this.endCol; col++) {
        const cell = this.engine.getCellByPosition(this.sheetIndex, row, col)
        this.oldFormats[`${row},${col}`] = cell?.format || {}
      }
    }
  }
  
  execute(): void {
    for (let row = this.startRow; row <= this.endRow; row++) {
      for (let col = this.startCol; col <= this.endCol; col++) {
        const cell = this.engine.getCellByPosition(this.sheetIndex, row, col)
        const currentFormat = cell?.format || {}
        
        // Add the conditional format
        const newFormat: Partial<CellFormat> = {
          ...currentFormat,
          conditionalFormat: [
            ...(currentFormat.conditionalFormat || []),
            this.conditionalFormat
          ]
        }
        
        this.engine.setCellFormat(
          this.sheetIndex,
          row,
          col,
          newFormat
        )
      }
    }
  }
  
  undo(): void {
    for (let row = this.startRow; row <= this.endRow; row++) {
      for (let col = this.startCol; col <= this.endCol; col++) {
        const key = `${row},${col}`
        this.engine.setCellFormat(
          this.sheetIndex,
          row,
          col,
          this.oldFormats[key] || {}
        )
      }
    }
  }
  
  toString(): string {
    return `Add conditional format to range from row ${this.startRow}, column ${this.startCol} to row ${this.endRow}, column ${this.endCol}`
  }
}

