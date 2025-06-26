'use client';

import { useState } from 'react';

import { BoardUI } from '@/components/features/shogi';
import { UIPosition } from '@/types/common';

export default function BoardDemoPage() {
  const [selectedCell, setSelectedCell] = useState<UIPosition | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<UIPosition[]>([]);
  const [boardSize, setBoardSize] = useState<number>(9);
  
  const handleCellClick = (position: UIPosition, size: number = boardSize) => {
    setSelectedCell(position);
    setBoardSize(size);
    
    // デモ用：選択したマスの周囲をハイライト
    const newHighlights: UIPosition[] = [];
    const { row, column } = position;
    
    // 上下左右のマスをハイライト
    const directions = [
      { dr: -1, dc: 0 }, // 上
      { dr: 1, dc: 0 },  // 下
      { dr: 0, dc: -1 }, // 左
      { dr: 0, dc: 1 },  // 右
    ];
    
    directions.forEach(({ dr, dc }) => {
      const newRow = row + dr;
      const newCol = column + dc;
      if (newRow >= 1 && newRow <= size && newCol >= 1 && newCol <= size) {
        newHighlights.push({ row: newRow, column: newCol });
      }
    });
    
    setHighlightedCells(newHighlights);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          将棋盤UIコンポーネント デモ
        </h1>
        
        <div className="mb-4 text-center text-gray-600">
          <p>マスをクリックすると選択状態（青）になり、</p>
          <p>その周囲のマスが移動可能マス（緑）として表示されます。</p>
        </div>
        
        <BoardUI
          selectedCell={selectedCell}
          highlightedCells={highlightedCells}
          onCellClick={(position) => handleCellClick(position, 9)}
        />
        
        <h2 className="text-2xl font-bold text-center mb-4 mt-8">
          3x3 Board
        </h2>
        <BoardUI
          size={3}
          selectedCell={selectedCell}
          highlightedCells={highlightedCells}
          onCellClick={(position) => handleCellClick(position, 3)}
        />
        
        <div className="mt-8 text-center">
          {selectedCell && (
            <p className="text-lg">
              選択中: {['一', '二', '三', '四', '五', '六', '七', '八', '九'][selectedCell.row - 1]}
              {selectedCell.column}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}