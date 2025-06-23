import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position, Move } from '../types';

/**
 * 歩クラス
 */
export class Pawn extends Piece {
  constructor(player: Player, position: Position | null = null) {
    super(PieceType.PAWN, player, position);
  }

  /**
   * 歩の移動可能な位置を計算
   * 前方1マスのみ移動可能
   * @param board 現在の盤面状態
   * @returns 移動可能な位置の配列
   */
  getValidMoves(board: IBoard): Move[] {
    if (!this.position) {
      return [];
    }

    const moves: Move[] = [];
    const forward = this.player === Player.SENTE ? -1 : 1;

    const newPosition: Position = {
      row: this.position.row + forward,
      column: this.position.column,
    };

    if (!board.isValidPosition(newPosition)) {
      return moves;
    }

    const pieceAtDestination = board.getPieceAt(newPosition);
    
    // 移動先に味方の駒がある場合は移動不可
    if (pieceAtDestination && pieceAtDestination.player === this.player) {
      return moves;
    }

    moves.push({
      from: this.position,
      to: newPosition,
      isPromotion: this.canPromote(newPosition),
    });

    return moves;
  }
}