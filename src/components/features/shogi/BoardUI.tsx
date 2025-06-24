'use client';

import { clsx } from 'clsx';
import React, { useCallback, useMemo } from 'react';

import { PieceUI } from '@/components/ui/PieceUI';
import { IPiece } from '@/domain/models/piece/interface';
import { UIPosition } from '@/usecases/game/types';

interface BoardUIProps {
  onCellClick?: (position: UIPosition) => void;
  onPieceClick?: (piece: IPiece) => void;
  selectedCell?: UIPosition | null;
  highlightedCells?: UIPosition[];
  pieces?: { piece: IPiece; position: UIPosition }[];
}

export const KANJI_NUMBERS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

export const BoardUI: React.FC<BoardUIProps> = ({
  onCellClick,
  onPieceClick,
  selectedCell,
  highlightedCells = [],
  pieces = [],
}) => {
  // 駒の位置をマップに変換して高速検索可能にする
  const piecesMap = useMemo(() => {
    const map = new Map<string, IPiece>();
    pieces.forEach(({ piece, position }) => {
      // UIPositionは1-basedなので、そのままキーとして使用
      map.set(`${position.row}-${position.column}`, piece);
    });
    return map;
  }, [pieces]);
  const isCellSelected = useCallback(
    (row: number, col: number): boolean => {
      // row, col は 1-based
      return selectedCell?.row === row && selectedCell?.column === col;
    },
    [selectedCell]
  );

  const isCellHighlighted = useCallback(
    (row: number, col: number): boolean => {
      // row, col は 1-based
      return highlightedCells.some(cell => cell.row === row && cell.column === col);
    },
    [highlightedCells]
  );

  const handleCellClick = useCallback(
    (row: number, col:number) => {
      // row, col は 1-based
      onCellClick?.({ row, column: col });
    },
    [onCellClick]
  );

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
          {Array.from({ length: 9 }, (_, rowIndex) => ( // rowIndexは 0-8
            <React.Fragment key={`row-${rowIndex}`}>
              {/* 左側の座標（一-九） */}
              <div className="flex items-center justify-center text-sm font-bold">
                {KANJI_NUMBERS[rowIndex]}
              </div>
              
              {/* マス目 */}
              {Array.from({ length: 9 }, (_, colIndex) => { // colIndexは 0-8
                // UI表示用の座標(1-9)に変換
                const uiRow = rowIndex + 1; 
                const uiCol = 9 - colIndex;

                const piece = piecesMap.get(`${uiRow}-${uiCol}`);
                
                return (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={clsx(
                      'border border-gray-800 transition-colors duration-200',
                      'relative flex items-center justify-center',
                      {
                        'bg-blue-500': isCellSelected(uiRow, uiCol),
                        'bg-green-500': isCellHighlighted(uiRow, uiCol) && !isCellSelected(uiRow, uiCol),
                        'bg-amber-50': !isCellSelected(uiRow, uiCol) && !isCellHighlighted(uiRow, uiCol)
                      }
                    )}
                  >
                    {piece ? (
                      <PieceUI
                        piece={piece}
                        size="sm"
                        onClick={onPieceClick}
                        className="absolute inset-1"
                      />
                    ) : (
                      <button
                        data-testid={`cell-${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(uiRow, uiCol)}
                        className="w-full h-full hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label={`${KANJI_NUMBERS[rowIndex]}${9 - colIndex}`}
                      />
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};