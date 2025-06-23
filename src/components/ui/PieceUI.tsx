'use client';

import React from 'react';

import { Piece, PieceOwner } from '@/domain/models/Piece';

interface PieceUIProps {
  piece: Piece;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-base',
  md: 'w-10 h-10 text-lg',
  lg: 'w-12 h-12 text-xl',
};

export const PieceUI: React.FC<PieceUIProps> = ({ piece, size = 'md' }) => {
  const kanji = piece.getKanji();
  const isGote = piece.owner === PieceOwner.GOTE;
  const isPromoted = piece.isPromoted;

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${isGote ? 'rotate-180' : ''}
        ${isPromoted ? 'text-red-600' : 'text-gray-900'}
        flex items-center justify-center
        bg-yellow-100 
        border-2 border-yellow-600
        rounded-sm
        font-bold
        cursor-pointer
        transition-transform duration-150
        hover:scale-110
        select-none
      `}
      data-piece-type={piece.type}
      data-piece-owner={piece.owner}
      data-is-promoted={piece.isPromoted}
    >
      {kanji}
    </div>
  );
};