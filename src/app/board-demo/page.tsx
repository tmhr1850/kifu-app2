'use client';

import { useState } from 'react';

import { BoardUI } from '@/components/features/shogi';
import { CellPosition } from '@/domain/models/position/types';

export default function BoardDemoPage() {
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<CellPosition[]>([]);
  
  const handleCellClick = (position: CellPosition) => {
    setSelectedCell(position);
    
    // デモ用：選択したマスの周囲をハイライト
    const newHighlights: CellPosition[] = [];
    const { row, col } = position;
    
    // 上下左右のマスをハイライト
    const directions = [
      { dr: -1, dc: 0 }, // 上
      { dr: 1, dc: 0 },  // 下
      { dr: 0, dc: -1 }, // 左
      { dr: 0, dc: 1 },  // 右
    ];
    
    directions.forEach(({ dr, dc }) => {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < 9 && newCol >= 0 && newCol < 9) {
        newHighlights.push({ row: newRow, col: newCol });
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
          onCellClick={handleCellClick}
        />
        
        <div className="mt-8 text-center">
          {selectedCell && (
            <p className="text-lg">
              選択中: {['一', '二', '三', '四', '五', '六', '七', '八', '九'][selectedCell.row]}
              {9 - selectedCell.col}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}