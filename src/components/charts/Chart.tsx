'use client'

import { useEffect, useRef } from 'react'
import { Chart as ChartJS, registerables } from 'chart.js'
import { ChartOptions } from '@/types/spreadsheet'

// Register all Chart.js components
ChartJS.register(...registerables)

interface ChartProps {
  id: string
  options: ChartOptions
  data: any[][]
  width?: number
  height?: number
}

export default function Chart({ id, options, data, width = 400, height = 300 }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<ChartJS | null>(null)
  
  useEffect(() => {
    if (!canvasRef.current) return
    
    // Destroy previous chart instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }
    
    // Process the data
    const hasHeaderRow = options.headerRow ?? true
    const hasHeaderColumn = options.headerColumn ?? false
    
    let labels: string[] = []
    let datasets: any[] = []
    
    if (hasHeaderRow && hasHeaderColumn) {
      // Data with header row and header column
      labels = data[0].slice(1).map(String)
      
      for (let i = 1; i < data.length; i++) {
        const rowData = data[i]
        datasets.push({
          label: String(rowData[0]),
          data: rowData.slice(1),
          backgroundColor: options.colors?.[i - 1] || getDefaultColor(i - 1)
        })
      }
    } else if (hasHeaderRow) {
      // Data with header row only
      labels = data[0].map(String)
      
      for (let i = 1; i < data.length; i++) {
        datasets.push({
          label: `Series ${i}`,
          data: data[i],
          backgroundColor: options.colors?.[i - 1] || getDefaultColor(i - 1)
        })
      }
    } else if (hasHeaderColumn) {
      // Data with header column only
      for (let i = 0; i < data.length; i++) {
        labels.push(String(data[i][0]))
      }
      
      const seriesData = data.map(row => row[1])
      datasets.push({
        label: 'Series 1',
        data: seriesData,
        backgroundColor: options.colors || getDefaultColors(1)
      })
    } else {
      // Data without headers
      labels = Array.from({ length: data[0].length }, (_, i) => `Item ${i + 1}`)
      
      for (let i = 0; i < data.length; i++) {
        datasets.push({
          label: `Series ${i + 1}`,
          data: data[i],
          backgroundColor: options.colors?.[i] || getDefaultColor(i)
        })
      }
    }
    
    // Create the chart
    const ctx = canvasRef.current.getContext('2d')
    
    if (ctx) {
      chartInstanceRef.current = new ChartJS(ctx, {
        type: options.type,
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: !!options.title,
              text: options.title || ''
            },
            legend: {
              position: options.legendPosition || 'top'
            }
          },
          scales: {
            x: {
              title: {
                display: !!options.xAxisTitle,
                text: options.xAxisTitle || ''
              }
            },
            y: {
              title: {
                display: !!options.yAxisTitle,
                text: options.yAxisTitle || ''
              }
            }
          }
        }
      })
    }
    
    // Cleanup
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [options, data, width, height])
  
  return (
    <div className="chart-container" style={{ width, height }}>
      <canvas ref={canvasRef} id={id} />
    </div>
  )
}

// Helper functions for colors
function getDefaultColor(index: number): string {
  const colors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)',
    'rgba(83, 102, 255, 0.7)',
    'rgba(40, 159, 64, 0.7)',
    'rgba(210, 199, 199, 0.7)'
  ]
  
  return colors[index % colors.length]
}

function getDefaultColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => getDefaultColor(i))
}

