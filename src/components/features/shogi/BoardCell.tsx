'use client';

import { clsx } from 'clsx';
import React, { memo, useCallback, forwardRef } from 'react';

import { PieceUI } from '@/components/ui/PieceUI';
import { IPiece } from '@/domain/models/piece/interface';
import { UIPosition } from '@/types/common';

export const KANJI_NUMBERS = [
  '一', '二', '三', '四', '五', '六', '七', '八', '九',
  '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九'
];

interface BoardCellProps {
  rowIndex: number;
  colIndex: number;
  piece: IPiece | null;
  isSelected: boolean;
  isHighlighted: boolean;
  isFocused: boolean;
  onCellClick: (position: UIPosition) => void;
  onPieceClick?: (piece: IPiece, position?: UIPosition) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>, position: UIPosition) => void;
  onFocus: (position: UIPosition) => void;
  size: number; // 盤面のサイズ
}

// セルのスタイルをメモ化
const getCellClassName = (isSelected: boolean, isHighlighted: boolean, isFocused: boolean) => {
  return clsx(
    'border border-gray-800 transition-colors duration-200',
    'relative flex items-center justify-center',
    'focus:outline-none focus:ring-2 focus:ring-purple-500 ring-inset',
    {
      'bg-blue-500': isSelected,
      'bg-green-500': isHighlighted && !isSelected,
      'bg-amber-50': !isSelected && !isHighlighted,
      'ring-2 ring-purple-500 ring-inset': isFocused,
      'animate-pulse': isFocused && !isSelected && !isHighlighted
    }
  );
};

// Pieceのプロパティ比較関数
const arePiecesEqual = (prevPiece: IPiece | null, nextPiece: IPiece | null): boolean => {
  if (prevPiece === nextPiece) return true;
  if (!prevPiece || !nextPiece) return false;
  return (
    prevPiece.type === nextPiece.type &&
    prevPiece.player === nextPiece.player &&
    prevPiece.equals(nextPiece)
  );
};

// メモ化の効果を高めるためのカスタム比較関数
const areCellPropsEqual = (
  prevProps: BoardCellProps,
  nextProps: BoardCellProps
): boolean => {
  return (
    prevProps.rowIndex === nextProps.rowIndex &&
    prevProps.colIndex === nextProps.colIndex &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isHighlighted === nextProps.isHighlighted &&
    prevProps.isFocused === nextProps.isFocused &&
    prevProps.size === nextProps.size &&
    arePiecesEqual(prevProps.piece, nextProps.piece) &&
    prevProps.onCellClick === nextProps.onCellClick &&
    prevProps.onPieceClick === nextProps.onPieceClick &&
    prevProps.onKeyDown === nextProps.onKeyDown &&
    prevProps.onFocus === nextProps.onFocus
  );
};

const BoardCellComponent = forwardRef<HTMLDivElement, BoardCellProps>(({
  rowIndex,
  colIndex,
  piece,
  isSelected,
  isHighlighted,
  isFocused,
  onCellClick,
  onPieceClick,
  onKeyDown,
  onFocus,
  size,
}, ref) => {
  // UI表示用の座標(1-size)に変換
  const uiRow = rowIndex + 1;
  const uiCol = size - colIndex;
  const position = { row: uiRow, column: uiCol };

  // コールバックをメモ化
  const handleCellClick = useCallback(() => {
    onCellClick(position);
    onFocus(position);
  }, [onCellClick, onFocus, position]);

  const handlePieceClick = useCallback((piece: IPiece) => {
    onPieceClick?.(piece, position);
    onFocus(position);
  }, [onPieceClick, onFocus, position]);
  
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown(event, position);
  }, [onKeyDown, position]);

  // 駒の説明テキストを事前計算
  const pieceDescription = piece 
    ? ` - ${piece.player === 'SENTE' ? '先手' : '後手'}の${piece.type}`
    : ' - 空のマス';

  const cellLabel = `${KANJI_NUMBERS[rowIndex]}${size - colIndex}${pieceDescription}`;
  const className = getCellClassName(isSelected, isHighlighted, isFocused);

  return (
    <div
      ref={ref}
      tabIndex={isFocused ? 0 : -1}
      data-testid={`cell-${rowIndex}-${colIndex}`}
      className={className}
      role="gridcell"
      aria-label={cellLabel}
      onKeyDown={handleKeyDown}
      onClick={piece ? undefined : handleCellClick}
      onFocus={() => onFocus(position)}
    >
      {piece ? (
        <PieceUI
          piece={piece}
          size="sm"
          onClick={handlePieceClick}
          className="absolute inset-1 pointer-events-auto"
          aria-describedby={`piece-info-${uiRow}-${uiCol}`}
          tabIndex={-1} // 駒自体はフォーカス対象外にする
        />
      ) : (
        // 駒がない場合は、divのonClickで処理されるため、内側のbuttonは不要
        null
      )}
    </div>
  );
});

BoardCellComponent.displayName = 'BoardCell';
export const BoardCell = memo(BoardCellComponent, areCellPropsEqual);