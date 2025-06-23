import { IPiece } from './interface';
import {
  King,
  Rook,
  Bishop,
  Gold,
  Silver,
  Knight,
  Lance,
  Pawn,
  Dragon,
  Horse,
  PromotedSilver,
  PromotedKnight,
  PromotedLance,
  Tokin,
} from './pieces';
import { PieceType, Player, Position } from './types';

/**
 * 駒を作成するファクトリ関数
 * @param type 駒の種類
 * @param player プレイヤー
 * @param position 位置（オプション）
 * @returns 作成された駒
 */
export function createPiece(
  type: PieceType,
  player: Player,
  position: Position | null = null
): IPiece {
  switch (type) {
    case PieceType.KING:
      return new King(player, position);
    case PieceType.ROOK:
      return new Rook(player, position);
    case PieceType.BISHOP:
      return new Bishop(player, position);
    case PieceType.GOLD:
      return new Gold(player, position);
    case PieceType.SILVER:
      return new Silver(player, position);
    case PieceType.KNIGHT:
      return new Knight(player, position);
    case PieceType.LANCE:
      return new Lance(player, position);
    case PieceType.PAWN:
      return new Pawn(player, position);
    case PieceType.DRAGON:
      return new Dragon(player, position);
    case PieceType.HORSE:
      return new Horse(player, position);
    case PieceType.PROMOTED_SILVER:
      return new PromotedSilver(player, position);
    case PieceType.PROMOTED_KNIGHT:
      return new PromotedKnight(player, position);
    case PieceType.PROMOTED_LANCE:
      return new PromotedLance(player, position);
    case PieceType.TOKIN:
      return new Tokin(player, position);
    default:
      throw new Error(`不明な駒の種類: ${type}`);
  }
}