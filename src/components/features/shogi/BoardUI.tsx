'use client';

import React, { useCallback, useMemo, useState, memo, useRef, useEffect } from 'react';

import { IPiece } from '@/domain/models/piece/interface';
import { UIPosition } from '@/types/common';

import { BoardCell, KANJI_NUMBERS } from './BoardCell';

interface BoardUIProps {
  size?: number;
  onCellClick?: (position: UIPosition) => void;
  onPieceClick?: (piece: IPiece, position?: UIPosition) => void;
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
  size: number;
  piecesMap: Map<string, IPiece>;
  selectedCell: UIPosition | null;
  highlightedChecker: (row: number, col: number) => boolean;
  focusedCell: UIPosition;
  cellRefs: React.MutableRefObject<Array<Array<HTMLDivElement | null>>>;
  onCellClick?: (position: UIPosition) => void;
  onPieceClick?: (piece: IPiece, position?: UIPosition) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>, position: UIPosition) => void;
  onFocus: (position: UIPosition) => void;
}>(({ 
  rowIndex, 
  size,
  piecesMap, 
  selectedCell, 
  highlightedChecker, 
  focusedCell,
  cellRefs,
  onCellClick,
  onPieceClick,
  onKeyDown,
  onFocus
}) => {
  return (
    <>
      <div className="flex items-center justify-center text-sm font-bold">
        {KANJI_NUMBERS[rowIndex]}
      </div>
      
      {Array.from({ length: size }, (_, colIndex) => {
        const uiRow = rowIndex + 1; 
        const uiCol = size - colIndex;
        const piece = piecesMap.get(getPositionKey(uiRow, uiCol));
        
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
            isSelected={selectedCell?.row === uiRow && selectedCell?.column === uiCol}
            isHighlighted={highlightedChecker(uiRow, uiCol)}
            isFocused={focusedCell.row === uiRow && focusedCell.column === uiCol}
            onCellClick={onCellClick || (() => {})}
            onPieceClick={onPieceClick}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            size={size}
          />
        );
      })}
    </>
  );
});

BoardRow.displayName = 'BoardRow';

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
          onPieceClick?.(piece, position);
        } else {
          onCellClick?.(position);
        }
        return; // フォーカス変更はしないのでここで終了
    }
    setFocusedCell(newPosition);

  }, [piecesMap, onCellClick, onPieceClick, size]);

  // 上部座標の事前生成
  const topCoordinates = useMemo(
    () => Array.from({ length: size }, (_, i) => size - i),
    [size]
  );

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
          <div className=""></div>
          
          {topCoordinates.map((num, i) => (
            <div key={`top-${i}`} className="flex items-center justify-center text-sm font-bold">
              {num}
            </div>
          ))}
          
          {Array.from({ length: size }, (_, rowIndex) => (
            <BoardRow
              key={`row-${rowIndex}`}
              rowIndex={rowIndex}
              size={size}
              piecesMap={piecesMap}
              selectedCell={selectedCell || null}
              highlightedChecker={highlightedChecker}
              focusedCell={focusedCell}
              cellRefs={cellRefs}
              onCellClick={onCellClick}
              onPieceClick={onPieceClick}
              onKeyDown={handleKeyDown}
              onFocus={setFocusedCell}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

BoardUI.displayName = 'BoardUI';