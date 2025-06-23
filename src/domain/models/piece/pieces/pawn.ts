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
  getValidMoves(board: IBoard): Position[] {
    const moves: Position[] = [];
    if (!this.position) return moves;

    const direction = this.player === Player.SENTE ? -1 : 1;
    const nextRow = this.position.row + direction;
    const nextPosition = { row: nextRow, column: this.position.column };

    if (board.isValidPosition(nextPosition)) {
      const piece = board.getPiece(nextPosition);
      if (!piece || piece.player !== this.player) {
        moves.push(nextPosition);
      }
    }

    return moves;
  }

  clone(position?: Position): Pawn {
    return new Pawn(this.player, position ?? this.position);
  }
}