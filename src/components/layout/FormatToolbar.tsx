'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  PaintBucket,
  Type,
  Palette
} from 'lucide-react'
import { CellFormat } from '@/types/spreadsheet'

interface FormatToolbarProps {
  onFormatChange: (format: Partial<CellFormat>) => void
  currentFormat: Partial<CellFormat>
}

export default function FormatToolbar({
  onFormatChange,
  currentFormat
}: FormatToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  
  // Font families
  const fontFamilies = [
    'Arial',
    'Calibri',
    'Cambria',
    'Courier New',
    'Georgia',
    'Helvetica',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana'
  ]
  
  // Font sizes
  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]
  
  // Colors
  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#800000', '#008000',
    '#000080', '#808000', '#800080', '#008080', '#808080',
    '#C0C0C0', '#FF9900', '#99CC00', '#339966', '#33CCCC',
    '#3366FF', '#800080', '#999999', '#FF99CC', '#FFCC99'
  ]
  
  // Handle font family change
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFormatChange({ fontFamily: e.target.value })
  }
  
  // Handle font size change
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFormatChange({ fontSize: parseInt(e.target.value) })
  }
  
  // Handle bold toggle
  const handleBoldToggle = () => {
    onFormatChange({ 
      fontWeight: currentFormat.fontWeight === 'bold' ? 'normal' : 'bold' 
    })
  }
  
  // Handle italic toggle
  const handleItalicToggle = () => {
    onFormatChange({ 
      fontStyle: currentFormat.fontStyle === 'italic' ? 'normal' : 'italic' 
    })
  }
  
  // Handle underline toggle
  const handleUnderlineToggle = () => {
    onFormatChange({ 
      textDecoration: currentFormat.textDecoration === 'underline' ? 'none' : 'underline' 
    })
  }
  
  // Handle text alignment
  const handleTextAlign = (align: 'left' | 'center' | 'right') => {
    onFormatChange({ horizontalAlign: align })
  }
  
  // Handle text color change
  const handleTextColorChange = (color: string) => {
    onFormatChange({ color })
    setShowColorPicker(false)
  }
  
  // Handle background color change
  const handleBgColorChange = (color: string) => {
    onFormatChange({ backgroundColor: color })
    setShowBgColorPicker(false)
  }
  
  return (
    <div className="format-toolbar flex items-center space-x-2 p-1">
      {/* Font Family */}
      <select
        className="text-xs border rounded px-1 py-0.5 w-32"
        value={currentFormat.fontFamily || 'Arial'}
        onChange={handleFontFamilyChange}
      >
        {fontFamilies.map(font => (
          <option key={font} value={font}>{font}</option>
        ))}
      </select>
      
      {/* Font Size */}
      <select
        className="text-xs border rounded px-1 py-0.5 w-16"
        value={currentFormat.fontSize || 11}
        onChange={handleFontSizeChange}
      >
        {fontSizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
      
      {/* Bold */}
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 ${currentFormat.fontWeight === 'bold' ? 'bg-gray-200' : ''}`}
        onClick={handleBoldToggle}
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      {/* Italic */}
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 ${currentFormat.fontStyle === 'italic' ? 'bg-gray-200' : ''}`}
        onClick={handleItalicToggle}
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      {/* Underline */}
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 ${currentFormat.textDecoration === 'underline' ? 'bg-gray-200' : ''}`}
        onClick={handleUnderlineToggle}
      >
        <Underline className="h-4 w-4" />
      </Button>
      
      <div className="h-6 border-l border-gray-300 mx-1"></div>
      
      {/* Text Alignment */}
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 ${currentFormat.horizontalAlign === 'left' ? 'bg-gray-200' : ''}`}
        onClick={() => handleTextAlign('left')}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 ${currentFormat.horizontalAlign === 'center' ? 'bg-gray-200' : ''}`}
        onClick={() => handleTextAlign('center')}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 ${currentFormat.horizontalAlign === 'right' ? 'bg-gray-200' : ''}`}
        onClick={() => handleTextAlign('right')}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      
      <div className="h-6 border-l border-gray-300 mx-1"></div>
      
      {/* Text Color */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="p-1"
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          <Type className="h-4 w-4" />
          <div 
            className="absolute bottom-0 left-0 right-0 h-1" 
            style={{ backgroundColor: currentFormat.color || '#000000' }}
          ></div>
        </Button>
        
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded shadow-lg z-10 grid grid-cols-5 gap-1">
            {colors.map(color => (
              <div
                key={color}
                className="w-5 h-5 cursor-pointer border"
                style={{ backgroundColor: color }}
                onClick={() => handleTextColorChange(color)}
              ></div>
            ))}
          </div>
        )}
      </div>
      
      {/* Background Color */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="p-1"
          onClick={() => setShowBgColorPicker(!showBgColorPicker)}
        >
          <PaintBucket className="h-4 w-4" />
          <div 
            className="absolute bottom-0 left-0 right-0 h-1" 
            style={{ backgroundColor: currentFormat.backgroundColor || 'transparent' }}
          ></div>
        </Button>
        
        {showBgColorPicker && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded shadow-lg z-10 grid grid-cols-5 gap-1">
            {colors.map(color => (
              <div
                key={color}
                className="w-5 h-5 cursor-pointer border"
                style={{ backgroundColor: color }}
                onClick={() => handleBgColorChange(color)}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

