'use client'

import { FixedSizeList } from 'react-window'
import { colIndexToLetter } from '@/lib/utils'

interface HeaderRowProps {
  columnCount: number
  columnWidth: number
  height: number
}

export default function HeaderRow({
  columnCount,
  columnWidth,
  height
}: HeaderRowProps) {
  // Render a header cell
  const renderHeaderCell = ({ index, style }) => {
    const columnLetter = colIndexToLetter(index)
    
    return (
      <div
        className="header-cell flex items-center justify-center border-r border-b bg-muted font-medium text-sm"
        style={style}
      >
        {columnLetter}
      </div>
    )
  }
  
  return (
    <FixedSizeList
      className="header-row-list"
      height={height}
      itemCount={columnCount}
      itemSize={columnWidth}
      layout="horizontal"
      width={columnCount * columnWidth}
    >
      {renderHeaderCell}
    </FixedSizeList>
  )
}

