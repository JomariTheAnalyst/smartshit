'use client'

import { useState, useCallback } from 'react'
import { IWorkbook } from '@/types/spreadsheet'
import { importWorkbook } from '@/lib/io/xlsx'

// File import hook
export function useFileImport() {
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Import a file
  const importFile = useCallback(async (
    file: File,
    onSuccess?: (workbook: IWorkbook) => void
  ) => {
    try {
      setIsImporting(true)
      setError(null)
      
      // Check if the file is an Excel file
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        throw new Error('Only Excel files (.xlsx, .xls) are supported.')
      }
      
      // Import the workbook
      const workbook = await importWorkbook(file)
      
      // Call the success callback
      onSuccess?.(workbook)
      
      return workbook
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      throw error
    } finally {
      setIsImporting(false)
    }
  }, [])
  
  // Handle file input change
  const handleFileInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess?: (workbook: IWorkbook) => void
  ) => {
    const file = e.target.files?.[0]
    
    if (file) {
      importFile(file, onSuccess)
    }
  }, [importFile])
  
  return {
    isImporting,
    error,
    importFile,
    handleFileInputChange
  }
}

