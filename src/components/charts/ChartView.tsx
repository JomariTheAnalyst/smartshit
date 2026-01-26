'use client'

import { useState, useRef } from 'react'
import { Chart as ChartType } from '@/types/spreadsheet'
import Chart from './Chart'
import { X, Move } from 'lucide-react'

interface ChartViewProps {
  chart: ChartType
  data: any[][]
  onRemove: (chartId: string) => void
  onPositionChange: (chartId: string, position: { top: number; left: number }) => void
  onResize: (chartId: string, size: { width: number; height: number }) => void
}

export default function ChartView({
  chart,
  data,
  onRemove,
  onPositionChange,
  onResize
}: ChartViewProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const chartRef = useRef<HTMLDivElement>(null)
  
  // Extract data for the chart based on the dataRange
  const chartData = extractChartData(data, chart.options.dataRange)
  
  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!chartRef.current) return
    
    const rect = chartRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    
    setIsDragging(true)
  }
  
  // Handle drag move
  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    const newLeft = e.clientX - dragOffset.x
    const newTop = e.clientY - dragOffset.y
    
    onPositionChange(chart.id, {
      top: newTop,
      left: newLeft
    })
  }
  
  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false)
  }
  
  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
  }
  
  // Handle resize move
  const handleResizeMove = (e: React.MouseEvent) => {
    if (!isResizing || !chartRef.current) return
    
    const rect = chartRef.current.getBoundingClientRect()
    const newWidth = e.clientX - rect.left
    const newHeight = e.clientY - rect.top
    
    if (newWidth > 100 && newHeight > 100) {
      onResize(chart.id, {
        width: newWidth,
        height: newHeight
      })
    }
  }
  
  // Handle resize end
  const handleResizeEnd = () => {
    setIsResizing(false)
  }
  
  // Add event listeners for drag and resize
  useState(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleDragMove(e as any)
      }
      
      if (isResizing) {
        handleResizeMove(e as any)
      }
    }
    
    const handleMouseUp = () => {
      handleDragEnd()
      handleResizeEnd()
    }
    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing])
  
  return (
    <div
      ref={chartRef}
      className="chart-view absolute border rounded shadow-md bg-white"
      style={{
        top: chart.position.top,
        left: chart.position.left,
        width: chart.position.width,
        height: chart.position.height,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <div className="chart-header flex items-center justify-between p-2 border-b">
        <div
          className="drag-handle flex items-center cursor-grab"
          onMouseDown={handleDragStart}
        >
          <Move className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">{chart.options.title || 'Chart'}</span>
        </div>
        
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => onRemove(chart.id)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="chart-content p-2">
        <Chart
          id={`chart-${chart.id}`}
          options={chart.options}
          data={chartData}
          width={chart.position.width - 20}
          height={chart.position.height - 60}
        />
      </div>
      
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          backgroundPosition: 'right bottom'
        }}
        onMouseDown={handleResizeStart}
      ></div>
    </div>
  )
}

// Helper function to extract data from a range
function extractChartData(data: any[][], dataRange: string): any[][] {
  if (!dataRange || !data.length) {
    return [
      ['Category', 'Value 1', 'Value 2'],
      ['A', 10, 20],
      ['B', 30, 40],
      ['C', 50, 60]
    ]
  }
  
  // Parse the range (e.g., "A1:C3")
  const [start, end] = dataRange.split(':')
  
  const startCol = start.charCodeAt(0) - 65 // 'A' is 65 in ASCII
  const startRow = parseInt(start.substring(1)) - 1
  
  const endCol = end.charCodeAt(0) - 65
  const endRow = parseInt(end.substring(1)) - 1
  
  // Extract the data
  const extractedData = []
  
  for (let row = startRow; row <= endRow; row++) {
    if (row >= data.length) break
    
    const rowData = []
    
    for (let col = startCol; col <= endCol; col++) {
      if (col >= data[row].length) {
        rowData.push(null)
      } else {
        rowData.push(data[row][col])
      }
    }
    
    extractedData.push(rowData)
  }
  
  return extractedData
}

