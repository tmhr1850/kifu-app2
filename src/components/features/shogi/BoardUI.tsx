'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface CellPosition {
  row: number;
  col: number;
}

interface BoardUIProps {
  onCellClick?: (position: CellPosition) => void;
  selectedCell?: CellPosition | null;
  highlightedCells?: CellPosition[];
}

export const BoardUI: React.FC<BoardUIProps> = ({
  onCellClick,
  selectedCell,
  highlightedCells = []
}) => {
  const kanjiNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  
  const isCellSelected = (row: number, col: number): boolean => {
    return selectedCell?.row === row && selectedCell?.col === col;
  };
  
  const isCellHighlighted = (row: number, col: number): boolean => {
    return highlightedCells.some(cell => cell.row === row && cell.col === col);
  };
  
  const handleCellClick = (row: number, col: number) => {
    onCellClick?.({ row, col });
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="aspect-square bg-amber-100 rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-[auto_repeat(9,1fr)] grid-rows-[auto_repeat(9,1fr)] gap-0 h-full">
          {/* 左上の空白セル */}
          <div className=""></div>
          
          {/* 上部の座標（1-9） */}
          {Array.from({ length: 9 }, (_, i) => (
            <div key={`top-${i}`} className="flex items-center justify-center text-sm font-bold">
              {9 - i}
            </div>
          ))}
          
          {/* 各行 */}
          {Array.from({ length: 9 }, (_, row) => (
            <React.Fragment key={`row-${row}`}>
              {/* 左側の座標（一-九） */}
              <div className="flex items-center justify-center text-sm font-bold">
                {kanjiNumbers[row]}
              </div>
              
              {/* マス目 */}
              {Array.from({ length: 9 }, (_, col) => {
                const actualCol = 8 - col; // 将棋盤は右から左へ
                return (
                  <button
                    key={`cell-${row}-${col}`}
                    onClick={() => handleCellClick(row, actualCol)}
                    className={clsx(
                      'border border-gray-800 transition-colors duration-200',
                      'hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-blue-400',
                      {
                        'bg-blue-500 hover:bg-blue-600': isCellSelected(row, actualCol),
                        'bg-green-500 hover:bg-green-600': isCellHighlighted(row, actualCol) && !isCellSelected(row, actualCol),
                        'bg-amber-50': !isCellSelected(row, actualCol) && !isCellHighlighted(row, actualCol)
                      }
                    )}
                    aria-label={`${kanjiNumbers[row]}${9 - col}`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};