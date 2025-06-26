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

// 高速な位置キー生成関数
const getPositionKey = (row: number, col: number): string => `${row}-${col}`;

// メモ化されたセル選択状態チェック
const createCellChecker = (cells: UIPosition[]) => {
  const cellSet = new Set(cells.map(cell => getPositionKey(cell.row, cell.column)));
  return (row: number, col: number) => cellSet.has(getPositionKey(row, col));
};

// 盤面の行コンポーネントを分離して再レンダリングを最小化
const BoardRow = memo<{
  rowIndex: number;
  piecesMap: Map<string, IPiece>;
  selectedCell: UIPosition | null;
  highlightedChecker: (row: number, col: number) => boolean;
  focusedCell: UIPosition;
  onCellClick?: (position: UIPosition) => void;
  onPieceClick?: (piece: IPiece) => void;
}>(({ 
  rowIndex, 
  piecesMap, 
  selectedCell, 
  highlightedChecker, 
  focusedCell,
  onCellClick,
  onPieceClick 
}) => {
  return (
    <>
      <div className="flex items-center justify-center text-sm font-bold">
        {KANJI_NUMBERS[rowIndex]}
      </div>
      
      {Array.from({ length: 9 }, (_, colIndex) => {
        const uiRow = rowIndex + 1; 
        const uiCol = 9 - colIndex;
        const piece = piecesMap.get(getPositionKey(uiRow, uiCol));
        
        return (
          <BoardCell
            key={`cell-${rowIndex}-${colIndex}`}
            rowIndex={rowIndex}
            colIndex={colIndex}
            piece={piece || null}
            isSelected={selectedCell?.row === uiRow && selectedCell?.column === uiCol}
            isHighlighted={highlightedChecker(uiRow, uiCol)}
            isFocused={focusedCell.row === uiRow && focusedCell.column === uiCol}
            onCellClick={onCellClick || (() => {})}
            onPieceClick={onPieceClick}
          />
        );
      })}
    </>
  );
});

BoardRow.displayName = 'BoardRow';

export const BoardUI: React.FC<BoardUIProps> = memo(({
  onCellClick,
  onPieceClick,
  selectedCell,
  highlightedCells = [],
  pieces = [],
}) => {
  const [focusedCell, setFocusedCell] = useState<UIPosition>({ row: 5, column: 5 });
  
  // 最適化された駒の位置マップ生成
  const piecesMap = useMemo(() => {
    const map = new Map<string, IPiece>();
    for (const { piece, position } of pieces) {
      map.set(getPositionKey(position.row, position.column), piece);
    }
    return map;
  }, [pieces]);

  // ハイライトチェッカーの作成（メモ化）
  const highlightedChecker = useMemo(
    () => createCellChecker(highlightedCells),
    [highlightedCells]
  );

  // キーボードナビゲーションのハンドラー（最適化版）
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key } = event;
    
    setFocusedCell(prev => {
      const { row, column } = prev;
      
      switch (key) {
        case 'ArrowUp':
          event.preventDefault();
          return row > 1 ? { row: row - 1, column } : prev;
        case 'ArrowDown':
          event.preventDefault();
          return row < 9 ? { row: row + 1, column } : prev;
        case 'ArrowLeft':
          event.preventDefault();
          return column < 9 ? { row, column: column + 1 } : prev;
        case 'ArrowRight':
          event.preventDefault();
          return column > 1 ? { row, column: column - 1 } : prev;
        default:
          if (key === 'Enter' || key === ' ') {
            event.preventDefault();
            const piece = piecesMap.get(getPositionKey(row, column));
            if (piece) {
              onPieceClick?.(piece);
            } else {
              onCellClick?.({ row, column });
            }
          }
          return prev;
      }
    });
  }, [piecesMap, onCellClick, onPieceClick]);

  // 上部座標の事前生成
  const topCoordinates = useMemo(
    () => Array.from({ length: 9 }, (_, i) => 9 - i),
    []
  );

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
          <div className=""></div>
          
          {topCoordinates.map((num, i) => (
            <div key={`top-${i}`} className="flex items-center justify-center text-sm font-bold">
              {num}
            </div>
          ))}
          
          {Array.from({ length: 9 }, (_, rowIndex) => (
            <BoardRow
              key={`row-${rowIndex}`}
              rowIndex={rowIndex}
              piecesMap={piecesMap}
              selectedCell={selectedCell || null}
              highlightedChecker={highlightedChecker}
              focusedCell={focusedCell}
              onCellClick={onCellClick}
              onPieceClick={onPieceClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

BoardUI.displayName = 'BoardUI';