// Cell value types
export type CellValueType = 'string' | 'number' | 'boolean' | 'date' | 'error' | 'formula' | 'empty'

// Cell format types
export type HorizontalAlignment = 'left' | 'center' | 'right' | 'justify'
export type VerticalAlignment = 'top' | 'middle' | 'bottom'
export type BorderStyle = 'none' | 'thin' | 'medium' | 'thick' | 'dashed' | 'dotted' | 'double'
export type NumberFormat = 
  | 'general' 
  | 'number' 
  | 'currency' 
  | 'accounting' 
  | 'date' 
  | 'time' 
  | 'percentage' 
  | 'fraction' 
  | 'scientific' 
  | 'text' 
  | 'custom'

// Cell interface
export interface ICell {
  value: string | number | boolean | Date | null
  type: CellValueType
  formula?: string
  format?: ICellFormat
  error?: string
}

// Cell format interface
export interface ICellFormat {
  numberFormat?: NumberFormat
  customFormat?: string
  horizontalAlignment?: HorizontalAlignment
  verticalAlignment?: VerticalAlignment
  wrapText?: boolean
  textRotation?: number
  indent?: number
  font?: {
    name?: string
    size?: number
    bold?: boolean
    italic?: boolean
    underline?: boolean
    strikethrough?: boolean
    color?: string
  }
  fill?: {
    type?: 'solid' | 'pattern' | 'gradient'
    color?: string
    patternColor?: string
  }
  border?: {
    top?: { style: BorderStyle; color: string }
    right?: { style: BorderStyle; color: string }
    bottom?: { style: BorderStyle; color: string }
    left?: { style: BorderStyle; color: string }
  }
}

// Sheet interface
export interface ISheet {
  id: string
  name: string
  cells: Record<string, ICell>
  rowCount: number
  columnCount: number
  rowHeights: Record<number, number>
  columnWidths: Record<number, number>
  mergedCells: string[]
  hiddenRows: number[]
  hiddenColumns: number[]
  frozenRows: number
  frozenColumns: number
}

// Workbook interface
export interface IWorkbook {
  id: string
  name: string
  sheets: ISheet[]
  activeSheetIndex: number
}

// Selection interface
export interface ISelection {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
  type: 'cell' | 'row' | 'column' | 'range'
}

// Command interface for undo/redo
export interface ICommand {
  execute: () => void
  undo: () => void
  redo: () => void
  description: string
}

// Conditional format interface
export interface IConditionalFormat {
  id: string
  type: 'dataBar' | 'colorScale' | 'iconSet' | 'cellValue' | 'expression'
  range: string
  priority: number
  stopIfTrue?: boolean
  formula?: string
  style?: Partial<ICellFormat>
  
  // For data bars
  dataBar?: {
    minType: 'min' | 'number' | 'percent' | 'formula' | 'percentile'
    maxType: 'max' | 'number' | 'percent' | 'formula' | 'percentile'
    minValue?: number | string
    maxValue?: number | string
    color: string
    showValue: boolean
    gradient: boolean
  }
  
  // For color scales
  colorScale?: {
    colors: string[]
    values: Array<number | string | null>
    valueTypes: Array<'min' | 'max' | 'number' | 'percent' | 'formula' | 'percentile'>
  }
  
  // For icon sets
  iconSet?: {
    type: '3Arrows' | '3ArrowsGray' | '3Flags' | '3TrafficLights' | '3Signs' | '3Symbols' | '3Symbols2'
    values: Array<number | string>
    valueTypes: Array<'number' | 'percent' | 'formula' | 'percentile'>
    showValue: boolean
    reverse: boolean
  }
  
  // For cell value rules
  cellValue?: {
    operator: 'equal' | 'notEqual' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual' | 'between' | 'notBetween'
    value1: number | string
    value2?: number | string
  }
}

