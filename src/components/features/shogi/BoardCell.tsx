'use client';

import { clsx } from 'clsx';
import React, { forwardRef } from 'react';

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
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>, position: UIPosition) => void;
  onFocus: (position: UIPosition) => void;
}

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
}, ref) => {
  // UI表示用の座標(1-9)に変換
  const uiRow = rowIndex + 1;
  const uiCol = 9 - colIndex;
  const position = { row: uiRow, column: uiCol };

  const handleCellClick = () => {
    onCellClick(position);
    onFocus(position); // クリックされたセルにフォーカスを移動
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown(event, position);
  };

  return (
    <div
      ref={ref}
      tabIndex={isFocused ? 0 : -1}
      data-testid={`cell-${rowIndex}-${colIndex}`}
      className={clsx(
        'border border-gray-800 transition-colors duration-200',
        'relative flex items-center justify-center',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 ring-inset', // isFocusedのスタイルをTailwindのfocus擬似クラスに統一
        {
          'bg-blue-500': isSelected,
          'bg-green-500': isHighlighted && !isSelected,
          'bg-amber-50': !isSelected && !isHighlighted,
          'ring-2 ring-purple-500 ring-inset': isFocused
        }
      )}
      role="gridcell"
      aria-label={`${KANJI_NUMBERS[rowIndex]}${9 - colIndex}${piece ? ` - ${piece.player === 'SENTE' ? '先手' : '後手'}の${piece.type}` : ' - 空のマス'}`}
      onKeyDown={handleKeyDown}
      onClick={piece ? undefined : handleCellClick} // 駒がない場合のみセル全体をクリック可能に
      onFocus={() => onFocus(position)} // セルがフォーカスされたときに親コンポーネントに通知
    >
      {piece ? (
        <PieceUI
          piece={piece}
          size="sm"
          onClick={() => {
            onPieceClick?.(piece);
            onFocus(position); // 駒がクリックされた時もフォーカスを移動
          }}
          className="absolute inset-1"
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
export const BoardCell = React.memo(BoardCellComponent);