'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Save,
  FileUp,
  FileDown,
  Plus,
  Trash,
  Copy,
  Clipboard,
  Scissors,
  Undo,
  Redo,
  BarChart,
  LineChart,
  PieChart,
  Table,
  Wand2
} from 'lucide-react'

interface RibbonToolbarProps {
  onSave: () => void
  onImport: () => void
  onExport: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onAIAssistant: () => void
}

export default function RibbonToolbar({
  onSave,
  onImport,
  onExport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onAIAssistant
}: RibbonToolbarProps) {
  const [activeTab, setActiveTab] = useState('home')
  
  return (
    <div className="ribbon-toolbar border-b">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-background border-b">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="insert">Insert</TabsTrigger>
          <TabsTrigger value="formulas">Formulas</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>
        
        <TabsContent value="home" className="p-2 flex flex-wrap gap-2 items-center">
          <div className="flex flex-col items-center px-2 border-r">
            <Button variant="ghost" size="sm" onClick={onSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
          
          <div className="flex flex-col items-center px-2 border-r">
            <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo}>
              <Undo className="h-4 w-4 mr-1" />
              Undo
            </Button>
            <Button variant="ghost" size="sm" onClick={onRedo} disabled={!canRedo}>
              <Redo className="h-4 w-4 mr-1" />
              Redo
            </Button>
          </div>
          
          <div className="flex flex-col items-center px-2 border-r">
            <div className="flex">
              <Button variant="ghost" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Clipboard className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Scissors className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-xs">Clipboard</span>
          </div>
          
          <div className="flex flex-col items-center px-2 border-r">
            <div className="flex">
              <Button variant="ghost" size="sm">
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Underline className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-xs">Font</span>
          </div>
          
          <div className="flex flex-col items-center px-2 border-r">
            <div className="flex">
              <Button variant="ghost" size="sm">
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <AlignJustify className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-xs">Alignment</span>
          </div>
          
          <div className="flex flex-col items-center px-2">
            <Button variant="ghost" size="sm" onClick={onImport}>
              <FileUp className="h-4 w-4 mr-1" />
              Import
            </Button>
            <Button variant="ghost" size="sm" onClick={onExport}>
              <FileDown className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="insert" className="p-2 flex flex-wrap gap-2 items-center">
          <div className="flex flex-col items-center px-2 border-r">
            <div className="flex">
              <Button variant="ghost" size="sm">
                <Table className="h-4 w-4 mr-1" />
                Table
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col items-center px-2 border-r">
            <div className="flex">
              <Button variant="ghost" size="sm">
                <BarChart className="h-4 w-4 mr-1" />
                Bar
              </Button>
              <Button variant="ghost" size="sm">
                <LineChart className="h-4 w-4 mr-1" />
                Line
              </Button>
              <Button variant="ghost" size="sm">
                <PieChart className="h-4 w-4 mr-1" />
                Pie
              </Button>
            </div>
            <span className="text-xs">Charts</span>
          </div>
        </TabsContent>
        
        <TabsContent value="formulas" className="p-2 flex flex-wrap gap-2 items-center">
          <div className="flex flex-col items-center px-2 border-r">
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Insert Function
            </Button>
          </div>
          
          <div className="flex flex-col items-center px-2">
            <div className="flex gap-1">
              <Button variant="ghost" size="sm">SUM</Button>
              <Button variant="ghost" size="sm">AVERAGE</Button>
              <Button variant="ghost" size="sm">COUNT</Button>
              <Button variant="ghost" size="sm">MAX</Button>
              <Button variant="ghost" size="sm">MIN</Button>
            </div>
            <span className="text-xs">Common Functions</span>
          </div>
        </TabsContent>
        
        <TabsContent value="data" className="p-2 flex flex-wrap gap-2 items-center">
          <div className="flex flex-col items-center px-2 border-r">
            <Button variant="ghost" size="sm">
              <Trash className="h-4 w-4 mr-1" />
              Remove Duplicates
            </Button>
          </div>
          
          <div className="flex flex-col items-center px-2">
            <Button variant="ghost" size="sm">
              Data Validation
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="view" className="p-2 flex flex-wrap gap-2 items-center">
          <div className="flex flex-col items-center px-2">
            <Button variant="ghost" size="sm">
              Freeze Panes
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="ai" className="p-2 flex flex-wrap gap-2 items-center">
          <div className="flex flex-col items-center px-2">
            <Button onClick={onAIAssistant}>
              <Wand2 className="h-4 w-4 mr-1" />
              Open AI Assistant
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

