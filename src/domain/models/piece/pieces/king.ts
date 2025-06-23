import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position, Move } from '../types';

/**
 * 玉クラス
 */
export class King extends Piece {
  constructor(player: Player, position: Position | null = null) {
    super(PieceType.KING, player, position);
  }

  /**
   * 玉の移動可能な位置を計算
   * 周囲8マスに移動可能
   * @param board 現在の盤面状態
   * @returns 移動可能な位置の配列
   */
  getValidMoves(board: IBoard): Move[] {
    if (!this.position) {
      return [];
    }

    const moves: Move[] = [];
    const directions = [
      { dr: -1, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
      { dr: 0, dc: -1 },                     { dr: 0, dc: 1 },
      { dr: 1, dc: -1 },  { dr: 1, dc: 0 },  { dr: 1, dc: 1 },
    ];

    for (const { dr, dc } of directions) {
      const newPosition: Position = {
        row: this.position.row + dr,
        column: this.position.column + dc,
      };

      if (!board.isValidPosition(newPosition)) {
        continue;
      }

      const pieceAtDestination = board.getPieceAt(newPosition);
      
      // 移動先に味方の駒がある場合は移動不可
      if (pieceAtDestination && pieceAtDestination.player === this.player) {
        continue;
      }

      moves.push({
        from: this.position,
        to: newPosition,
      });
    }

    return moves;
  }
}