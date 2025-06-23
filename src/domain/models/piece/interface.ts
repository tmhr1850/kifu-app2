import { PieceType, Player, Position, Move } from './types';

/**
 * 駒のインターフェース
 */
export interface IPiece {
  /** 駒の種類 */
  readonly type: PieceType;
  
  /** 駒の所有者 */
  readonly player: Player;
  
  /** 現在の位置 */
  readonly position: Position | null;
  
  /**
   * 指定された盤面で移動可能な位置を計算
   * @param board 現在の盤面状態
   * @returns 移動可能な位置の配列
   */
  getValidMoves(board: IBoard): Move[];
  
  /**
   * 成り駒への変換が可能かチェック
   * @param to 移動先の位置
   * @returns 成り可能な場合true
   */
  canPromote(to: Position): boolean;
  
  /**
   * 成り駒に変換
   * @returns 成り駒のインスタンス
   */
  promote(): IPiece;
  
  /**
   * 駒を複製
   * @param position 新しい位置（省略時は現在位置）
   * @returns 複製された駒
   */
  clone(position?: Position): IPiece;
}

/**
 * 盤面のインターフェース（簡易版）
 */
export interface IBoard {
  /**
   * 指定位置の駒を取得
   * @param position 位置
   * @returns 駒またはnull
   */
  getPieceAt(position: Position): IPiece | null;
  
  /**
   * 指定位置が盤面内かチェック
   * @param position 位置
   * @returns 盤面内の場合true
   */
  isValidPosition(position: Position): boolean;
}