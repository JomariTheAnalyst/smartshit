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
  Moon,
  Sun,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Type,
  PaintBucket,
  Lock,
  Settings
} from 'lucide-react'

interface RibbonToolbarProps {
  onSave: () => void
  onImport: () => void
  onExport: () => void
  onUndo: () => void
  onRedo: () => void
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
      <div className="flex items-center justify-between px-2 py-1 bg-gray-100 dark:bg-gray-800 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto">
            Open this file
          </Button>
          <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto">
            New File
          </Button>
          <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto" onClick={onExport}>
            Export File
          </Button>
          <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto">
            Settings
          </Button>
          <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto">
            <Lock className="h-3 w-3 mr-1" />
            Security
          </Button>
        </div>
        <div>
          <span className="text-sm text-gray-600">empty-sheet.xlsx</span>
        </div>
        <div>
          <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto">
            Shortcut Files
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-gray-900 border-b">
          <TabsTrigger value="home" className="text-xs">HOME</TabsTrigger>
          <TabsTrigger value="insert" className="text-xs">INSERT</TabsTrigger>
          <TabsTrigger value="page-layout" className="text-xs">PAGE LAYOUT</TabsTrigger>
          <TabsTrigger value="formulas" className="text-xs">FORMULAS</TabsTrigger>
          <TabsTrigger value="data" className="text-xs">DATA</TabsTrigger>
          <TabsTrigger value="view" className="text-xs">VIEW</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">SETTINGS</TabsTrigger>
        </TabsList>
        
        <div className="p-1 bg-white dark:bg-gray-900">
          {activeTab === 'home' && (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center border-r pr-4">
                <div className="text-xs text-gray-500 mb-1">System Helvetica</div>
                <div className="flex items-center space-x-1">
                  <select className="text-xs border rounded px-1 py-0.5">
                    <option>12</option>
                    <option>14</option>
                    <option>16</option>
                  </select>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <Underline className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-1">Fonts</div>
              </div>
              
              <div className="flex flex-col items-center border-r pr-4">
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-1">Alignment</div>
              </div>
              
              <div className="flex flex-col items-center border-r pr-4">
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <Type className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <PaintBucket className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-1">Numbers</div>
              </div>
              
              <div className="flex flex-col items-center border-r pr-4">
                <div className="flex">
                  <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={onUndo} disabled={!canUndo}>
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={onRedo} disabled={!canRedo}>
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-1">Editing</div>
              </div>
              
              <div className="flex flex-col items-center border-r pr-4">
                <div className="flex">
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <Copy className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <Scissors className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-1">Clipboard</div>
              </div>
              
              {onFormatChange && (
                <div className="flex flex-col items-center border-r pr-4">
                  <FormatToolbar 
                    onFormatChange={onFormatChange} 
                    currentFormat={currentFormat} 
                  />
                  <div className="text-xs text-gray-500 mt-1">Styles</div>
                </div>
              )}
              
              {onToggleTheme && (
                <div className="flex flex-col items-center">
                  <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={onToggleTheme}>
                    {theme === 'light' ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="text-xs text-gray-500 mt-1">Theme</div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'insert' && (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <Table className="h-4 w-4" />
                </Button>
                <div className="text-xs text-gray-500 mt-1">Table</div>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={onCreateChart}>
                  <ChartBar className="h-4 w-4" />
                </Button>
                <div className="text-xs text-gray-500 mt-1">Chart</div>
              </div>
            </div>
          )}
          
          {activeTab === 'formulas' && (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <Function className="h-4 w-4" />
                </Button>
                <div className="text-xs text-gray-500 mt-1">Insert Function</div>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <span className="text-xs">SUM</span>
                </Button>
                <div className="text-xs text-gray-500 mt-1">AutoSum</div>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <span className="text-xs">AVERAGE</span>
                </Button>
                <div className="text-xs text-gray-500 mt-1">Statistical</div>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <span className="text-xs">IF</span>
                </Button>
                <div className="text-xs text-gray-500 mt-1">Logical</div>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <span className="text-xs">VLOOKUP</span>
                </Button>
                <div className="text-xs text-gray-500 mt-1">Lookup</div>
              </div>
            </div>
          )}
          
          {activeTab === 'data' && (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <span className="text-xs">Sort</span>
                </Button>
                <div className="text-xs text-gray-500 mt-1">Sort & Filter</div>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <span className="text-xs">Filter</span>
                </Button>
                <div className="text-xs text-gray-500 mt-1">Sort & Filter</div>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <span className="text-xs">Data Validation</span>
                </Button>
                <div className="text-xs text-gray-500 mt-1">Data Tools</div>
              </div>
            </div>
          )}
          
          {activeTab === 'view' && (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <span className="text-xs">Freeze Panes</span>
                </Button>
                <div className="text-xs text-gray-500 mt-1">Window</div>
              </div>
              
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <span className="text-xs">Hide Gridlines</span>
                </Button>
                <div className="text-xs text-gray-500 mt-1">Show</div>
              </div>
              
              {onToggleTheme && (
                <div className="flex flex-col items-center">
                  <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={onToggleTheme}>
                    {theme === 'light' ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="text-xs text-gray-500 mt-1">Theme</div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <Settings className="h-4 w-4" />
                </Button>
                <div className="text-xs text-gray-500 mt-1">Settings</div>
              </div>
              
              {onToggleTheme && (
                <div className="flex flex-col items-center">
                  <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={onToggleTheme}>
                    {theme === 'light' ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="text-xs text-gray-500 mt-1">Theme</div>
                </div>
              )}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}

