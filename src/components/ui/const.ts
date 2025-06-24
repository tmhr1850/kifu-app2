import { PieceType } from '@/domain/models/piece/types';

export const pieceKanji: Record<PieceType, string> = {
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

export const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
}; 