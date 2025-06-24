/**
 * 駒の種類を表すEnum
 */
export enum PieceType {
  KING = 'KING',           // 玉
  ROOK = 'ROOK',           // 飛車
  BISHOP = 'BISHOP',       // 角
  GOLD = 'GOLD',           // 金
  SILVER = 'SILVER',       // 銀
  KNIGHT = 'KNIGHT',       // 桂馬
  LANCE = 'LANCE',         // 香車
  PAWN = 'PAWN',           // 歩
  DRAGON = 'DRAGON',       // 竜（成り飛車）
  HORSE = 'HORSE',         // 馬（成り角）
  PROMOTED_SILVER = 'PROMOTED_SILVER', // 成銀
  PROMOTED_KNIGHT = 'PROMOTED_KNIGHT', // 成桂
  PROMOTED_LANCE = 'PROMOTED_LANCE',   // 成香
  TOKIN = 'TOKIN',         // と金（成り歩）
}

/**
 * プレイヤーを表すEnum
 */
export enum Player {
  SENTE = 'SENTE', // 先手
  GOTE = 'GOTE',   // 後手
}

/**
 * 駒の位置を表す型
 * @deprecated Position クラスを使用してください
 */
export interface Position {
  row: number;    // 1-9
  column: number; // 1-9
}

// Position クラスを再エクスポート
export { Position as PositionClass } from '../position';

/**
 * 移動可能な位置の型
 */
export interface Move {
  from: Position;
  to: Position;
  isPromotion?: boolean; // 成りの可否
}

/**
 * 持ち駒の最大枚数を定義する定数
 */
export const MAX_PIECES_IN_HAND: Record<PieceType, number> = {
  [PieceType.ROOK]: 2,
  [PieceType.BISHOP]: 2,
  [PieceType.GOLD]: 4,
  [PieceType.SILVER]: 4,
  [PieceType.KNIGHT]: 4,
  [PieceType.LANCE]: 4,
  [PieceType.PAWN]: 18,
  // 玉、成り駒は持ち駒にならない
  [PieceType.KING]: 0,
  [PieceType.DRAGON]: 0,
  [PieceType.HORSE]: 0,
  [PieceType.PROMOTED_SILVER]: 0,
  [PieceType.PROMOTED_KNIGHT]: 0,
  [PieceType.PROMOTED_LANCE]: 0,
  [PieceType.TOKIN]: 0,
};