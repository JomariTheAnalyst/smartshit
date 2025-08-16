import { Command } from './Command'
import { SpreadsheetEngine } from '../spreadsheet/SpreadsheetEngine'
import { Cell } from '@/types/spreadsheet'

export class MoveCellCommand implements Command {
  private engine: SpreadsheetEngine
  private sheetIndex: number
  private sourceRow: number
  private sourceCol: number
  private targetRow: number
  private targetCol: number
  private sourceCell: Cell | null
  private targetCell: Cell | null
  
  constructor(
    engine: SpreadsheetEngine,
    sheetIndex: number,
    sourceRow: number,
    sourceCol: number,
    targetRow: number,
    targetCol: number
  ) {
    this.engine = engine
    this.sheetIndex = sheetIndex
    this.sourceRow = sourceRow
    this.sourceCol = sourceCol
    this.targetRow = targetRow
    this.targetCol = targetCol
    
    // Get the source and target cells
    this.sourceCell = this.engine.getCellByPosition(this.sheetIndex, this.sourceRow, this.sourceCol)
    this.targetCell = this.engine.getCellByPosition(this.sheetIndex, this.targetRow, this.targetCol)
  }
  
  execute(): void {
    if (!this.sourceCell) {
      return
    }
    
    // Move the cell
    this.engine.setCellValue(
      this.sheetIndex,
      this.targetRow,
      this.targetCol,
      this.sourceCell.value
    )
    
    // Clear the source cell
    this.engine.setCellValue(
      this.sheetIndex,
      this.sourceRow,
      this.sourceCol,
      ''
    )
    
    // Copy the format
    if (this.sourceCell.format) {
      this.engine.setCellFormat(
        this.sheetIndex,
        this.targetRow,
        this.targetCol,
        this.sourceCell.format
      )
    }
  }
  
  undo(): void {
    // Restore the source cell
    if (this.sourceCell) {
      this.engine.setCellValue(
        this.sheetIndex,
        this.sourceRow,
        this.sourceCol,
        this.sourceCell.value
      )
      
      if (this.sourceCell.format) {
        this.engine.setCellFormat(
          this.sheetIndex,
          this.sourceRow,
          this.sourceCol,
          this.sourceCell.format
        )
      }
    }
    
    // Restore the target cell
    if (this.targetCell) {
      this.engine.setCellValue(
        this.sheetIndex,
        this.targetRow,
        this.targetCol,
        this.targetCell.value
      )
      
      if (this.targetCell.format) {
        this.engine.setCellFormat(
          this.sheetIndex,
          this.targetRow,
          this.targetCol,
          this.targetCell.format
        )
      }
    } else {
      // Clear the target cell if it didn't exist before
      this.engine.setCellValue(
        this.sheetIndex,
        this.targetRow,
        this.targetCol,
        ''
      )
    }
  }
  
  toString(): string {
    return `Move cell from row ${this.sourceRow}, column ${this.sourceCol} to row ${this.targetRow}, column ${this.targetCol}`
  }
}

export class CopyCellCommand implements Command {
  private engine: SpreadsheetEngine
  private sheetIndex: number
  private sourceRow: number
  private sourceCol: number
  private targetRow: number
  private targetCol: number
  private sourceCell: Cell | null
  private targetCell: Cell | null
  
  constructor(
    engine: SpreadsheetEngine,
    sheetIndex: number,
    sourceRow: number,
    sourceCol: number,
    targetRow: number,
    targetCol: number
  ) {
    this.engine = engine
    this.sheetIndex = sheetIndex
    this.sourceRow = sourceRow
    this.sourceCol = sourceCol
    this.targetRow = targetRow
    this.targetCol = targetCol
    
    // Get the source and target cells
    this.sourceCell = this.engine.getCellByPosition(this.sheetIndex, this.sourceRow, this.sourceCol)
    this.targetCell = this.engine.getCellByPosition(this.sheetIndex, this.targetRow, this.targetCol)
  }
  
  execute(): void {
    if (!this.sourceCell) {
      return
    }
    
    // Copy the cell
    this.engine.setCellValue(
      this.sheetIndex,
      this.targetRow,
      this.targetCol,
      this.sourceCell.value
    )
    
    // Copy the format
    if (this.sourceCell.format) {
      this.engine.setCellFormat(
        this.sheetIndex,
        this.targetRow,
        this.targetCol,
        this.sourceCell.format
      )
    }
  }
  
  undo(): void {
    // Restore the target cell
    if (this.targetCell) {
      this.engine.setCellValue(
        this.sheetIndex,
        this.targetRow,
        this.targetCol,
        this.targetCell.value
      )
      
      if (this.targetCell.format) {
        this.engine.setCellFormat(
          this.sheetIndex,
          this.targetRow,
          this.targetCol,
          this.targetCell.format
        )
      }
    } else {
      // Clear the target cell if it didn't exist before
      this.engine.setCellValue(
        this.sheetIndex,
        this.targetRow,
        this.targetCol,
        ''
      )
    }
  }
  
  toString(): string {
    return `Copy cell from row ${this.sourceRow}, column ${this.sourceCol} to row ${this.targetRow}, column ${this.targetCol}`
  }
}

export class MoveRangeCommand implements Command {
  private engine: SpreadsheetEngine
  private sheetIndex: number
  private sourceStartRow: number
  private sourceStartCol: number
  private sourceEndRow: number
  private sourceEndCol: number
  private targetStartRow: number
  private targetStartCol: number
  private sourceCells: { [key: string]: Cell }
  private targetCells: { [key: string]: Cell | null }
  
  constructor(
    engine: SpreadsheetEngine,
    sheetIndex: number,
    sourceStartRow: number,
    sourceStartCol: number,
    sourceEndRow: number,
    sourceEndCol: number,
    targetStartRow: number,
    targetStartCol: number
  ) {
    this.engine = engine
    this.sheetIndex = sheetIndex
    this.sourceStartRow = sourceStartRow
    this.sourceStartCol = sourceStartCol
    this.sourceEndRow = sourceEndRow
    this.sourceEndCol = sourceEndCol
    this.targetStartRow = targetStartRow
    this.targetStartCol = targetStartCol
    this.sourceCells = {}
    this.targetCells = {}
    
    // Get the source cells
    for (let row = sourceStartRow; row <= sourceEndRow; row++) {
      for (let col = sourceStartCol; col <= sourceEndCol; col++) {
        const cell = this.engine.getCellByPosition(this.sheetIndex, row, col)
        if (cell) {
          this.sourceCells[`${row},${col}`] = { ...cell }
        }
      }
    }
    
    // Get the target cells
    const rowOffset = targetStartRow - sourceStartRow
    const colOffset = targetStartCol - sourceStartCol
    
    for (let row = sourceStartRow; row <= sourceEndRow; row++) {
      for (let col = sourceStartCol; col <= sourceEndCol; col++) {
        const targetRow = row + rowOffset
        const targetCol = col + colOffset
        const cell = this.engine.getCellByPosition(this.sheetIndex, targetRow, targetCol)
        this.targetCells[`${targetRow},${targetCol}`] = cell ? { ...cell } : null
      }
    }
  }
  
  execute(): void {
    // Move the cells
    const rowOffset = this.targetStartRow - this.sourceStartRow
    const colOffset = this.targetStartCol - this.sourceStartCol
    
    // First, copy the source cells to the target positions
    for (let row = this.sourceStartRow; row <= this.sourceEndRow; row++) {
      for (let col = this.sourceStartCol; col <= this.sourceEndCol; col++) {
        const sourceCell = this.sourceCells[`${row},${col}`]
        
        if (sourceCell) {
          const targetRow = row + rowOffset
          const targetCol = col + colOffset
          
          this.engine.setCellValue(
            this.sheetIndex,
            targetRow,
            targetCol,
            sourceCell.value
          )
          
          if (sourceCell.format) {
            this.engine.setCellFormat(
              this.sheetIndex,
              targetRow,
              targetCol,
              sourceCell.format
            )
          }
        }
      }
    }
    
    // Then, clear the source cells
    for (let row = this.sourceStartRow; row <= this.sourceEndRow; row++) {
      for (let col = this.sourceStartCol; col <= this.sourceEndCol; col++) {
        this.engine.setCellValue(
          this.sheetIndex,
          row,
          col,
          ''
        )
      }
    }
  }
  
  undo(): void {
    // Restore the source cells
    for (const key in this.sourceCells) {
      const [row, col] = key.split(',').map(Number)
      const cell = this.sourceCells[key]
      
      this.engine.setCellValue(
        this.sheetIndex,
        row,
        col,
        cell.value
      )
      
      if (cell.format) {
        this.engine.setCellFormat(
          this.sheetIndex,
          row,
          col,
          cell.format
        )
      }
    }
    
    // Restore the target cells
    for (const key in this.targetCells) {
      const [row, col] = key.split(',').map(Number)
      const cell = this.targetCells[key]
      
      if (cell) {
        this.engine.setCellValue(
          this.sheetIndex,
          row,
          col,
          cell.value
        )
        
        if (cell.format) {
          this.engine.setCellFormat(
            this.sheetIndex,
            row,
            col,
            cell.format
          )
        }
      } else {
        // Clear the cell if it didn't exist before
        this.engine.setCellValue(
          this.sheetIndex,
          row,
          col,
          ''
        )
      }
    }
  }
  
  toString(): string {
    return `Move range from (${this.sourceStartRow},${this.sourceStartCol}) to (${this.sourceEndRow},${this.sourceEndCol}) to (${this.targetStartRow},${this.targetStartCol})`
  }
}

export class CopyRangeCommand implements Command {
  private engine: SpreadsheetEngine
  private sheetIndex: number
  private sourceStartRow: number
  private sourceStartCol: number
  private sourceEndRow: number
  private sourceEndCol: number
  private targetStartRow: number
  private targetStartCol: number
  private sourceCells: { [key: string]: Cell }
  private targetCells: { [key: string]: Cell | null }
  
  constructor(
    engine: SpreadsheetEngine,
    sheetIndex: number,
    sourceStartRow: number,
    sourceStartCol: number,
    sourceEndRow: number,
    sourceEndCol: number,
    targetStartRow: number,
    targetStartCol: number
  ) {
    this.engine = engine
    this.sheetIndex = sheetIndex
    this.sourceStartRow = sourceStartRow
    this.sourceStartCol = sourceStartCol
    this.sourceEndRow = sourceEndRow
    this.sourceEndCol = sourceEndCol
    this.targetStartRow = targetStartRow
    this.targetStartCol = targetStartCol
    this.sourceCells = {}
    this.targetCells = {}
    
    // Get the source cells
    for (let row = sourceStartRow; row <= sourceEndRow; row++) {
      for (let col = sourceStartCol; col <= sourceEndCol; col++) {
        const cell = this.engine.getCellByPosition(this.sheetIndex, row, col)
        if (cell) {
          this.sourceCells[`${row},${col}`] = { ...cell }
        }
      }
    }
    
    // Get the target cells
    const rowOffset = targetStartRow - sourceStartRow
    const colOffset = targetStartCol - sourceStartCol
    
    for (let row = sourceStartRow; row <= sourceEndRow; row++) {
      for (let col = sourceStartCol; col <= sourceEndCol; col++) {
        const targetRow = row + rowOffset
        const targetCol = col + colOffset
        const cell = this.engine.getCellByPosition(this.sheetIndex, targetRow, targetCol)
        this.targetCells[`${targetRow},${targetCol}`] = cell ? { ...cell } : null
      }
    }
  }
  
  execute(): void {
    // Copy the cells
    const rowOffset = this.targetStartRow - this.sourceStartRow
    const colOffset = this.targetStartCol - this.sourceStartCol
    
    for (let row = this.sourceStartRow; row <= this.sourceEndRow; row++) {
      for (let col = this.sourceStartCol; col <= this.sourceEndCol; col++) {
        const sourceCell = this.sourceCells[`${row},${col}`]
        
        if (sourceCell) {
          const targetRow = row + rowOffset
          const targetCol = col + colOffset
          
          this.engine.setCellValue(
            this.sheetIndex,
            targetRow,
            targetCol,
            sourceCell.value
          )
          
          if (sourceCell.format) {
            this.engine.setCellFormat(
              this.sheetIndex,
              targetRow,
              targetCol,
              sourceCell.format
            )
          }
        }
      }
    }
  }
  
  undo(): void {
    // Restore the target cells
    for (const key in this.targetCells) {
      const [row, col] = key.split(',').map(Number)
      const cell = this.targetCells[key]
      
      if (cell) {
        this.engine.setCellValue(
          this.sheetIndex,
          row,
          col,
          cell.value
        )
        
        if (cell.format) {
          this.engine.setCellFormat(
            this.sheetIndex,
            row,
            col,
            cell.format
          )
        }
      } else {
        // Clear the cell if it didn't exist before
        this.engine.setCellValue(
          this.sheetIndex,
          row,
          col,
          ''
        )
      }
    }
  }
  
  toString(): string {
    return `Copy range from (${this.sourceStartRow},${this.sourceStartCol}) to (${this.sourceEndRow},${this.sourceEndCol}) to (${this.targetStartRow},${this.targetStartCol})`
  }
}

