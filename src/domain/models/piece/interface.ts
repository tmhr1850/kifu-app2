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
   * @param board 盤面の状態
   * @returns 移動可能な位置の配列
   */
  getValidMoves(board: IBoard): Position[];
  
  
  /**
   * 成り駒に変換
   * @param createPiece 駒を生成するファクトリ関数
   * @returns 成り駒のインスタンス
   */
  promote(
    createPiece: (
      type: PieceType,
      player: Player,
      position: Position | null,
    ) => IPiece,
  ): IPiece;
  
  /**
   * 駒を複製
   * @param position 新しい位置（省略時は現在位置）
   * @returns 複製された駒
   */
  clone(position?: Position): IPiece;

  /**
   * 他の駒インスタンスと等価であるか比較
   * @param otherPiece 比較対象の駒
   * @returns 等価である場合true
   */
  equals(otherPiece: IPiece | null): boolean;

  /**
   * 駒がすでに成り駒かチェック
   * @returns 成り駒の場合true
   */
  isPromoted(): boolean;
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
  getPiece(position: Position): IPiece | null;

  /**
   * 指定位置に駒を配置
   * @param position 位置
   * @param piece 配置する駒（nullで駒を削除）
   */
  setPiece(position: Position, piece: IPiece | null): void;

  /**
   * 指定位置が盤面内かチェック
   * @param position 位置
   * @returns 盤面内の場合true
   */
  isValidPosition(position: Position): boolean;

  /**
   * 盤面の状態を複製
   * @returns 複製された盤面
   */
  clone(): IBoard;

  /**
   * 指定されたプレイヤーの盤上の駒をすべて取得する
   * @param player プレイヤー
   * @returns 駒の配列
   */
  getPieces(player: Player): IPiece[];

  /**
   * 指定されたプレイヤーの王の位置を探す
   * @param player プレイヤー
   * @returns 王の座標、見つからなければnull
   */
  findKing(player: Player): Position | null;

  /**
   * 指定された手を適用した新しい盤面を返す
   * @param move 適用する手
   * @returns 手が適用された新しい盤面
   */
  applyMove(move: Move): IBoard;
}