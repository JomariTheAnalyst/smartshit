'use client'

import { openDB, IDBPDatabase } from 'idb'
import { IWorkbook } from '@/types/spreadsheet'

// Database name and version
const DB_NAME = 'smartsheet_ai_db'
const DB_VERSION = 1

// Object store names
const WORKBOOKS_STORE = 'workbooks'
const VERSIONS_STORE = 'versions'

// IndexedDB Storage class
export class IndexedDBStorage {
  private db: Promise<IDBPDatabase>
  
  constructor() {
    this.db = this.initDB()
  }
  
  // Initialize the database
  private async initDB(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create workbooks store
        if (!db.objectStoreNames.contains(WORKBOOKS_STORE)) {
          const workbooksStore = db.createObjectStore(WORKBOOKS_STORE, { keyPath: 'id' })
          workbooksStore.createIndex('name', 'name', { unique: false })
          workbooksStore.createIndex('lastModified', 'lastModified', { unique: false })
        }
        
        // Create versions store
        if (!db.objectStoreNames.contains(VERSIONS_STORE)) {
          const versionsStore = db.createObjectStore(VERSIONS_STORE, { keyPath: 'id' })
          versionsStore.createIndex('workbookId', 'workbookId', { unique: false })
          versionsStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }
  
  // Save a workbook
  async saveWorkbook(workbook: IWorkbook): Promise<string> {
    const db = await this.db
    
    // Add lastModified timestamp
    const workbookToSave = {
      ...workbook,
      lastModified: new Date().toISOString()
    }
    
    // Save the workbook
    await db.put(WORKBOOKS_STORE, workbookToSave)
    
    // Save a version
    await this.saveVersion(workbook)
    
    return workbook.id
  }
  
  // Get a workbook by ID
  async getWorkbook(id: string): Promise<IWorkbook | null> {
    const db = await this.db
    return db.get(WORKBOOKS_STORE, id)
  }
  
  // Get all workbooks
  async getAllWorkbooks(): Promise<IWorkbook[]> {
    const db = await this.db
    return db.getAll(WORKBOOKS_STORE)
  }
  
  // Delete a workbook
  async deleteWorkbook(id: string): Promise<void> {
    const db = await this.db
    
    // Delete the workbook
    await db.delete(WORKBOOKS_STORE, id)
    
    // Delete all versions of the workbook
    const tx = db.transaction(VERSIONS_STORE, 'readwrite')
    const index = tx.store.index('workbookId')
    let cursor = await index.openCursor(IDBKeyRange.only(id))
    
    while (cursor) {
      await cursor.delete()
      cursor = await cursor.continue()
    }
    
    await tx.done
  }
  
  // Save a version of a workbook
  async saveVersion(workbook: IWorkbook): Promise<string> {
    const db = await this.db
    
    // Create a version object
    const version = {
      id: `${workbook.id}_${Date.now()}`,
      workbookId: workbook.id,
      timestamp: new Date().toISOString(),
      data: JSON.stringify(workbook)
    }
    
    // Save the version
    await db.put(VERSIONS_STORE, version)
    
    return version.id
  }
  
  // Get all versions of a workbook
  async getWorkbookVersions(workbookId: string): Promise<Array<{ id: string; timestamp: string }>> {
    const db = await this.db
    const tx = db.transaction(VERSIONS_STORE, 'readonly')
    const index = tx.store.index('workbookId')
    const versions = await index.getAll(IDBKeyRange.only(workbookId))
    
    return versions.map(version => ({
      id: version.id,
      timestamp: version.timestamp
    }))
  }
  
  // Get a specific version of a workbook
  async getWorkbookVersion(versionId: string): Promise<IWorkbook | null> {
    const db = await this.db
    const version = await db.get(VERSIONS_STORE, versionId)
    
    if (!version) {
      return null
    }
    
    return JSON.parse(version.data)
  }
  
  // Restore a workbook to a specific version
  async restoreWorkbookVersion(versionId: string): Promise<IWorkbook | null> {
    const workbook = await this.getWorkbookVersion(versionId)
    
    if (!workbook) {
      return null
    }
    
    // Save the restored workbook
    await this.saveWorkbook(workbook)
    
    return workbook
  }
}

