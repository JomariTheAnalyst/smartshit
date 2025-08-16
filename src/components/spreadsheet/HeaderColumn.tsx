'use client'

import { FixedSizeList } from 'react-window'

interface HeaderColumnProps {
  rowCount: number
  rowHeight: number
  width: number
}

export default function HeaderColumn({
  rowCount,
  rowHeight,
  width
}: HeaderColumnProps) {
  // Render a header cell
  const renderHeaderCell = ({ index, style }) => {
    const rowNumber = index + 1
    
    return (
      <div
        className="header-cell flex items-center justify-center border-r border-b bg-muted font-medium text-sm"
        style={style}
      >
        {rowNumber}
      </div>
    )
  }
  
  return (
    <FixedSizeList
      className="header-column-list"
      height={rowCount * rowHeight}
      itemCount={rowCount}
      itemSize={rowHeight}
      width={width}
    >
      {renderHeaderCell}
    </FixedSizeList>
  )
}

