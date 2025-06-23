import { IPiece, IBoard } from './interface';
import { PieceType, Player, Position, Move } from './types';

/**
 * 駒の基底クラス
 */
export class Piece implements IPiece {
  readonly type: PieceType;
  readonly player: Player;
  readonly position: Position | null;

  constructor(type: PieceType, player: Player, position: Position | null = null) {
    this.type = type;
    this.player = player;
    this.position = position;
  }

  /**
   * 移動可能な位置を計算（基底クラスでは空配列）
   * @param _board 現在の盤面状態
   * @returns 移動可能な位置の配列
   */
  getValidMoves(_board: IBoard): Move[] {
    return [];
  }

  /**
   * 成り駒への変換が可能かチェック
   * @param to 移動先の位置
   * @returns 成り可能な場合true
   */
  canPromote(to: Position): boolean {
    // 持ち駒は成れない
    if (!this.position) {
      return false;
    }

    // 金と玉は成れない
    if (this.type === PieceType.GOLD || this.type === PieceType.KING) {
      return false;
    }

    // すでに成り駒は成れない
    if (this.isPromoted()) {
      return false;
    }

    // 先手の場合：敵陣は1-3段目
    if (this.player === Player.SENTE) {
      return to.row <= 3 || this.position.row <= 3;
    }
    
    // 後手の場合：敵陣は7-9段目
    return to.row >= 7 || this.position.row >= 7;
  }

  /**
   * 成り駒に変換
   * @returns 成り駒のインスタンス
   */
  promote(): IPiece {
    const promotionMap: Partial<Record<PieceType, PieceType>> = {
      [PieceType.ROOK]: PieceType.DRAGON,
      [PieceType.BISHOP]: PieceType.HORSE,
      [PieceType.SILVER]: PieceType.PROMOTED_SILVER,
      [PieceType.KNIGHT]: PieceType.PROMOTED_KNIGHT,
      [PieceType.LANCE]: PieceType.PROMOTED_LANCE,
      [PieceType.PAWN]: PieceType.TOKIN,
    };

    const promotedType = promotionMap[this.type];
    if (!promotedType) {
      throw new Error('この駒は成ることができません');
    }

    return new Piece(promotedType, this.player, this.position);
  }

  /**
   * 駒を複製
   * @param position 新しい位置（省略時は現在位置）
   * @returns 複製された駒
   */
  clone(position?: Position): IPiece {
    return new Piece(this.type, this.player, position ?? this.position);
  }

  /**
   * 駒がすでに成り駒かチェック
   * @returns 成り駒の場合true
   */
  private isPromoted(): boolean {
    return [
      PieceType.DRAGON,
      PieceType.HORSE,
      PieceType.PROMOTED_SILVER,
      PieceType.PROMOTED_KNIGHT,
      PieceType.PROMOTED_LANCE,
      PieceType.TOKIN,
    ].includes(this.type);
  }
}