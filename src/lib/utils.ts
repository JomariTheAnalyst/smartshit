/**
 * Converts a column index to a column letter (e.g., 0 -> A, 25 -> Z, 26 -> AA)
 */
export function columnIndexToLetter(index: number): string {
  let letter = ''
  
  while (index >= 0) {
    letter = String.fromCharCode(65 + (index % 26)) + letter
    index = Math.floor(index / 26) - 1
  }
  
  return letter
}

/**
 * Converts a column letter to a column index (e.g., A -> 0, Z -> 25, AA -> 26)
 */
export function columnLetterToIndex(letter: string): number {
  let index = 0
  
  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + letter.charCodeAt(i) - 64
  }
  
  return index - 1
}

/**
 * Formats a cell reference in A1 notation (e.g., column 0, row 0 -> A1)
 */
export function formatCellReference(column: number, row: number): string {
  return `${columnIndexToLetter(column)}${row + 1}`
}

/**
 * Parses a cell reference in A1 notation (e.g., A1 -> { column: 0, row: 0 })
 */
export function parseCellReference(reference: string): { column: number; row: number } {
  const match = reference.match(/^([A-Z]+)(\d+)$/)
  
  if (!match) {
    throw new Error(`Invalid cell reference: ${reference}`)
  }
  
  const column = columnLetterToIndex(match[1])
  const row = parseInt(match[2], 10) - 1
  
  return { column, row }
}

/**
 * Formats a range reference in A1 notation (e.g., column 0, row 0, column 1, row 1 -> A1:B2)
 */
export function formatRangeReference(
  startColumn: number,
  startRow: number,
  endColumn: number,
  endRow: number
): string {
  return `${formatCellReference(startColumn, startRow)}:${formatCellReference(endColumn, endRow)}`
}

/**
 * Parses a range reference in A1 notation (e.g., A1:B2 -> { startColumn: 0, startRow: 0, endColumn: 1, endRow: 1 })
 */
export function parseRangeReference(reference: string): {
  startColumn: number
  startRow: number
  endColumn: number
  endRow: number
} {
  const match = reference.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/)
  
  if (!match) {
    throw new Error(`Invalid range reference: ${reference}`)
  }
  
  const startColumn = columnLetterToIndex(match[1])
  const startRow = parseInt(match[2], 10) - 1
  const endColumn = columnLetterToIndex(match[3])
  const endRow = parseInt(match[4], 10) - 1
  
  return { startColumn, startRow, endColumn, endRow }
}

/**
 * Generates a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Debounces a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttles a function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

