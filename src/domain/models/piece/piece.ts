import { IPiece, IBoard } from './interface';
import { PieceType, Player, Position } from './types';

/**
 * 駒の基底クラス
 */
export abstract class Piece implements IPiece {
  readonly type: PieceType;
  readonly player: Player;
  position: Position | null;

  constructor(type: PieceType, player: Player, position: Position | null = null) {
    this.type = type;
    this.player = player;
    this.position = position;
  }

  /**
   * 移動可能な位置を計算（各駒クラスで実装）
   * @param board 現在の盤面状態
   * @returns 移動可能な位置の配列
   */
  abstract getValidMoves(board: IBoard): Position[];


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
  ): IPiece {
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

    return createPiece(promotedType, this.player, this.position);
  }

  /**
   * 駒を複製
   * @param position 新しい位置（省略時は現在位置）
   * @returns 複製された駒
   */
  abstract clone(position?: Position): IPiece;

  /**
   * 他の駒インスタンスと等価であるか比較
   * @param otherPiece 比較対象の駒
   * @returns 等価である場合true
   */
  public equals(otherPiece: IPiece | null): boolean {
    if (otherPiece === null) {
      return false;
    }
    return (
      this.type === otherPiece.type &&
      this.player === otherPiece.player &&
      this.position?.row === otherPiece.position?.row &&
      this.position?.column === otherPiece.position?.column
    );
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