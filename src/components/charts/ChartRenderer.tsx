'use client'

import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js'
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

// Chart type
export type ChartType = 'bar' | 'line' | 'pie' | 'scatter'

// Chart configuration
export interface ChartConfig {
  type: ChartType
  title: string
  data: ChartData<any>
  options?: ChartOptions<any>
}

interface ChartRendererProps {
  config: ChartConfig
  width?: number
  height?: number
  className?: string
}

export default function ChartRenderer({
  config,
  width = 400,
  height = 300,
  className = ''
}: ChartRendererProps) {
  const [chartConfig, setChartConfig] = useState<ChartConfig>(config)
  
  // Update the chart config when the props change
  useEffect(() => {
    setChartConfig(config)
  }, [config])
  
  // Render the appropriate chart type
  const renderChart = () => {
    const { type, data, options } = chartConfig
    
    switch (type) {
      case 'bar':
        return <Bar data={data} options={options} />
      case 'line':
        return <Line data={data} options={options} />
      case 'pie':
        return <Pie data={data} options={options} />
      case 'scatter':
        return <Scatter data={data} options={options} />
      default:
        return <div>Unsupported chart type: {type}</div>
    }
  }
  
  return (
    <div 
      className={`chart-container ${className}`}
      style={{ width, height }}
    >
      {renderChart()}
    </div>
  )
}

