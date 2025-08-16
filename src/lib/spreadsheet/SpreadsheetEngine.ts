import { IWorkbook, ISheet, ICell, ICellFormat } from '@/types/spreadsheet'
import { parseCellReference, formatCellReference } from '@/lib/utils'

export class SpreadsheetEngine {
  private workbook: IWorkbook
  private dependencyGraph: Map<string, Set<string>> = new Map()
  
  constructor(workbook: IWorkbook) {
    this.workbook = workbook
    this.buildDependencyGraph()
  }
  
  // Get the current workbook
  getWorkbook(): IWorkbook {
    return this.workbook
  }
  
  // Set the workbook
  setWorkbook(workbook: IWorkbook): void {
    this.workbook = workbook
    this.buildDependencyGraph()
  }
  
  // Get a sheet by index
  getSheet(index: number): ISheet | null {
    return this.workbook.sheets[index] || null
  }
  
  // Get the active sheet
  getActiveSheet(): ISheet {
    return this.workbook.sheets[this.workbook.activeSheetIndex]
  }
  
  // Get a cell by reference (e.g., "A1")
  getCell(sheetIndex: number, cellRef: string): ICell | null {
    const sheet = this.getSheet(sheetIndex)
    if (!sheet) return null
    
    return sheet.cells[cellRef] || null
  }
  
  // Get a cell by row and column
  getCellByPosition(sheetIndex: number, row: number, col: number): ICell | null {
    const cellRef = formatCellReference(col, row)
    return this.getCell(sheetIndex, cellRef)
  }
  
  // Set a cell value
  setCellValue(sheetIndex: number, cellRef: string, value: string): void {
    const sheet = this.getSheet(sheetIndex)
    if (!sheet) return
    
    // Create or update the cell
    let cell: ICell = sheet.cells[cellRef] || {
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
      
      // Update dependencies for this formula
      this.updateFormulaDependencies(sheetIndex, cellRef, value)
    } else if (!isNaN(Number(value))) {
      type = 'number'
      cellValue = Number(value)
    } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
      type = 'boolean'
      cellValue = value.toLowerCase() === 'true'
    }
    
    // Update the cell
    cell = {
      ...cell,
      value: cellValue,
      type
    }
    
    sheet.cells[cellRef] = cell
    
    // Recalculate dependent cells
    this.recalculateDependents(sheetIndex, cellRef)
  }
  
  // Set a cell value by row and column
  setCellValueByPosition(sheetIndex: number, row: number, col: number, value: string): void {
    const cellRef = formatCellReference(col, row)
    this.setCellValue(sheetIndex, cellRef, value)
  }
  
  // Set cell format
  setCellFormat(sheetIndex: number, cellRef: string, format: Partial<ICellFormat>): void {
    const sheet = this.getSheet(sheetIndex)
    if (!sheet) return
    
    // Create or update the cell
    let cell: ICell = sheet.cells[cellRef] || {
      value: null,
      type: 'empty'
    }
    
    // Update the cell format
    cell = {
      ...cell,
      format: {
        ...cell.format,
        ...format
      }
    }
    
    sheet.cells[cellRef] = cell
  }
  
  // Get the formatted display value of a cell
  getCellDisplayValue(sheetIndex: number, cellRef: string): string {
    const cell = this.getCell(sheetIndex, cellRef)
    if (!cell) return ''
    
    if (cell.type === 'formula') {
      // For now, just return the formula result as a string
      // In a real implementation, this would format the result based on the cell format
      const result = this.evaluateFormula(sheetIndex, cellRef, cell.value as string)
      return result !== null ? String(result) : ''
    }
    
    // For now, just return the cell value as a string
    // In a real implementation, this would format the value based on the cell format
    return cell.value !== null ? String(cell.value) : ''
  }
  
  // Evaluate a formula
  evaluateFormula(sheetIndex: number, cellRef: string, formula: string): any {
    // This is a placeholder for formula evaluation
    // In a real implementation, this would parse and evaluate the formula
    
    // For now, just return a simple value
    return 0
  }
  
  // Build the dependency graph for all formulas in the workbook
  private buildDependencyGraph(): void {
    this.dependencyGraph.clear()
    
    // Iterate through all sheets and cells
    this.workbook.sheets.forEach((sheet, sheetIndex) => {
      Object.entries(sheet.cells).forEach(([cellRef, cell]) => {
        if (cell.type === 'formula' && typeof cell.value === 'string') {
          this.updateFormulaDependencies(sheetIndex, cellRef, cell.value)
        }
      })
    })
  }
  
  // Update the dependencies for a formula
  private updateFormulaDependencies(sheetIndex: number, cellRef: string, formula: string): void {
    // Remove existing dependencies for this cell
    this.dependencyGraph.forEach((dependents, dependency) => {
      dependents.delete(cellRef)
    })
    
    // Extract cell references from the formula
    // This is a simplified implementation that just looks for patterns like A1, B2, etc.
    const cellRefPattern = /[A-Z]+\d+/g
    const dependencies = formula.match(cellRefPattern) || []
    
    // Add dependencies to the graph
    dependencies.forEach(dependency => {
      if (!this.dependencyGraph.has(dependency)) {
        this.dependencyGraph.set(dependency, new Set())
      }
      
      this.dependencyGraph.get(dependency)?.add(cellRef)
    })
  }
  
  // Recalculate cells that depend on the given cell
  private recalculateDependents(sheetIndex: number, cellRef: string): void {
    const dependents = this.dependencyGraph.get(cellRef)
    if (!dependents) return
    
    // Recalculate each dependent cell
    dependents.forEach(dependent => {
      const cell = this.getCell(sheetIndex, dependent)
      if (cell && cell.type === 'formula' && typeof cell.value === 'string') {
        const result = this.evaluateFormula(sheetIndex, dependent, cell.value)
        
        // Update the cell with the new result
        // Note: We're not updating the cell.value directly to avoid losing the formula
        // In a real implementation, we would store both the formula and the calculated value
      }
      
      // Recursively recalculate cells that depend on this dependent
      this.recalculateDependents(sheetIndex, dependent)
    })
  }
}

