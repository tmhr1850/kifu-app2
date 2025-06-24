import { PieceType } from '@/domain/models/piece/types';

export const isPromoted = (type: PieceType): boolean => {
  return [
    PieceType.DRAGON,
    PieceType.HORSE,
    PieceType.PROMOTED_SILVER,
    PieceType.PROMOTED_KNIGHT,
    PieceType.PROMOTED_LANCE,
    PieceType.TOKIN,
  ].includes(type);
}; 