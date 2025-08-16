import { SpreadsheetEngine } from '../spreadsheet/SpreadsheetEngine'
import { Cell, CellValue } from '@/types/spreadsheet'
import { formatCellReference, parseCellReference, parseRangeReference } from '../utils'

export class FormulaParser {
  private engine: SpreadsheetEngine
  private sheetIndex: number
  
  constructor(engine: SpreadsheetEngine, sheetIndex: number) {
    this.engine = engine
    this.sheetIndex = sheetIndex
  }
  
  /**
   * Parses and evaluates a formula
   */
  parse(formula: string): CellValue {
    // Remove the leading equals sign
    if (formula.startsWith('=')) {
      formula = formula.substring(1)
    }
    
    try {
      // Tokenize the formula
      const tokens = this.tokenize(formula)
      
      // Parse the tokens
      const result = this.parseTokens(tokens)
      
      return result
    } catch (error) {
      console.error('Error parsing formula:', error)
      return `#ERROR! ${(error as Error).message}`
    }
  }
  
  /**
   * Tokenizes a formula into tokens
   */
  private tokenize(formula: string): string[] {
    // Replace all functions with placeholders
    const functionRegex = /([A-Z]+)\(/g
    const functions: string[] = []
    
    let modifiedFormula = formula.replace(functionRegex, (match, functionName) => {
      functions.push(functionName)
      return `FUNCTION_${functions.length - 1}(`
    })
    
    // Split the formula into tokens
    const tokens: string[] = []
    let currentToken = ''
    let inString = false
    let parenLevel = 0
    
    for (let i = 0; i < modifiedFormula.length; i++) {
      const char = modifiedFormula[i]
      
      if (char === '"' && (i === 0 || modifiedFormula[i - 1] !== '\\')) {
        inString = !inString
        currentToken += char
      } else if (inString) {
        currentToken += char
      } else if (char === '(') {
        if (currentToken) {
          tokens.push(currentToken)
          currentToken = ''
        }
        tokens.push('(')
        parenLevel++
      } else if (char === ')') {
        if (currentToken) {
          tokens.push(currentToken)
          currentToken = ''
        }
        tokens.push(')')
        parenLevel--
      } else if (char === ',' && parenLevel > 0) {
        if (currentToken) {
          tokens.push(currentToken)
          currentToken = ''
        }
        tokens.push(',')
      } else if (['+', '-', '*', '/', '^', '=', '<', '>', '&'].includes(char) && parenLevel === 0) {
        if (currentToken) {
          tokens.push(currentToken)
          currentToken = ''
        }
        
        // Handle multi-character operators
        if (i < modifiedFormula.length - 1) {
          const nextChar = modifiedFormula[i + 1]
          if (
            (char === '<' && nextChar === '=') ||
            (char === '>' && nextChar === '=') ||
            (char === '<' && nextChar === '>') ||
            (char === '=' && nextChar === '=')
          ) {
            tokens.push(char + nextChar)
            i++
            continue
          }
        }
        
        tokens.push(char)
      } else {
        currentToken += char
      }
    }
    
    if (currentToken) {
      tokens.push(currentToken)
    }
    
    // Replace function placeholders with actual function names
    return tokens.map(token => {
      if (token.startsWith('FUNCTION_')) {
        const index = parseInt(token.substring(9))
        return functions[index]
      }
      return token
    })
  }
  
  /**
   * Parses tokens into a value
   */
  private parseTokens(tokens: string[]): CellValue {
    // If there's only one token, evaluate it
    if (tokens.length === 1) {
      return this.evaluateToken(tokens[0])
    }
    
    // Find the lowest precedence operator
    let lowestPrecedenceIndex = -1
    let lowestPrecedence = Infinity
    let parenLevel = 0
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      
      if (token === '(') {
        parenLevel++
      } else if (token === ')') {
        parenLevel--
      } else if (parenLevel === 0) {
        const precedence = this.getOperatorPrecedence(token)
        
        if (precedence > 0 && precedence <= lowestPrecedence) {
          lowestPrecedenceIndex = i
          lowestPrecedence = precedence
        }
      }
    }
    
    // If no operator was found, check for function calls
    if (lowestPrecedenceIndex === -1) {
      // Check if this is a function call
      if (tokens[0] && tokens[1] === '(' && tokens[tokens.length - 1] === ')') {
        const functionName = tokens[0]
        const args = this.parseArguments(tokens.slice(2, tokens.length - 1))
        return this.evaluateFunction(functionName, args)
      }
      
      // Check if this is a parenthesized expression
      if (tokens[0] === '(' && tokens[tokens.length - 1] === ')') {
        return this.parseTokens(tokens.slice(1, tokens.length - 1))
      }
      
      throw new Error(`Invalid formula: ${tokens.join(' ')}`)
    }
    
    // Split the tokens at the operator
    const leftTokens = tokens.slice(0, lowestPrecedenceIndex)
    const operator = tokens[lowestPrecedenceIndex]
    const rightTokens = tokens.slice(lowestPrecedenceIndex + 1)
    
    // Evaluate the left and right sides
    const left = this.parseTokens(leftTokens)
    const right = this.parseTokens(rightTokens)
    
    // Apply the operator
    return this.applyOperator(left, operator, right)
  }
  
  /**
   * Parses function arguments
   */
  private parseArguments(tokens: string[]): CellValue[] {
    const args: CellValue[] = []
    let currentArg: string[] = []
    let parenLevel = 0
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      
      if (token === '(') {
        parenLevel++
        currentArg.push(token)
      } else if (token === ')') {
        parenLevel--
        currentArg.push(token)
      } else if (token === ',' && parenLevel === 0) {
        if (currentArg.length > 0) {
          args.push(this.parseTokens(currentArg))
          currentArg = []
        } else {
          args.push('')
        }
      } else {
        currentArg.push(token)
      }
    }
    
    if (currentArg.length > 0) {
      args.push(this.parseTokens(currentArg))
    }
    
    return args
  }
  
  /**
   * Evaluates a token
   */
  private evaluateToken(token: string): CellValue {
    // Check if the token is a number
    if (/^-?\d+(\.\d+)?$/.test(token)) {
      return parseFloat(token)
    }
    
    // Check if the token is a string
    if (token.startsWith('"') && token.endsWith('"')) {
      return token.substring(1, token.length - 1)
    }
    
    // Check if the token is a cell reference
    if (/^[A-Z]+\d+$/.test(token)) {
      const { column, row } = parseCellReference(token)
      const cell = this.engine.getCellByPosition(this.sheetIndex, row, column)
      return cell ? cell.displayValue : null
    }
    
    // Check if the token is a range reference
    if (/^[A-Z]+\d+:[A-Z]+\d+$/.test(token)) {
      const { startColumn, startRow, endColumn, endRow } = parseRangeReference(token)
      const range: CellValue[][] = []
      
      for (let row = startRow; row <= endRow; row++) {
        const rowValues: CellValue[] = []
        
        for (let col = startColumn; col <= endColumn; col++) {
          const cell = this.engine.getCellByPosition(this.sheetIndex, row, col)
          rowValues.push(cell ? cell.displayValue : null)
        }
        
        range.push(rowValues)
      }
      
      return range
    }
    
    // Check if the token is a boolean
    if (token.toUpperCase() === 'TRUE') {
      return true
    }
    
    if (token.toUpperCase() === 'FALSE') {
      return false
    }
    
    // If we get here, the token is invalid
    throw new Error(`Invalid token: ${token}`)
  }
  
  /**
   * Gets the precedence of an operator
   */
  private getOperatorPrecedence(token: string): number {
    switch (token) {
      case '=':
      case '<':
      case '>':
      case '<=':
      case '>=':
      case '<>':
      case '==':
        return 1
      case '&':
        return 2
      case '+':
      case '-':
        return 3
      case '*':
      case '/':
        return 4
      case '^':
        return 5
      default:
        return 0
    }
  }
  
  /**
   * Applies an operator to two values
   */
  private applyOperator(left: CellValue, operator: string, right: CellValue): CellValue {
    // Convert values to appropriate types
    const leftValue = this.convertToAppropriateType(left, operator)
    const rightValue = this.convertToAppropriateType(right, operator)
    
    switch (operator) {
      case '+':
        return (leftValue as number) + (rightValue as number)
      case '-':
        return (leftValue as number) - (rightValue as number)
      case '*':
        return (leftValue as number) * (rightValue as number)
      case '/':
        if (rightValue === 0) {
          return '#DIV/0!'
        }
        return (leftValue as number) / (rightValue as number)
      case '^':
        return Math.pow(leftValue as number, rightValue as number)
      case '&':
        return `${leftValue}${rightValue}`
      case '=':
      case '==':
        return leftValue === rightValue
      case '<>':
        return leftValue !== rightValue
      case '<':
        return (leftValue as number) < (rightValue as number)
      case '>':
        return (leftValue as number) > (rightValue as number)
      case '<=':
        return (leftValue as number) <= (rightValue as number)
      case '>=':
        return (leftValue as number) >= (rightValue as number)
      default:
        throw new Error(`Unknown operator: ${operator}`)
    }
  }
  
  /**
   * Converts a value to the appropriate type for an operator
   */
  private convertToAppropriateType(value: CellValue, operator: string): CellValue {
    if (value === null || value === undefined) {
      return operator === '&' ? '' : 0
    }
    
    if (typeof value === 'string') {
      if (operator === '&') {
        return value
      }
      
      const numValue = parseFloat(value)
      return isNaN(numValue) ? 0 : numValue
    }
    
    if (typeof value === 'boolean') {
      return operator === '&' ? (value ? 'TRUE' : 'FALSE') : (value ? 1 : 0)
    }
    
    return value
  }
  
  /**
   * Evaluates a function
   */
  private evaluateFunction(functionName: string, args: CellValue[]): CellValue {
    const upperFunctionName = functionName.toUpperCase()
    
    switch (upperFunctionName) {
      case 'SUM':
        return this.sum(args)
      case 'AVERAGE':
        return this.average(args)
      case 'COUNT':
        return this.count(args)
      case 'MAX':
        return this.max(args)
      case 'MIN':
        return this.min(args)
      case 'IF':
        return this.if(args)
      case 'CONCATENATE':
        return this.concatenate(args)
      case 'LEN':
        return this.len(args)
      case 'ROUND':
        return this.round(args)
      case 'VLOOKUP':
        return this.vlookup(args)
      case 'XLOOKUP':
        return this.xlookup(args)
      case 'INDEX':
        return this.index(args)
      case 'MATCH':
        return this.match(args)
      case 'SUMIF':
        return this.sumif(args)
      case 'COUNTIF':
        return this.countif(args)
      case 'TODAY':
        return this.today()
      case 'NOW':
        return this.now()
      case 'TEXT':
        return this.text(args)
      default:
        throw new Error(`Unknown function: ${functionName}`)
    }
  }
  
  /**
   * Flattens a value or array of values
   */
  private flatten(value: CellValue | CellValue[] | CellValue[][]): CellValue[] {
    if (Array.isArray(value)) {
      return value.flat(2).filter(v => v !== null && v !== undefined) as CellValue[]
    }
    
    return [value]
  }
  
  /**
   * Converts a value to a number
   */
  private toNumber(value: CellValue): number {
    if (value === null || value === undefined) {
      return 0
    }
    
    if (typeof value === 'number') {
      return value
    }
    
    if (typeof value === 'boolean') {
      return value ? 1 : 0
    }
    
    if (typeof value === 'string') {
      const numValue = parseFloat(value)
      return isNaN(numValue) ? 0 : numValue
    }
    
    return 0
  }
  
  /**
   * SUM function
   */
  private sum(args: CellValue[]): number {
    const values = args.flatMap(arg => this.flatten(arg))
    return values.reduce((sum, value) => sum + this.toNumber(value), 0)
  }
  
  /**
   * AVERAGE function
   */
  private average(args: CellValue[]): number {
    const values = args.flatMap(arg => this.flatten(arg))
    const numbers = values.map(value => this.toNumber(value))
    
    if (numbers.length === 0) {
      return 0
    }
    
    return numbers.reduce((sum, value) => sum + value, 0) / numbers.length
  }
  
  /**
   * COUNT function
   */
  private count(args: CellValue[]): number {
    const values = args.flatMap(arg => this.flatten(arg))
    return values.filter(value => value !== null && value !== undefined && value !== '').length
  }
  
  /**
   * MAX function
   */
  private max(args: CellValue[]): number {
    const values = args.flatMap(arg => this.flatten(arg))
    const numbers = values.map(value => this.toNumber(value))
    
    if (numbers.length === 0) {
      return 0
    }
    
    return Math.max(...numbers)
  }
  
  /**
   * MIN function
   */
  private min(args: CellValue[]): number {
    const values = args.flatMap(arg => this.flatten(arg))
    const numbers = values.map(value => this.toNumber(value))
    
    if (numbers.length === 0) {
      return 0
    }
    
    return Math.min(...numbers)
  }
  
  /**
   * IF function
   */
  private if(args: CellValue[]): CellValue {
    if (args.length < 2) {
      throw new Error('IF requires at least 2 arguments')
    }
    
    const condition = args[0]
    const trueValue = args[1]
    const falseValue = args.length > 2 ? args[2] : false
    
    return condition ? trueValue : falseValue
  }
  
  /**
   * CONCATENATE function
   */
  private concatenate(args: CellValue[]): string {
    return args.map(arg => String(arg)).join('')
  }
  
  /**
   * LEN function
   */
  private len(args: CellValue[]): number {
    if (args.length !== 1) {
      throw new Error('LEN requires exactly 1 argument')
    }
    
    return String(args[0]).length
  }
  
  /**
   * ROUND function
   */
  private round(args: CellValue[]): number {
    if (args.length < 1) {
      throw new Error('ROUND requires at least 1 argument')
    }
    
    const value = this.toNumber(args[0])
    const decimals = args.length > 1 ? this.toNumber(args[1]) : 0
    
    const factor = Math.pow(10, decimals)
    return Math.round(value * factor) / factor
  }
  
  /**
   * VLOOKUP function
   */
  private vlookup(args: CellValue[]): CellValue {
    if (args.length < 3) {
      throw new Error('VLOOKUP requires at least 3 arguments')
    }
    
    const lookupValue = args[0]
    const tableArray = args[1] as CellValue[][]
    const colIndex = this.toNumber(args[2])
    const exactMatch = args.length > 3 ? !args[3] : true
    
    if (!Array.isArray(tableArray) || !Array.isArray(tableArray[0])) {
      throw new Error('VLOOKUP requires a table array')
    }
    
    if (colIndex < 1 || colIndex > tableArray[0].length) {
      throw new Error(`Column index out of range: ${colIndex}`)
    }
    
    // Find the row with the lookup value in the first column
    let rowIndex = -1
    
    if (exactMatch) {
      // Exact match
      rowIndex = tableArray.findIndex(row => row[0] === lookupValue)
    } else {
      // Approximate match (find the largest value that is less than or equal to the lookup value)
      let lastValidRowIndex = -1
      
      for (let i = 0; i < tableArray.length; i++) {
        const currentValue = tableArray[i][0]
        
        if (currentValue <= lookupValue) {
          lastValidRowIndex = i
        }
        
        if (currentValue > lookupValue) {
          break
        }
      }
      
      rowIndex = lastValidRowIndex
    }
    
    if (rowIndex === -1) {
      return '#N/A'
    }
    
    return tableArray[rowIndex][colIndex - 1]
  }
  
  /**
   * XLOOKUP function
   */
  private xlookup(args: CellValue[]): CellValue {
    if (args.length < 3) {
      throw new Error('XLOOKUP requires at least 3 arguments')
    }
    
    const lookupValue = args[0]
    const lookupArray = this.flatten(args[1])
    const returnArray = this.flatten(args[2])
    const notFoundValue = args.length > 3 ? args[3] : '#N/A'
    const matchMode = args.length > 4 ? this.toNumber(args[4]) : 0
    const searchMode = args.length > 5 ? this.toNumber(args[5]) : 1
    
    if (lookupArray.length !== returnArray.length) {
      throw new Error('XLOOKUP requires lookup and return arrays of the same length')
    }
    
    // Find the index of the lookup value in the lookup array
    let index = -1
    
    if (matchMode === 0) {
      // Exact match
      index = lookupArray.findIndex(value => value === lookupValue)
    } else if (matchMode === -1) {
      // Exact match or next smaller item
      let lastValidIndex = -1
      
      for (let i = 0; i < lookupArray.length; i++) {
        const currentValue = lookupArray[i]
        
        if (currentValue <= lookupValue) {
          lastValidIndex = i
        }
        
        if (currentValue > lookupValue) {
          break
        }
      }
      
      index = lastValidIndex
    } else if (matchMode === 1) {
      // Exact match or next larger item
      for (let i = 0; i < lookupArray.length; i++) {
        const currentValue = lookupArray[i]
        
        if (currentValue >= lookupValue) {
          index = i
          break
        }
      }
    } else if (matchMode === 2) {
      // Wildcard match
      const pattern = String(lookupValue).replace(/\*/g, '.*').replace(/\?/g, '.')
      const regex = new RegExp(`^${pattern}$`)
      
      index = lookupArray.findIndex(value => regex.test(String(value)))
    }
    
    if (index === -1) {
      return notFoundValue
    }
    
    return returnArray[index]
  }
  
  /**
   * INDEX function
   */
  private index(args: CellValue[]): CellValue {
    if (args.length < 2) {
      throw new Error('INDEX requires at least 2 arguments')
    }
    
    const array = args[0] as CellValue[][] | CellValue[]
    const rowNum = this.toNumber(args[1])
    const colNum = args.length > 2 ? this.toNumber(args[2]) : 1
    
    if (!Array.isArray(array)) {
      throw new Error('INDEX requires an array')
    }
    
    if (rowNum < 1 || colNum < 1) {
      throw new Error(`Invalid row or column number: ${rowNum}, ${colNum}`)
    }
    
    if (Array.isArray(array[0])) {
      // 2D array
      const array2D = array as CellValue[][]
      
      if (rowNum > array2D.length || colNum > array2D[0].length) {
        throw new Error(`Row or column number out of range: ${rowNum}, ${colNum}`)
      }
      
      return array2D[rowNum - 1][colNum - 1]
    } else {
      // 1D array
      const array1D = array as CellValue[]
      
      if (rowNum > array1D.length) {
        throw new Error(`Row number out of range: ${rowNum}`)
      }
      
      return array1D[rowNum - 1]
    }
  }
  
  /**
   * MATCH function
   */
  private match(args: CellValue[]): number {
    if (args.length < 2) {
      throw new Error('MATCH requires at least 2 arguments')
    }
    
    const lookupValue = args[0]
    const lookupArray = this.flatten(args[1])
    const matchType = args.length > 2 ? this.toNumber(args[2]) : 1
    
    if (matchType === 0) {
      // Exact match
      const index = lookupArray.findIndex(value => value === lookupValue)
      
      if (index === -1) {
        return '#N/A'
      }
      
      return index + 1
    } else if (matchType === 1) {
      // Find the largest value that is less than or equal to lookupValue
      let lastValidIndex = -1
      
      for (let i = 0; i < lookupArray.length; i++) {
        const currentValue = lookupArray[i]
        
        if (currentValue <= lookupValue) {
          lastValidIndex = i
        }
        
        if (currentValue > lookupValue) {
          break
        }
      }
      
      if (lastValidIndex === -1) {
        return '#N/A'
      }
      
      return lastValidIndex + 1
    } else if (matchType === -1) {
      // Find the smallest value that is greater than or equal to lookupValue
      for (let i = lookupArray.length - 1; i >= 0; i--) {
        const currentValue = lookupArray[i]
        
        if (currentValue >= lookupValue) {
          return i + 1
        }
      }
      
      return '#N/A'
    }
    
    throw new Error(`Invalid match type: ${matchType}`)
  }
  
  /**
   * SUMIF function
   */
  private sumif(args: CellValue[]): number {
    if (args.length < 2) {
      throw new Error('SUMIF requires at least 2 arguments')
    }
    
    const criteriaRange = this.flatten(args[0])
    const criteria = args[1]
    const sumRange = args.length > 2 ? this.flatten(args[2]) : criteriaRange
    
    if (criteriaRange.length !== sumRange.length) {
      throw new Error('SUMIF requires criteria and sum ranges of the same length')
    }
    
    let sum = 0
    
    for (let i = 0; i < criteriaRange.length; i++) {
      if (this.evaluateCriteria(criteriaRange[i], criteria)) {
        sum += this.toNumber(sumRange[i])
      }
    }
    
    return sum
  }
  
  /**
   * COUNTIF function
   */
  private countif(args: CellValue[]): number {
    if (args.length < 2) {
      throw new Error('COUNTIF requires at least 2 arguments')
    }
    
    const range = this.flatten(args[0])
    const criteria = args[1]
    
    let count = 0
    
    for (let i = 0; i < range.length; i++) {
      if (this.evaluateCriteria(range[i], criteria)) {
        count++
      }
    }
    
    return count
  }
  
  /**
   * Evaluates a criteria against a value
   */
  private evaluateCriteria(value: CellValue, criteria: CellValue): boolean {
    if (criteria === null || criteria === undefined) {
      return value === null || value === undefined
    }
    
    if (typeof criteria === 'string') {
      // Check for comparison operators
      const operators = ['>=', '<=', '<>', '=', '>', '<']
      
      for (const operator of operators) {
        if (criteria.startsWith(operator)) {
          const criteriaValue = criteria.substring(operator.length)
          const numValue = parseFloat(criteriaValue)
          
          if (!isNaN(numValue)) {
            return this.compareValues(value, operator, numValue)
          } else {
            return this.compareValues(value, operator, criteriaValue)
          }
        }
      }
      
      // Check for wildcards
      if (criteria.includes('*') || criteria.includes('?')) {
        const pattern = criteria.replace(/\*/g, '.*').replace(/\?/g, '.')
        const regex = new RegExp(`^${pattern}$`)
        
        return regex.test(String(value))
      }
    }
    
    // Default to equality
    return value === criteria
  }
  
  /**
   * Compares two values using an operator
   */
  private compareValues(left: CellValue, operator: string, right: CellValue): boolean {
    const leftValue = this.toNumber(left)
    const rightValue = this.toNumber(right)
    
    switch (operator) {
      case '=':
        return left === right
      case '<>':
        return left !== right
      case '>':
        return leftValue > rightValue
      case '<':
        return leftValue < rightValue
      case '>=':
        return leftValue >= rightValue
      case '<=':
        return leftValue <= rightValue
      default:
        return false
    }
  }
  
  /**
   * TODAY function
   */
  private today(): string {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }
  
  /**
   * NOW function
   */
  private now(): string {
    return new Date().toISOString()
  }
  
  /**
   * TEXT function
   */
  private text(args: CellValue[]): string {
    if (args.length < 2) {
      throw new Error('TEXT requires at least 2 arguments')
    }
    
    const value = args[0]
    const format = String(args[1])
    
    // This is a simplified implementation of the TEXT function
    // In a real implementation, this would handle various format strings
    
    if (typeof value === 'number') {
      if (format.includes('%')) {
        return `${(value * 100).toFixed(2)}%`
      }
      
      if (format.includes('.')) {
        const decimalPlaces = format.split('.')[1].length
        return value.toFixed(decimalPlaces)
      }
      
      return value.toString()
    }
    
    if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value as string)))) {
      const date = value instanceof Date ? value : new Date(value as string)
      
      if (format.includes('yyyy')) {
        return date.getFullYear().toString()
      }
      
      if (format.includes('mm')) {
        return (date.getMonth() + 1).toString().padStart(2, '0')
      }
      
      if (format.includes('dd')) {
        return date.getDate().toString().padStart(2, '0')
      }
      
      return date.toLocaleDateString()
    }
    
    return String(value)
  }
}

