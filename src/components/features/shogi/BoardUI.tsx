'use client';

import React, { useCallback, useMemo, useState, memo } from 'react';

import { IPiece } from '@/domain/models/piece/interface';
import { UIPosition } from '@/types/common';

import { BoardCell, KANJI_NUMBERS } from './BoardCell';

interface BoardUIProps {
  onCellClick?: (position: UIPosition) => void;
  onPieceClick?: (piece: IPiece) => void;
  selectedCell?: UIPosition | null;
  highlightedCells?: UIPosition[];
  pieces?: { piece: IPiece; position: UIPosition }[];
}


export const BoardUI: React.FC<BoardUIProps> = memo(({
  onCellClick,
  onPieceClick,
  selectedCell,
  highlightedCells = [],
  pieces = [],
}) => {
  // キーボードナビゲーション用のフォーカス位置
  const [focusedCell, setFocusedCell] = useState<UIPosition>({ row: 5, column: 5 });
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


  // キーボードナビゲーションのハンドラー
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key } = event;
    const { row, column } = focusedCell;

    switch (key) {
      case 'ArrowUp':
        event.preventDefault();
        if (row > 1) setFocusedCell({ row: row - 1, column });
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (row < 9) setFocusedCell({ row: row + 1, column });
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (column < 9) setFocusedCell({ row, column: column + 1 });
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (column > 1) setFocusedCell({ row, column: column - 1 });
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        // フォーカス位置の駒または空のセルをクリック
        const piece = piecesMap.get(`${row}-${column}`);
        if (piece) {
          onPieceClick?.(piece);
        } else {
          onCellClick?.({ row, column });
        }
        break;
    }
  }, [focusedCell, piecesMap, onCellClick, onPieceClick]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="aspect-square bg-amber-100 rounded-lg shadow-lg p-4">
        <div 
          className="grid grid-cols-[auto_repeat(9,1fr)] grid-rows-[auto_repeat(9,1fr)] gap-0 h-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          role="grid"
          aria-label="将棋盤 - 矢印キーで移動、EnterまたはSpaceで選択"
        >
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
                  <BoardCell
                    key={`cell-${rowIndex}-${colIndex}`}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                    piece={piece || null}
                    isSelected={isCellSelected(uiRow, uiCol)}
                    isHighlighted={isCellHighlighted(uiRow, uiCol)}
                    isFocused={focusedCell.row === uiRow && focusedCell.column === uiCol}
                    onCellClick={onCellClick || (() => {})}
                    onPieceClick={onPieceClick}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
});

BoardUI.displayName = 'BoardUI';