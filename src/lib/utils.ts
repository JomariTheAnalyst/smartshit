import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert column index to letter (0 -> A, 1 -> B, etc.)
export function colIndexToLetter(index: number): string {
  let result = ''
  let i = index
  
  do {
    result = String.fromCharCode(65 + (i % 26)) + result
    i = Math.floor(i / 26) - 1
  } while (i >= 0)
  
  return result
}

// Convert letter to column index (A -> 0, B -> 1, etc.)
export function letterToColIndex(letter: string): number {
  let result = 0
  
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 64)
  }
  
  return result - 1
}

// Parse cell reference (e.g., "A1" -> { col: 0, row: 0 })
export function parseCellReference(ref: string): { col: number; row: number } | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/)
  
  if (!match) {
    return null
  }
  
  const [, colStr, rowStr] = match
  const col = letterToColIndex(colStr)
  const row = parseInt(rowStr, 10) - 1
  
  return { col, row }
}

// Format cell reference (e.g., { col: 0, row: 0 } -> "A1")
export function formatCellReference(col: number, row: number): string {
  return `${colIndexToLetter(col)}${row + 1}`
}

