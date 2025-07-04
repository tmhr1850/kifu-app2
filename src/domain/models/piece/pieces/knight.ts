import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position } from '../types';

/**
 * 桂馬クラス
 */
export class Knight extends Piece {
  constructor(player: Player, position: Position | null = null) {
    super(PieceType.KNIGHT, player, position);
  }

  /**
   * 桂馬の移動可能な位置を計算
   * 前方斜め2マスに移動可能（他の駒を飛び越えることができる）
   * @param board 現在の盤面状態
   * @returns 移動可能な位置の配列
   */
  getValidMoves(board: IBoard): Position[] {
    if (!this.position) {
      return [];
    }
    const moves: Position[] = [];
    // 先手は敵陣に向かう（row減少）、後手は先手陣に向かう（row増加）
    const forward = this.player === Player.SENTE ? -1 : 1;
    const newPositions: Position[] = [
      { row: this.position.row + 2 * forward, column: this.position.column + 1 },
      { row: this.position.row + 2 * forward, column: this.position.column - 1 },
    ];

    for (const newPosition of newPositions) {
      if (board.isValidPosition(newPosition)) {
        const pieceAtDestination = board.getPiece(newPosition);
        if (!pieceAtDestination || pieceAtDestination.player !== this.player) {
          moves.push(newPosition);
        }
      }
    }
    return moves;
  }

  clone(position?: Position): Knight {
    return new Knight(this.player, position ?? this.position);
  }
}