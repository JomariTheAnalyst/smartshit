'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import FormatToolbar from './FormatToolbar'
import { CellFormat } from '@/types/spreadsheet'
import { 
  Save, 
  Upload, 
  Download, 
  Undo2, 
  Redo2, 
  Copy, 
  Scissors, 
  Clipboard, 
  Table, 
  ChartBar, 
  Function, 
  Wand2,
  Moon,
  Sun
} from 'lucide-react'

interface RibbonToolbarProps {
  onSave: () => void
  onImport: () => void
  onExport: () => void
  onUndo: () => void
  onRedo: () => void
  onAIAssistant: () => void
  canUndo: boolean
  canRedo: boolean
  onFormatChange?: (format: Partial<CellFormat>) => void
  currentFormat?: Partial<CellFormat>
  onCreateChart?: () => void
  onToggleTheme?: () => void
  theme?: 'light' | 'dark'
}

export default function RibbonToolbar({
  onSave,
  onImport,
  onExport,
  onUndo,
  onRedo,
  onAIAssistant,
  canUndo,
  canRedo,
  onFormatChange,
  currentFormat = {},
  onCreateChart,
  onToggleTheme,
  theme = 'light'
}: RibbonToolbarProps) {
  const [activeTab, setActiveTab] = useState('home')
  
  return (
    <div className="ribbon-toolbar border-b">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="insert">Insert</TabsTrigger>
          <TabsTrigger value="page-layout">Page Layout</TabsTrigger>
          <TabsTrigger value="formulas">Formulas</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <div className="p-1">
          {activeTab === 'home' && (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" onClick={onSave}>
                  <Save className="h-4 w-4 mr-1" />
                  <span className="text-xs">Save</span>
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex">
                  <Button variant="ghost" size="sm" onClick={onImport}>
                    <Upload className="h-4 w-4 mr-1" />
                    <span className="text-xs">Import</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={onExport}>
                    <Download className="h-4 w-4 mr-1" />
                    <span className="text-xs">Export</span>
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex">
                  <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo}>
                    <Undo2 className="h-4 w-4 mr-1" />
                    <span className="text-xs">Undo</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={onRedo} disabled={!canRedo}>
                    <Redo2 className="h-4 w-4 mr-1" />
                    <span className="text-xs">Redo</span>
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex">
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4 mr-1" />
                    <span className="text-xs">Copy</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <Scissors className="h-4 w-4 mr-1" />
                    <span className="text-xs">Cut</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <Clipboard className="h-4 w-4 mr-1" />
                    <span className="text-xs">Paste</span>
                  </Button>
                </div>
              </div>
              
              <div className="h-10 border-l border-gray-300 mx-1"></div>
              
              {onFormatChange && (
                <FormatToolbar 
                  onFormatChange={onFormatChange} 
                  currentFormat={currentFormat} 
                />
              )}
              
              <div className="h-10 border-l border-gray-300 mx-1"></div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" onClick={onAIAssistant}>
                  <Wand2 className="h-4 w-4 mr-1" />
                  <span className="text-xs">AI Assistant</span>
                </Button>
              </div>
              
              {onToggleTheme && (
                <div className="flex flex-col items-center">
                  <Button variant="ghost" size="sm" onClick={onToggleTheme}>
                    {theme === 'light' ? (
                      <>
                        <Moon className="h-4 w-4 mr-1" />
                        <span className="text-xs">Dark Mode</span>
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4 mr-1" />
                        <span className="text-xs">Light Mode</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'insert' && (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <Table className="h-4 w-4 mr-1" />
                  <span className="text-xs">Table</span>
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" onClick={onCreateChart}>
                  <ChartBar className="h-4 w-4 mr-1" />
                  <span className="text-xs">Chart</span>
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === 'formulas' && (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <Function className="h-4 w-4 mr-1" />
                  <span className="text-xs">Insert Function</span>
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">SUM</span>
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">AVERAGE</span>
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">COUNT</span>
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">MAX</span>
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">MIN</span>
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">IF</span>
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">VLOOKUP</span>
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">XLOOKUP</span>
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === 'data' && (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">Sort</span>
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">Filter</span>
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">Data Validation</span>
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">Remove Duplicates</span>
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === 'view' && (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">Freeze Panes</span>
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">Hide Gridlines</span>
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm">
                  <span className="text-xs">Hide Headers</span>
                </Button>
              </div>
              
              {onToggleTheme && (
                <div className="flex flex-col items-center">
                  <Button variant="ghost" size="sm" onClick={onToggleTheme}>
                    {theme === 'light' ? (
                      <>
                        <Moon className="h-4 w-4 mr-1" />
                        <span className="text-xs">Dark Mode</span>
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4 mr-1" />
                        <span className="text-xs">Light Mode</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" onClick={onAIAssistant}>
                  <Wand2 className="h-4 w-4 mr-1" />
                  <span className="text-xs">AI Settings</span>
                </Button>
              </div>
              
              {onToggleTheme && (
                <div className="flex flex-col items-center">
                  <Button variant="ghost" size="sm" onClick={onToggleTheme}>
                    {theme === 'light' ? (
                      <>
                        <Moon className="h-4 w-4 mr-1" />
                        <span className="text-xs">Dark Mode</span>
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4 mr-1" />
                        <span className="text-xs">Light Mode</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}

