import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position } from '../types';

/**
 * 角クラス
 */
export class Bishop extends Piece {
  constructor(player: Player, position: Position | null = null) {
    super(PieceType.BISHOP, player, position);
  }

  /**
   * 角の移動可能な位置を計算
   * 斜めに自由に移動可能（他の駒を飛び越えることはできない）
   * @param board 現在の盤面状態
   * @returns 移動可能な位置の配列
   */
  getValidMoves(board: IBoard): Position[] {
    if (!this.position) {
      return [];
    }

    const moves: Position[] = [];
    const directions = [
      { dr: -1, dc: -1 }, // 左上
      { dr: -1, dc: 1 },  // 右上
      { dr: 1, dc: -1 },  // 左下
      { dr: 1, dc: 1 },   // 右下
    ];

    for (const { dr, dc } of directions) {
      // 各方向に進めるだけ進む
      for (let i = 1; i <= 8; i++) {
        const newPosition: Position = {
          row: this.position.row + dr * i,
          column: this.position.column + dc * i,
        };

        if (!board.isValidPosition(newPosition)) {
          break;
        }

        const pieceAtDestination = board.getPiece(newPosition);
        
        if (pieceAtDestination) {
          // 敵の駒なら取れる
          if (pieceAtDestination.player !== this.player) {
            moves.push(newPosition);
          }
          // 駒があったらそれ以上進めない
          break;
        }

        moves.push(newPosition);
      }
    }

    return moves;
  }

  clone(position?: Position): Bishop {
    return new Bishop(this.player, position ?? this.position);
  }
}