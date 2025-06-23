import { Piece } from '../piece';
import { PieceType, Player, Position, Move } from '../types';
import { IBoard } from '../interface';

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
  getValidMoves(board: IBoard): Move[] {
    if (!this.position) {
      return [];
    }

    const moves: Move[] = [];
    const forward = this.player === Player.SENTE ? -2 : 2;
    
    // 桂馬の移動先（前方斜め2マス）
    const destinations = [
      { row: this.position.row + forward, column: this.position.column - 1 },
      { row: this.position.row + forward, column: this.position.column + 1 },
    ];

    for (const newPosition of destinations) {
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
        isPromotion: this.canPromote(newPosition),
      });
    }

    return moves;
  }
}