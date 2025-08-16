'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardNavigationProps {
  onMoveUp: () => void
  onMoveDown: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
  onEnter: () => void
  onTab: () => void
  onEscape: () => void
  onDelete: () => void
  onSelectAll: () => void
  isEditing: boolean
}

// Keyboard navigation hook
export function useKeyboardNavigation({
  onMoveUp,
  onMoveDown,
  onMoveLeft,
  onMoveRight,
  onEnter,
  onTab,
  onEscape,
  onDelete,
  onSelectAll,
  isEditing
}: KeyboardNavigationProps) {
  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if we're editing a cell
    if (isEditing) return
    
    // Skip if we're in an input, textarea, or contenteditable element
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.getAttribute('contenteditable') === 'true'
    ) {
      return
    }
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        onMoveUp()
        break
        
      case 'ArrowDown':
        e.preventDefault()
        onMoveDown()
        break
        
      case 'ArrowLeft':
        e.preventDefault()
        onMoveLeft()
        break
        
      case 'ArrowRight':
        e.preventDefault()
        onMoveRight()
        break
        
      case 'Enter':
        e.preventDefault()
        onEnter()
        break
        
      case 'Tab':
        e.preventDefault()
        onTab()
        break
        
      case 'Escape':
        e.preventDefault()
        onEscape()
        break
        
      case 'Delete':
      case 'Backspace':
        e.preventDefault()
        onDelete()
        break
        
      case 'a':
        if (e.ctrlKey) {
          e.preventDefault()
          onSelectAll()
        }
        break
    }
  }, [
    isEditing,
    onMoveUp,
    onMoveDown,
    onMoveLeft,
    onMoveRight,
    onEnter,
    onTab,
    onEscape,
    onDelete,
    onSelectAll
  ])
  
  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

