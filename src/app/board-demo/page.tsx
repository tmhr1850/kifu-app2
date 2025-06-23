'use client'

import { useState } from 'react'

import { BoardUI } from '@/components/features/shogi'

interface Position {
  row: number
  col: number
}

export default function BoardDemoPage() {
  const [clickedPosition, setClickedPosition] = useState<Position | null>(null)
  const [movableSquares, setMovableSquares] = useState<Position[]>([])
  
  const handleSquareClick = (position: Position) => {
    setClickedPosition(position)
    
    // Demo: show some movable squares around clicked position
    const newMovableSquares: Position[] = []
    
    // Add adjacent squares as movable (for demo purposes)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        
        const newRow = position.row + dr
        const newCol = position.col + dc
        
        if (newRow >= 0 && newRow < 9 && newCol >= 0 && newCol < 9) {
          newMovableSquares.push({ row: newRow, col: newCol })
        }
      }
    }
    
    setMovableSquares(newMovableSquares)
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          将棋盤UIコンポーネント デモ
        </h1>
        
        <BoardUI 
          onSquareClick={handleSquareClick}
          movableSquares={movableSquares}
        />
        
        <div className="mt-8 text-center">
          <p className="text-lg">
            {clickedPosition ? (
              <>
                クリックした位置：
                <span className="font-bold">
                  {9 - clickedPosition.col}
                  {['一', '二', '三', '四', '五', '六', '七', '八', '九'][clickedPosition.row]}
                </span>
              </>
            ) : (
              'マスをクリックしてください'
            )}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            青：選択中のマス / 緑：移動可能なマス
          </p>
        </div>
      </div>
    </div>
  )
}