export interface Cell {
  value: string | number | boolean | null
  displayValue?: string
  type: 'text' | 'number' | 'boolean' | 'formula' | 'date'
  format?: CellFormat
}

export interface CellFormat {
  textAlign?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  fontFamily?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline' | 'line-through'
  color?: string
  backgroundColor?: string
  border?: string
  numberFormat?: string
  dateFormat?: string
  conditionalFormat?: ConditionalFormat
}

export interface ConditionalFormat {
  type: 'greaterThan' | 'lessThan' | 'equal' | 'between' | 'contains' | 'notContains'
  value1: number | string
  value2?: number | string
  format: Partial<CellFormat>
}

export interface Sheet {
  name: string
  rowCount: number
  columnCount: number
  cells: { [key: string]: Cell }
  columnWidths: { [key: number]: number }
  rowHeights: { [key: number]: number }
  mergedCells: MergedCell[]
  hidden: boolean
}

export interface MergedCell {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
}

export interface Workbook {
  name: string
  sheets: Sheet[]
  activeSheetIndex: number
}

export interface ActiveCell {
  row: number
  col: number
}

export interface Selection {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
}

export interface CellDragEvent {
  sourceRow: number
  sourceCol: number
  targetRow: number
  targetCol: number
  isCopy: boolean
}

export interface ChartOptions {
  type: 'bar' | 'line' | 'pie' | 'scatter'
  title?: string
  dataRange: string
  headerRow?: boolean
  headerColumn?: boolean
  xAxisTitle?: string
  yAxisTitle?: string
  legendPosition?: 'top' | 'right' | 'bottom' | 'left'
  colors?: string[]
}

export interface Chart {
  id: string
  sheetIndex: number
  options: ChartOptions
  position: {
    top: number
    left: number
    width: number
    height: number
  }
}

export interface SpreadsheetState {
  workbook: Workbook
  activeCell: ActiveCell | null
  selection: Selection | null
  isEditing: boolean
  setCellValue: (row: number, col: number, value: string | number | boolean | null) => void
  setActiveCell: (row: number, col: number) => void
  setSelection: (selection: Selection | null) => void
  startEditing: () => void
  stopEditing: () => void
}

