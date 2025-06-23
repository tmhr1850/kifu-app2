'use client'

import { useState } from 'react'

interface Position {
  row: number
  col: number
}

interface BoardUIProps {
  onSquareClick?: (position: Position) => void
  movableSquares?: Position[]
}

export function BoardUI({ onSquareClick, movableSquares = [] }: BoardUIProps) {
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null)
  
  const japaneseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
  
  const handleSquareClick = (row: number, col: number) => {
    const position = { row, col }
    setSelectedSquare(position)
    onSquareClick?.(position)
  }
  
  const isMovableSquare = (row: number, col: number) => {
    return movableSquares.some(pos => pos.row === row && pos.col === col)
  }
  
  const isSelectedSquare = (row: number, col: number) => {
    return selectedSquare?.row === row && selectedSquare?.col === col
  }
  
  const getSquareClasses = (row: number, col: number) => {
    const baseClasses = 'aspect-square border border-gray-400 transition-colors hover:bg-gray-100'
    
    if (isSelectedSquare(row, col)) {
      return `${baseClasses} bg-blue-200 hover:bg-blue-300`
    }
    
    if (isMovableSquare(row, col)) {
      return `${baseClasses} bg-green-200 hover:bg-green-300`
    }
    
    return baseClasses
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div 
        data-testid="shogi-board"
        className="aspect-square relative"
      >
        {/* Column coordinates (top) */}
        <div className="absolute -top-8 left-8 right-0 grid grid-cols-9 text-center">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="text-sm font-medium">
              {9 - i}
            </div>
          ))}
        </div>
        
        {/* Row coordinates (left) */}
        <div className="absolute top-0 -left-8 bottom-0 grid grid-rows-9">
          {japaneseNumbers.map((num, i) => (
            <div key={i} className="flex items-center text-sm font-medium">
              {num}
            </div>
          ))}
        </div>
        
        {/* Board grid */}
        <div className="grid grid-cols-9 grid-rows-9 gap-0 w-full h-full">
          {Array.from({ length: 81 }, (_, index) => {
            const row = Math.floor(index / 9)
            const col = index % 9
            
            return (
              <button
                key={index}
                aria-label={`square ${row}-${col}`}
                className={getSquareClasses(row, col)}
                onClick={() => handleSquareClick(row, col)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}