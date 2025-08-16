import { Workbook, Sheet, Cell, CellValue, CellType, CellFormat } from '@/types/spreadsheet'
import { FormulaParser } from '../formula/FormulaParser'
import { formatCellReference } from '../utils'

export class SpreadsheetEngine {
  private workbook: Workbook
  private formulaParsers: Map<number, FormulaParser>
  private cellDependencies: Map<string, Set<string>>
  
  constructor(workbook: Workbook) {
    this.workbook = workbook
    this.formulaParsers = new Map()
    this.cellDependencies = new Map()
    
    // Initialize formula parsers for each sheet
    for (let i = 0; i < workbook.sheets.length; i++) {
      this.formulaParsers.set(i, new FormulaParser(this, i))
    }
    
    // Calculate all formulas
    this.recalculateAll()
  }
  
  /**
   * Gets the workbook
   */
  getWorkbook(): Workbook {
    return this.workbook
  }
  
  /**
   * Sets the workbook
   */
  setWorkbook(workbook: Workbook): void {
    this.workbook = workbook
    this.formulaParsers.clear()
    this.cellDependencies.clear()
    
    // Initialize formula parsers for each sheet
    for (let i = 0; i < workbook.sheets.length; i++) {
      this.formulaParsers.set(i, new FormulaParser(this, i))
    }
    
    // Calculate all formulas
    this.recalculateAll()
  }
  
  /**
   * Gets a sheet by index
   */
  getSheet(sheetIndex: number): Sheet {
    if (sheetIndex < 0 || sheetIndex >= this.workbook.sheets.length) {
      throw new Error(`Sheet index out of range: ${sheetIndex}`)
    }
    
    return this.workbook.sheets[sheetIndex]
  }
  
  /**
   * Gets a cell by position
   */
  getCellByPosition(sheetIndex: number, row: number, col: number): Cell | null {
    const sheet = this.getSheet(sheetIndex)
    
    if (row < 0 || row >= sheet.rowCount || col < 0 || col >= sheet.columnCount) {
      return null
    }
    
    const cellKey = `${row},${col}`
    
    if (!sheet.cells[cellKey]) {
      return null
    }
    
    return sheet.cells[cellKey]
  }
  
  /**
   * Gets a cell by reference
   */
  getCellByReference(sheetIndex: number, reference: string): Cell | null {
    const match = reference.match(/^([A-Z]+)(\d+)$/)
    
    if (!match) {
      return null
    }
    
    const colStr = match[1]
    const rowStr = match[2]
    
    let col = 0
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 64)
    }
    col--
    
    const row = parseInt(rowStr, 10) - 1
    
    return this.getCellByPosition(sheetIndex, row, col)
  }
  
  /**
   * Sets a cell value
   */
  setCellValue(sheetIndex: number, row: number, col: number, value: string): void {
    const sheet = this.getSheet(sheetIndex)
    
    if (row < 0 || row >= sheet.rowCount || col < 0 || col >= sheet.columnCount) {
      throw new Error(`Cell position out of range: ${row}, ${col}`)
    }
    
    const cellKey = `${row},${col}`
    const cellRef = formatCellReference(col, row)
    
    // Determine the cell type
    let cellType: CellType = 'text'
    let displayValue: CellValue = value
    
    if (value.startsWith('=')) {
      cellType = 'formula'
      
      // Parse the formula
      const formulaParser = this.formulaParsers.get(sheetIndex)
      
      if (formulaParser) {
        try {
          displayValue = formulaParser.parse(value)
        } catch (error) {
          displayValue = `#ERROR! ${(error as Error).message}`
        }
      } else {
        displayValue = '#ERROR! No formula parser'
      }
    } else if (!isNaN(Number(value))) {
      cellType = 'number'
      displayValue = Number(value)
    }
    
    // Create or update the cell
    const cell: Cell = {
      row,
      col,
      value,
      displayValue,
      type: cellType,
      format: sheet.cells[cellKey]?.format || {}
    }
    
    sheet.cells[cellKey] = cell
    
    // Update dependencies and recalculate dependent cells
    this.updateDependencies(sheetIndex, row, col, value)
    this.recalculateDependentCells(sheetIndex, cellRef)
  }
  
  /**
   * Sets a cell format
   */
  setCellFormat(sheetIndex: number, row: number, col: number, format: Partial<CellFormat>): void {
    const sheet = this.getSheet(sheetIndex)
    
    if (row < 0 || row >= sheet.rowCount || col < 0 || col >= sheet.columnCount) {
      throw new Error(`Cell position out of range: ${row}, ${col}`)
    }
    
    const cellKey = `${row},${col}`
    
    // Create the cell if it doesn't exist
    if (!sheet.cells[cellKey]) {
      sheet.cells[cellKey] = {
        row,
        col,
        value: '',
        displayValue: '',
        type: 'text',
        format: {}
      }
    }
    
    // Update the format
    sheet.cells[cellKey].format = {
      ...sheet.cells[cellKey].format,
      ...format
    }
  }
  
  /**
   * Recalculates all formulas in the workbook
   */
  recalculateAll(): void {
    // Clear all dependencies
    this.cellDependencies.clear()
    
    // Recalculate all sheets
    for (let sheetIndex = 0; sheetIndex < this.workbook.sheets.length; sheetIndex++) {
      const sheet = this.workbook.sheets[sheetIndex]
      
      // Find all formula cells
      const formulaCells: { row: number; col: number; value: string }[] = []
      
      for (const cellKey in sheet.cells) {
        const cell = sheet.cells[cellKey]
        
        if (cell.type === 'formula') {
          formulaCells.push({
            row: cell.row,
            col: cell.col,
            value: cell.value
          })
        }
      }
      
      // Build dependencies for all formula cells
      for (const { row, col, value } of formulaCells) {
        this.updateDependencies(sheetIndex, row, col, value)
      }
      
      // Recalculate all formula cells
      for (const { row, col, value } of formulaCells) {
        const cellKey = `${row},${col}`
        const formulaParser = this.formulaParsers.get(sheetIndex)
        
        if (formulaParser) {
          try {
            const displayValue = formulaParser.parse(value)
            sheet.cells[cellKey].displayValue = displayValue
          } catch (error) {
            sheet.cells[cellKey].displayValue = `#ERROR! ${(error as Error).message}`
          }
        }
      }
    }
  }
  
  /**
   * Updates the dependencies for a cell
   */
  private updateDependencies(sheetIndex: number, row: number, col: number, value: string): void {
    const cellRef = formatCellReference(col, row)
    const dependencyKey = `${sheetIndex}:${cellRef}`
    
    // Remove existing dependencies for this cell
    for (const [key, deps] of this.cellDependencies.entries()) {
      deps.delete(dependencyKey)
      
      if (deps.size === 0) {
        this.cellDependencies.delete(key)
      }
    }
    
    // If this is not a formula, we're done
    if (!value.startsWith('=')) {
      return
    }
    
    // Extract cell references from the formula
    const cellRefs = this.extractCellReferences(value)
    
    // Add dependencies
    for (const ref of cellRefs) {
      const depKey = `${sheetIndex}:${ref}`
      
      if (!this.cellDependencies.has(depKey)) {
        this.cellDependencies.set(depKey, new Set())
      }
      
      this.cellDependencies.get(depKey)?.add(dependencyKey)
    }
  }
  
  /**
   * Recalculates cells that depend on a given cell
   */
  private recalculateDependentCells(sheetIndex: number, cellRef: string): void {
    const dependencyKey = `${sheetIndex}:${cellRef}`
    const dependencies = this.cellDependencies.get(dependencyKey)
    
    if (!dependencies) {
      return
    }
    
    // Recalculate all dependent cells
    for (const depKey of dependencies) {
      const [depSheetIndex, depCellRef] = depKey.split(':')
      const match = depCellRef.match(/^([A-Z]+)(\d+)$/)
      
      if (!match) {
        continue
      }
      
      const colStr = match[1]
      const rowStr = match[2]
      
      let col = 0
      for (let i = 0; i < colStr.length; i++) {
        col = col * 26 + (colStr.charCodeAt(i) - 64)
      }
      col--
      
      const row = parseInt(rowStr, 10) - 1
      
      const cell = this.getCellByPosition(parseInt(depSheetIndex, 10), row, col)
      
      if (cell && cell.type === 'formula') {
        const formulaParser = this.formulaParsers.get(parseInt(depSheetIndex, 10))
        
        if (formulaParser) {
          try {
            const displayValue = formulaParser.parse(cell.value)
            cell.displayValue = displayValue
          } catch (error) {
            cell.displayValue = `#ERROR! ${(error as Error).message}`
          }
        }
        
        // Recursively recalculate cells that depend on this cell
        this.recalculateDependentCells(parseInt(depSheetIndex, 10), depCellRef)
      }
    }
  }
  
  /**
   * Extracts cell references from a formula
   */
  private extractCellReferences(formula: string): string[] {
    const cellRefs: string[] = []
    const cellRefRegex = /[A-Z]+\d+/g
    let match
    
    while ((match = cellRefRegex.exec(formula)) !== null) {
      cellRefs.push(match[0])
    }
    
    return cellRefs
  }
}

