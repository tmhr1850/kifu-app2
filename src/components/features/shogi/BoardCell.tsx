'use client';

import { clsx } from 'clsx';
import React, { memo } from 'react';

import { PieceUI } from '@/components/ui/PieceUI';
import { IPiece } from '@/domain/models/piece/interface';
import { UIPosition } from '@/types/common';

export const KANJI_NUMBERS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

interface BoardCellProps {
  rowIndex: number; // 0-8
  colIndex: number; // 0-8
  piece: IPiece | null;
  isSelected: boolean;
  isHighlighted: boolean;
  isFocused: boolean;
  onCellClick: (position: UIPosition) => void;
  onPieceClick?: (piece: IPiece) => void;
}

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
  // UI表示用の座標(1-9)に変換
  const uiRow = rowIndex + 1;
  const uiCol = 9 - colIndex;

  const handleCellClick = () => {
    onCellClick({ row: uiRow, column: uiCol });
  };

  return (
    <div
      className={clsx(
        'border border-gray-800 transition-colors duration-200',
        'relative flex items-center justify-center',
        {
          'bg-blue-500': isSelected,
          'bg-green-500': isHighlighted && !isSelected,
          'bg-amber-50': !isSelected && !isHighlighted,
          'ring-2 ring-purple-500 ring-inset': isFocused
        }
      )}
      role="gridcell"
      aria-label={`${KANJI_NUMBERS[rowIndex]}${9 - colIndex}${piece ? ` - ${piece.player === 'SENTE' ? '先手' : '後手'}の${piece.type}` : ' - 空のマス'}`}
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
});

BoardCell.displayName = 'BoardCell';