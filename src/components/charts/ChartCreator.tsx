'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ChartOptions } from '@/types/spreadsheet'
import Chart from './Chart'

interface ChartCreatorProps {
  isOpen: boolean
  onClose: () => void
  onCreateChart: (options: ChartOptions) => void
  data: any[][]
  selection: { startRow: number; startCol: number; endRow: number; endCol: number } | null
}

export default function ChartCreator({
  isOpen,
  onClose,
  onCreateChart,
  data,
  selection
}: ChartCreatorProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar')
  const [title, setTitle] = useState('')
  const [headerRow, setHeaderRow] = useState(true)
  const [headerColumn, setHeaderColumn] = useState(false)
  const [xAxisTitle, setXAxisTitle] = useState('')
  const [yAxisTitle, setYAxisTitle] = useState('')
  const [legendPosition, setLegendPosition] = useState<'top' | 'right' | 'bottom' | 'left'>('top')
  
  // Preview data
  const previewData = selection && data.length > 0
    ? data.slice(selection.startRow, selection.endRow + 1).map(row => 
        row.slice(selection.startCol, selection.endCol + 1)
      )
    : [
        ['Category', 'Value 1', 'Value 2'],
        ['A', 10, 20],
        ['B', 30, 40],
        ['C', 50, 60]
      ]
  
  const handleCreateChart = () => {
    const options: ChartOptions = {
      type: chartType,
      title,
      dataRange: selection 
        ? `${String.fromCharCode(65 + selection.startCol)}${selection.startRow + 1}:${String.fromCharCode(65 + selection.endCol)}${selection.endRow + 1}`
        : '',
      headerRow,
      headerColumn,
      xAxisTitle,
      yAxisTitle,
      legendPosition
    }
    
    onCreateChart(options)
    onClose()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Chart</DialogTitle>
          <DialogDescription>
            Configure your chart options and preview the result.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Chart Type</label>
              <select
                className="w-full mt-1 border rounded p-2"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="scatter">Scatter Chart</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Chart title"
              />
            </div>
            
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="headerRow"
                  checked={headerRow}
                  onChange={(e) => setHeaderRow(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="headerRow" className="text-sm">Header Row</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="headerColumn"
                  checked={headerColumn}
                  onChange={(e) => setHeaderColumn(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="headerColumn" className="text-sm">Header Column</label>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">X-Axis Title</label>
              <Input
                value={xAxisTitle}
                onChange={(e) => setXAxisTitle(e.target.value)}
                placeholder="X-Axis title"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Y-Axis Title</label>
              <Input
                value={yAxisTitle}
                onChange={(e) => setYAxisTitle(e.target.value)}
                placeholder="Y-Axis title"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Legend Position</label>
              <select
                className="w-full mt-1 border rounded p-2"
                value={legendPosition}
                onChange={(e) => setLegendPosition(e.target.value as any)}
              >
                <option value="top">Top</option>
                <option value="right">Right</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
              </select>
            </div>
          </div>
          
          <div className="border rounded p-2">
            <h3 className="text-sm font-medium mb-2">Preview</h3>
            <Chart
              id="preview-chart"
              options={{
                type: chartType,
                title,
                dataRange: '',
                headerRow,
                headerColumn,
                xAxisTitle,
                yAxisTitle,
                legendPosition
              }}
              data={previewData}
              width={250}
              height={200}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateChart}>
            Create Chart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

