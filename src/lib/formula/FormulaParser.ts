import { parseCellReference } from '@/lib/utils'

// Token types
export enum TokenType {
  Number,
  String,
  CellReference,
  Function,
  Operator,
  LeftParen,
  RightParen,
  Comma,
  Colon,
  Error
}

// Token interface
export interface Token {
  type: TokenType
  value: string
  position: number
}

// AST node types
export enum NodeType {
  Number,
  String,
  CellReference,
  CellRange,
  FunctionCall,
  BinaryOperation,
  UnaryOperation,
  Error
}

// AST node interface
export interface ASTNode {
  type: NodeType
  value?: any
  children?: ASTNode[]
  functionName?: string
  operator?: string
  cellRef?: { sheet?: string; col: number; row: number }
  rangeStart?: { sheet?: string; col: number; row: number }
  rangeEnd?: { sheet?: string; col: number; row: number }
  error?: string
}

export class FormulaParser {
  private formula: string = ''
  private position: number = 0
  private tokens: Token[] = []
  
  // Parse a formula string into an AST
  parse(formula: string): ASTNode {
    if (!formula.startsWith('=')) {
      return { type: NodeType.Error, error: 'Formula must start with =' }
    }
    
    this.formula = formula.substring(1) // Remove the leading '='
    this.position = 0
    this.tokens = this.tokenize()
    
    return this.parseExpression()
  }
  
  // Tokenize the formula string
  private tokenize(): Token[] {
    const tokens: Token[] = []
    this.position = 0
    
    while (this.position < this.formula.length) {
      const char = this.formula[this.position]
      
      // Skip whitespace
      if (/\s/.test(char)) {
        this.position++
        continue
      }
      
      // Numbers
      if (/[0-9]/.test(char)) {
        const start = this.position
        let value = ''
        
        // Parse the number
        while (
          this.position < this.formula.length && 
          (/[0-9.]/.test(this.formula[this.position]))
        ) {
          value += this.formula[this.position]
          this.position++
        }
        
        tokens.push({ type: TokenType.Number, value, position: start })
        continue
      }
      
      // Strings (enclosed in double quotes)
      if (char === '"') {
        const start = this.position
        let value = ''
        this.position++ // Skip the opening quote
        
        // Parse the string
        while (
          this.position < this.formula.length && 
          this.formula[this.position] !== '"'
        ) {
          value += this.formula[this.position]
          this.position++
        }
        
        if (this.position < this.formula.length) {
          this.position++ // Skip the closing quote
        }
        
        tokens.push({ type: TokenType.String, value, position: start })
        continue
      }
      
      // Cell references and function names
      if (/[A-Za-z]/.test(char)) {
        const start = this.position
        let value = ''
        
        // Parse the identifier
        while (
          this.position < this.formula.length && 
          /[A-Za-z0-9_]/.test(this.formula[this.position])
        ) {
          value += this.formula[this.position]
          this.position++
        }
        
        // Check if it's a cell reference (e.g., A1, B2)
        if (/^[A-Za-z]+[0-9]+$/.test(value)) {
          tokens.push({ type: TokenType.CellReference, value, position: start })
        } else {
          // It's a function name
          tokens.push({ type: TokenType.Function, value, position: start })
        }
        
        continue
      }
      
      // Operators
      if (/[+\-*\/^%=<>]/.test(char)) {
        const start = this.position
        let value = char
        this.position++
        
        // Handle multi-character operators (e.g., <=, >=, <>)
        if (this.position < this.formula.length) {
          const nextChar = this.formula[this.position]
          if (
            (char === '<' && (nextChar === '=' || nextChar === '>')) ||
            (char === '>' && nextChar === '=')
          ) {
            value += nextChar
            this.position++
          }
        }
        
        tokens.push({ type: TokenType.Operator, value, position: start })
        continue
      }
      
      // Parentheses
      if (char === '(') {
        tokens.push({ type: TokenType.LeftParen, value: '(', position: this.position })
        this.position++
        continue
      }
      
      if (char === ')') {
        tokens.push({ type: TokenType.RightParen, value: ')', position: this.position })
        this.position++
        continue
      }
      
      // Comma
      if (char === ',') {
        tokens.push({ type: TokenType.Comma, value: ',', position: this.position })
        this.position++
        continue
      }
      
      // Colon (for ranges)
      if (char === ':') {
        tokens.push({ type: TokenType.Colon, value: ':', position: this.position })
        this.position++
        continue
      }
      
      // Unknown character
      tokens.push({ type: TokenType.Error, value: char, position: this.position })
      this.position++
    }
    
    return tokens
  }
  
  // Parse an expression
  private parseExpression(): ASTNode {
    // This is a simplified parser that doesn't handle operator precedence
    // In a real implementation, this would be more complex
    
    // For now, just return a placeholder node
    return { type: NodeType.Error, error: 'Formula parsing not fully implemented' }
  }
  
  // Evaluate an AST node
  evaluate(node: ASTNode, getCellValue: (ref: string) => any): any {
    switch (node.type) {
      case NodeType.Number:
        return parseFloat(node.value)
        
      case NodeType.String:
        return node.value
        
      case NodeType.CellReference:
        if (node.cellRef) {
          const { col, row } = node.cellRef
          const cellRef = `${String.fromCharCode(65 + col)}${row + 1}`
          return getCellValue(cellRef)
        }
        return null
        
      case NodeType.BinaryOperation:
        if (node.children && node.children.length === 2) {
          const left = this.evaluate(node.children[0], getCellValue)
          const right = this.evaluate(node.children[1], getCellValue)
          
          switch (node.operator) {
            case '+': return left + right
            case '-': return left - right
            case '*': return left * right
            case '/': return left / right
            case '^': return Math.pow(left, right)
            case '%': return left % right
            case '=': return left === right
            case '<>': return left !== right
            case '<': return left < right
            case '<=': return left <= right
            case '>': return left > right
            case '>=': return left >= right
            default: return null
          }
        }
        return null
        
      case NodeType.FunctionCall:
        if (node.children && node.functionName) {
          const args = node.children.map(child => this.evaluate(child, getCellValue))
          
          // Implement function evaluation here
          // This would include all the required Excel functions
          
          return null
        }
        return null
        
      case NodeType.Error:
        return `#ERROR: ${node.error}`
        
      default:
        return null
    }
  }
}

