'use client';

import React, { useCallback, useMemo, useState, memo, useRef, useEffect } from 'react';

import { IPiece } from '@/domain/models/piece/interface';
import { UIPosition } from '@/types/common';

import { BoardCell, KANJI_NUMBERS } from './BoardCell';

interface BoardUIProps {
  size?: number;
  onCellClick?: (position: UIPosition) => void;
  onPieceClick?: (piece: IPiece) => void;
  selectedCell?: UIPosition | null;
  highlightedCells?: UIPosition[];
  pieces?: { piece: IPiece; position: UIPosition }[];
}


export const BoardUI: React.FC<BoardUIProps> = memo(({
  size = 9,
  onCellClick,
  onPieceClick,
  selectedCell,
  highlightedCells = [],
  pieces = [],
}) => {
  // キーボードナビゲーション用のフォーカス位置（初期値は盤面の中央）
  const [focusedCell, setFocusedCell] = useState<UIPosition>({ row: Math.floor(size / 2) + 1, column: Math.floor(size / 2) + 1 });
  const cellRefs = useRef<Array<Array<HTMLDivElement | null>>>(
    Array(size).fill(null).map(() => Array(size).fill(null))
  );

  useEffect(() => {
    // focusedCellが変更されたら、対応するセルにフォーカスを当てる
    // uiRowは1-9, uiColは1-9
    // rowIndexは0-8, colIndexは0-8
    const rowIndex = focusedCell.row - 1;
    const colIndex = size - focusedCell.column;
    cellRefs.current[rowIndex]?.[colIndex]?.focus();
  }, [focusedCell, size]);

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
  const handleKeyDown = useCallback((event: React.KeyboardEvent, position: UIPosition) => {
    const { key } = event;

    let newPosition = { ...position };

    switch (key) {
      case 'ArrowUp':
        event.preventDefault();
        if (position.row > 1) newPosition = { ...newPosition, row: position.row - 1 };
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (position.row < size) newPosition = { ...newPosition, row: position.row + 1 };
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (position.column < size) newPosition = { ...newPosition, column: position.column + 1 };
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (position.column > 1) newPosition = { ...newPosition, column: position.column - 1 };
        break;
      case 'Enter':
      case ' ': // Space key
        event.preventDefault();
        // フォーカス位置の駒または空のセルをクリック
        const piece = piecesMap.get(`${position.row}-${position.column}`);
        if (piece) {
          onPieceClick?.(piece);
        } else {
          onCellClick?.(position);
        }
        return; // フォーカス変更はしないのでここで終了
    }
    setFocusedCell(newPosition);

  }, [piecesMap, onCellClick, onPieceClick, size]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="aspect-square bg-amber-100 rounded-lg shadow-lg p-4">
        <div 
          className="grid grid-cols-10 grid-rows-10 gap-0 h-full"
          style={{
            gridTemplateColumns: `auto repeat(${size}, 1fr)`,
            gridTemplateRows: `auto repeat(${size}, 1fr)`
          }}
          role="grid"
          aria-label="将棋盤"
        >
          {/* 左上の空白セル */}
          <div className=""></div>
          
          {/* 上部の座標（1-size） */}
          {Array.from({ length: size }, (_, i) => (
            <div key={`top-${i}`} className="flex items-center justify-center text-sm font-bold">
              {size - i}
            </div>
          ))}
          
          {/* 各行 */}
          {Array.from({ length: size }, (_, rowIndex) => ( // rowIndexは 0-(size-1)
            <React.Fragment key={`row-${rowIndex}`}>
              {/* 左側の座標（一-九） */}
              <div className="flex items-center justify-center text-sm font-bold">
                {KANJI_NUMBERS[rowIndex]}
              </div>
              
              {/* マス目 */}
              {Array.from({ length: size }, (_, colIndex) => { // colIndexは 0-(size-1)
                // UI表示用の座標(1-size)に変換
                const uiRow = rowIndex + 1; 
                const uiCol = size - colIndex;
                const piece = piecesMap.get(`${uiRow}-${uiCol}`);
                
                return (
                  <BoardCell
                    key={`cell-${rowIndex}-${colIndex}`}
                    ref={(el) => {
                      if (cellRefs.current[rowIndex]) {
                        cellRefs.current[rowIndex][colIndex] = el;
                      }
                    }}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                    piece={piece || null}
                    isSelected={isCellSelected(uiRow, uiCol)}
                    isHighlighted={isCellHighlighted(uiRow, uiCol)}
                    isFocused={focusedCell.row === uiRow && focusedCell.column === uiCol}
                    onCellClick={onCellClick || (() => {})}
                    onPieceClick={onPieceClick}
                    onKeyDown={handleKeyDown}
                    onFocus={setFocusedCell}
                    size={size}
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