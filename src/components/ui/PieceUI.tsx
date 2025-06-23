'use client';

import React from 'react';

import { IPiece } from '@/domain/models/piece/interface';
import { PieceType, Player } from '@/domain/models/piece/types';

interface PieceUIProps {
  piece: IPiece;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (piece: IPiece) => void;
  className?: string;
}

const pieceKanji: Record<PieceType, string> = {
  [PieceType.KING]: '王',
  [PieceType.ROOK]: '飛',
  [PieceType.BISHOP]: '角',
  [PieceType.GOLD]: '金',
  [PieceType.SILVER]: '銀',
  [PieceType.KNIGHT]: '桂',
  [PieceType.LANCE]: '香',
  [PieceType.PAWN]: '歩',
  [PieceType.DRAGON]: '竜',
  [PieceType.HORSE]: '馬',
  [PieceType.PROMOTED_SILVER]: '全',
  [PieceType.PROMOTED_KNIGHT]: '圭',
  [PieceType.PROMOTED_LANCE]: '杏',
  [PieceType.TOKIN]: 'と',
};

const isPromoted = (type: PieceType): boolean => {
  return [
    PieceType.DRAGON,
    PieceType.HORSE,
    PieceType.PROMOTED_SILVER,
    PieceType.PROMOTED_KNIGHT,
    PieceType.PROMOTED_LANCE,
    PieceType.TOKIN,
  ].includes(type);
};

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
};

export const PieceUI: React.FC<PieceUIProps> = ({ 
  piece, 
  size = 'md', 
  onClick,
  className = ''
}) => {
  const kanji = pieceKanji[piece.type];
  const isGote = piece.player === Player.GOTE;
  const isPromotedPiece = isPromoted(piece.type);

  const handleClick = () => {
    if (onClick) {
      onClick(piece);
    }
  };

  return (
    <button
      className={`
        ${sizeClasses[size]}
        ${isGote ? 'rotate-180' : ''}
        ${isPromotedPiece ? 'text-red-600' : 'text-gray-900'}
        bg-yellow-100
        border-2
        border-gray-800
        rounded-lg
        flex
        items-center
        justify-center
        font-bold
        cursor-pointer
        transition-transform
        hover:scale-110
        shadow-md
        ${className}
      `}
      onClick={handleClick}
      draggable={true}
      data-piece-type={piece.type}
      data-player={piece.player}
    >
      <span className="select-none">{kanji}</span>
    </button>
  );
};