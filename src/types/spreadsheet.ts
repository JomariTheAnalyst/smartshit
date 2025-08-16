export type CellValue = string | number | boolean | null | CellValue[][]

export type CellType = 'text' | 'number' | 'formula' | 'date' | 'boolean'

export interface CellFormat {
  // Text formatting
  fontFamily?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline' | 'line-through'
  color?: string
  
  // Cell formatting
  backgroundColor?: string
  border?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
  
  // Alignment
  horizontalAlign?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  
  // Number formatting
  numberFormat?: string
  
  // Conditional formatting
  conditionalFormat?: ConditionalFormat[]
}

export interface ConditionalFormat {
  type: 'dataBar' | 'colorScale' | 'iconSet' | 'rule'
  rule?: {
    type: 'greaterThan' | 'lessThan' | 'equal' | 'between' | 'containsText' | 'dateOccurring'
    value1?: CellValue
    value2?: CellValue
    format: Partial<CellFormat>
  }
  dataBar?: {
    minType: 'number' | 'percent' | 'formula' | 'percentile'
    minValue: number
    maxType: 'number' | 'percent' | 'formula' | 'percentile'
    maxValue: number
    barColor: string
  }
  colorScale?: {
    min: { type: 'number' | 'percent' | 'formula' | 'percentile'; value: number; color: string }
    mid?: { type: 'number' | 'percent' | 'formula' | 'percentile'; value: number; color: string }
    max: { type: 'number' | 'percent' | 'formula' | 'percentile'; value: number; color: string }
  }
  iconSet?: {
    type: '3Arrows' | '3ArrowsGray' | '3Flags' | '3TrafficLights' | '3Signs' | '3Symbols' | '3Symbols2'
    reverse?: boolean
    showIconOnly?: boolean
  }
}

export interface Cell {
  row: number
  col: number
  value: string
  displayValue: CellValue
  type: CellType
  format: Partial<CellFormat>
}

export interface Sheet {
  id: string
  name: string
  cells: { [key: string]: Cell }
  rowCount: number
  columnCount: number
  rowHeights: { [key: number]: number }
  columnWidths: { [key: number]: number }
  mergedCells: { [key: string]: { startRow: number; startCol: number; endRow: number; endCol: number } }
  hidden: boolean
}

export interface Workbook {
  id: string
  name: string
  sheets: Sheet[]
  activeSheetIndex: number
  created: string
  modified: string
  author: string
}

export interface Selection {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
}

export interface ActiveCell {
  row: number
  col: number
}

export interface CellChange {
  sheetIndex: number
  row: number
  col: number
  value: string
}

export interface FormatChange {
  sheetIndex: number
  row: number
  col: number
  format: Partial<CellFormat>
}

export interface SheetChange {
  type: 'add' | 'remove' | 'rename' | 'reorder'
  sheetIndex: number
  newName?: string
  newIndex?: number
}

export interface WorkbookChange {
  type: 'rename'
  newName: string
}

export interface CellDragEvent {
  sourceRow: number
  sourceCol: number
  targetRow: number
  targetCol: number
  isCopy: boolean
}

export interface ChartOptions {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar' | 'bubble'
  title?: string
  dataRange: string
  headerRow?: boolean
  headerColumn?: boolean
  legendPosition?: 'top' | 'right' | 'bottom' | 'left' | 'none'
  xAxisTitle?: string
  yAxisTitle?: string
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

