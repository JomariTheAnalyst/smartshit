import * as XLSX from 'xlsx'
import { IWorkbook, ISheet, ICell, CellValueType } from '@/types/spreadsheet'
import { formatCellReference } from '@/lib/utils'

// Import a workbook from an Excel file
export function importWorkbook(file: File): Promise<IWorkbook> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        const importedWorkbook: IWorkbook = {
          id: Math.random().toString(36).substring(2, 11),
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          sheets: [],
          activeSheetIndex: 0
        }
        
        // Process each sheet
        workbook.SheetNames.forEach((sheetName, index) => {
          const xlsxSheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(xlsxSheet, { header: 1 })
          
          const sheet: ISheet = {
            id: Math.random().toString(36).substring(2, 11),
            name: sheetName,
            cells: {},
            rowCount: jsonData.length > 0 ? jsonData.length : 1000,
            columnCount: 0,
            rowHeights: {},
            columnWidths: {},
            mergedCells: [],
            hiddenRows: [],
            hiddenColumns: [],
            frozenRows: 0,
            frozenColumns: 0
          }
          
          // Process the data
          jsonData.forEach((row: any[], rowIndex: number) => {
            row.forEach((cellValue: any, colIndex: number) => {
              // Update the column count
              if (colIndex + 1 > sheet.columnCount) {
                sheet.columnCount = colIndex + 1
              }
              
              // Create the cell
              const cellRef = formatCellReference(colIndex, rowIndex)
              
              // Determine the cell type and value
              let type: CellValueType = 'string'
              let value: any = cellValue
              
              if (cellValue === undefined || cellValue === null) {
                type = 'empty'
                value = null
              } else if (typeof cellValue === 'number') {
                type = 'number'
              } else if (typeof cellValue === 'boolean') {
                type = 'boolean'
              } else if (cellValue instanceof Date) {
                type = 'date'
                value = cellValue.toISOString()
              } else if (typeof cellValue === 'string' && cellValue.startsWith('=')) {
                type = 'formula'
              }
              
              // Add the cell to the sheet
              sheet.cells[cellRef] = {
                value,
                type
              }
            })
          })
          
          // Ensure the column count is at least 26 (A-Z)
          if (sheet.columnCount < 26) {
            sheet.columnCount = 26
          }
          
          // Add the sheet to the workbook
          importedWorkbook.sheets.push(sheet)
        })
        
        resolve(importedWorkbook)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = (error) => {
      reject(error)
    }
    
    reader.readAsArrayBuffer(file)
  })
}

// Export a workbook to an Excel file
export function exportWorkbook(workbook: IWorkbook): void {
  // Create a new XLSX workbook
  const xlsxWorkbook = XLSX.utils.book_new()
  
  // Process each sheet
  workbook.sheets.forEach((sheet) => {
    // Convert the sheet data to an array of arrays
    const data: any[][] = []
    
    // Determine the maximum row and column
    let maxRow = 0
    let maxCol = 0
    
    Object.entries(sheet.cells).forEach(([cellRef, cell]) => {
      const match = cellRef.match(/([A-Z]+)(\d+)/)
      
      if (match) {
        const colStr = match[1]
        const rowStr = match[2]
        
        // Convert column letters to index (A=0, B=1, etc.)
        let colIndex = 0
        for (let i = 0; i < colStr.length; i++) {
          colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64)
        }
        colIndex -= 1
        
        const rowIndex = parseInt(rowStr, 10) - 1
        
        // Update the maximum row and column
        if (rowIndex > maxRow) {
          maxRow = rowIndex
        }
        
        if (colIndex > maxCol) {
          maxCol = colIndex
        }
        
        // Ensure the data array has enough rows
        while (data.length <= rowIndex) {
          data.push([])
        }
        
        // Ensure the row has enough columns
        while (data[rowIndex].length <= colIndex) {
          data[rowIndex].push(null)
        }
        
        // Set the cell value
        let value = cell.value
        
        if (cell.type === 'date' && typeof value === 'string') {
          value = new Date(value)
        }
        
        data[rowIndex][colIndex] = value
      }
    })
    
    // Create the XLSX sheet
    const xlsxSheet = XLSX.utils.aoa_to_sheet(data)
    
    // Add the sheet to the workbook
    XLSX.utils.book_append_sheet(xlsxWorkbook, xlsxSheet, sheet.name)
  })
  
  // Generate the Excel file
  XLSX.writeFile(xlsxWorkbook, `${workbook.name}.xlsx`)
}

