'use client';

import { clsx } from 'clsx';
import React, { memo, useCallback } from 'react';

import { PieceUI } from '@/components/ui/PieceUI';
import { IPiece } from '@/domain/models/piece/interface';
import { UIPosition } from '@/types/common';

export const KANJI_NUMBERS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

interface BoardCellProps {
  rowIndex: number;
  colIndex: number;
  piece: IPiece | null;
  isSelected: boolean;
  isHighlighted: boolean;
  isFocused: boolean;
  onCellClick: (position: UIPosition) => void;
  onPieceClick?: (piece: IPiece) => void;
}

// セルのスタイルをメモ化
const getCellClassName = (isSelected: boolean, isHighlighted: boolean, isFocused: boolean) => {
  return clsx(
    'border border-gray-800 transition-colors duration-200',
    'relative flex items-center justify-center',
    {
      'bg-blue-500': isSelected,
      'bg-green-500': isHighlighted && !isSelected,
      'bg-amber-50': !isSelected && !isHighlighted,
      'ring-2 ring-purple-500 ring-inset': isFocused
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
    arePiecesEqual(prevProps.piece, nextProps.piece) &&
    prevProps.onCellClick === nextProps.onCellClick &&
    prevProps.onPieceClick === nextProps.onPieceClick
  );
};

export const BoardCell: React.FC<BoardCellProps> = memo(({
  rowIndex,
  colIndex,
  piece,
  isSelected,
  isHighlighted,
  isFocused,
  onCellClick,
  onPieceClick,
}) => {
  const uiRow = rowIndex + 1;
  const uiCol = 9 - colIndex;

  // コールバックをメモ化
  const handleCellClick = useCallback(() => {
    onCellClick({ row: uiRow, column: uiCol });
  }, [onCellClick, uiRow, uiCol]);

  // 駒の説明テキストを事前計算
  const pieceDescription = piece 
    ? ` - ${piece.player === 'SENTE' ? '先手' : '後手'}の${piece.type}`
    : ' - 空のマス';

  const cellLabel = `${KANJI_NUMBERS[rowIndex]}${9 - colIndex}${pieceDescription}`;
  const className = getCellClassName(isSelected, isHighlighted, isFocused);

  return (
    <div
      className={className}
      role="gridcell"
      aria-label={cellLabel}
    >
      {piece ? (
        <PieceUI
          piece={piece}
          size="sm"
          onClick={onPieceClick}
          className="absolute inset-1"
          aria-describedby={`piece-info-${uiRow}-${uiCol}`}
          tabIndex={-1}
        />
      ) : (
        <button
          data-testid={`cell-${rowIndex}-${colIndex}`}
          onClick={handleCellClick}
          className="w-full h-full hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={`${KANJI_NUMBERS[rowIndex]}${9 - colIndex}`}
        />
      )}
    </div>
  );
}, areCellPropsEqual);

BoardCell.displayName = 'BoardCell';