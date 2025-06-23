import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position, Move } from '../types';

/**
 * 香車クラス
 */
export class Lance extends Piece {
  constructor(player: Player, position: Position | null = null) {
    super(PieceType.LANCE, player, position);
  }

  /**
   * 香車の移動可能な位置を計算
   * 前方に自由に移動可能（他の駒を飛び越えることはできない）
   * @param board 現在の盤面状態
   * @returns 移動可能な位置の配列
   */
  getValidMoves(board: IBoard): Move[] {
    if (!this.position) {
      return [];
    }

    const moves: Move[] = [];
    const forward = this.player === Player.SENTE ? -1 : 1;

    // 前方に進めるだけ進む
    for (let i = 1; i <= 8; i++) {
      const newPosition: Position = {
        row: this.position.row + forward * i,
        column: this.position.column,
      };

      if (!board.isValidPosition(newPosition)) {
        break;
      }

      const pieceAtDestination = board.getPieceAt(newPosition);
      
      if (pieceAtDestination) {
        // 敵の駒なら取れる
        if (pieceAtDestination.player !== this.player) {
          moves.push({
            from: this.position,
            to: newPosition,
            isPromotion: this.canPromote(newPosition),
          });
        }
        // 駒があったらそれ以上進めない
        break;
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