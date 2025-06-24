'use client';

import React, { useCallback } from 'react';

import { IPiece } from '@/domain/models/piece/interface';
import { Player } from '@/domain/models/piece/types';
import { cn } from '@/lib/utils';

import { pieceKanji, sizeClasses } from './const';
import { isPromoted } from './utils';

interface PieceUIProps {
  piece: IPiece;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (piece: IPiece) => void;
  className?: string;
  'aria-describedby'?: string;
  tabIndex?: number;
}

export const PieceUI: React.FC<PieceUIProps> = React.memo(
  ({ piece, size = 'md', onClick, className = '', 'aria-describedby': ariaDescribedBy, tabIndex }) => {
    const kanji = pieceKanji[piece.type];
    const isGote = piece.player === Player.GOTE;
    const isPromotedPiece = isPromoted(piece.type);

    const handleClick = useCallback(() => {
      onClick?.(piece);
    }, [onClick, piece]);

    return (
      <button
        type="button"
        className={cn(
          sizeClasses[size],
          'bg-yellow-100',
          'border-2 border-gray-800 rounded-lg',
          'flex items-center justify-center',
          'font-bold cursor-pointer',
          'transition-transform hover:scale-110 shadow-md',
          {
            'rotate-180': isGote,
          },
          className,
        )}
        onClick={handleClick}
        draggable={true}
        data-piece-type={piece.type}
        data-player={piece.player}
        aria-label={`${piece.player === Player.SENTE ? '先手' : '後手'}の${kanji}`}
        aria-describedby={ariaDescribedBy}
        tabIndex={tabIndex}
        role="button"
        aria-pressed={false}
      >
        <span
          className={cn('select-none', {
            'text-red-600': isPromotedPiece,
            'text-gray-900': !isPromotedPiece,
          })}
        >
          {kanji}
        </span>
      </button>
    );
  },
);

PieceUI.displayName = 'PieceUI';