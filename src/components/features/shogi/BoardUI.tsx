'use client';

import { clsx } from 'clsx';
import React, { useCallback, useMemo } from 'react';

import { CellPosition } from '@/domain/models/position/types';
import { IPiece } from '@/domain/models/piece/interface';
import { PieceUI } from '@/components/ui/PieceUI';

interface BoardUIProps {
  onCellClick?: (position: CellPosition) => void;
  onPieceClick?: (piece: IPiece) => void;
  selectedCell?: CellPosition | null;
  highlightedCells?: CellPosition[];
  pieces?: { piece: IPiece; position: CellPosition }[];
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
      map.set(`${position.row}-${position.col}`, piece);
    });
    return map;
  }, [pieces]);
  const isCellSelected = useCallback(
    (row: number, col: number): boolean => {
      return selectedCell?.row === row && selectedCell?.col === col;
    },
    [selectedCell]
  );

  const isCellHighlighted = useCallback(
    (row: number, col: number): boolean => {
      return highlightedCells.some(cell => cell.row === row && cell.col === col);
    },
    [highlightedCells]
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      onCellClick?.({ row, col });
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
          {Array.from({ length: 9 }, (_, row) => (
            <React.Fragment key={`row-${row}`}>
              {/* 左側の座標（一-九） */}
              <div className="flex items-center justify-center text-sm font-bold">
                {KANJI_NUMBERS[row]}
              </div>
              
              {/* マス目 */}
              {Array.from({ length: 9 }, (_, col) => {
                // 将棋盤は右から1, 2, ...と数えるため、CSS Gridの列番号(0-8)を将棋の筋(8-0)に変換する
                // 例: col=0 (左端の列) -> actualCol=8 (9筋)
                // 例: col=8 (右端の列) -> actualCol=0 (1筋)
                const actualCol = 8 - col;
                const piece = piecesMap.get(`${row}-${actualCol}`);
                
                return (
                  <div
                    key={`cell-${row}-${col}`}
                    className={clsx(
                      'border border-gray-800 transition-colors duration-200',
                      'relative flex items-center justify-center',
                      {
                        'bg-blue-500': isCellSelected(row, actualCol),
                        'bg-green-500': isCellHighlighted(row, actualCol) && !isCellSelected(row, actualCol),
                        'bg-amber-50': !isCellSelected(row, actualCol) && !isCellHighlighted(row, actualCol)
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
                        onClick={() => handleCellClick(row, actualCol)}
                        className="w-full h-full hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label={`${KANJI_NUMBERS[row]}${9 - col}`}
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