'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { IWorkbook } from '@/types/spreadsheet'
import { IndexedDBStorage } from '@/lib/storage/IndexedDBStorage'

interface AutosaveOptions {
  interval?: number
  onSave?: (workbookId: string) => void
  onError?: (error: Error) => void
}

// Autosave hook
export function useAutosave(
  workbook: IWorkbook,
  options: AutosaveOptions = {}
) {
  const {
    interval = 30000, // Default to 30 seconds
    onSave,
    onError
  } = options
  
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const storageRef = useRef<IndexedDBStorage | null>(null)
  const workbookRef = useRef(workbook)
  
  // Update the workbook ref when the workbook changes
  useEffect(() => {
    workbookRef.current = workbook
  }, [workbook])
  
  // Initialize the storage
  useEffect(() => {
    storageRef.current = new IndexedDBStorage()
  }, [])
  
  // Save the workbook
  const saveWorkbook = useCallback(async () => {
    if (!storageRef.current) return
    
    try {
      setIsSaving(true)
      setError(null)
      
      const workbookId = await storageRef.current.saveWorkbook(workbookRef.current)
      
      setLastSaved(new Date())
      onSave?.(workbookId)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error)
    } finally {
      setIsSaving(false)
    }
  }, [onSave, onError])
  
  // Set up autosave
  useEffect(() => {
    const intervalId = setInterval(() => {
      saveWorkbook()
    }, interval)
    
    return () => {
      clearInterval(intervalId)
    }
  }, [interval, saveWorkbook])
  
  return {
    lastSaved,
    isSaving,
    error,
    saveNow: saveWorkbook
  }
}

