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
    const destinations = [
      { row: this.position.row - 1, column: this.position.column - 1 }, // 左上
      { row: this.position.row - 1, column: this.position.column },     // 上
      { row: this.position.row - 1, column: this.position.column + 1 }, // 右上
      { row: this.position.row,     column: this.position.column - 1 }, // 左
      { row: this.position.row,     column: this.position.column + 1 }, // 右
      { row: this.position.row + 1, column: this.position.column - 1 }, // 左下
      { row: this.position.row + 1, column: this.position.column },     // 下
      { row: this.position.row + 1, column: this.position.column + 1 }, // 右下
    ];

    for (const newPosition of destinations) {
      if (board.isValidPosition(newPosition)) {
        const pieceAtDestination = board.getPiece(newPosition);
        if (!pieceAtDestination || pieceAtDestination.player !== this.player) {
          moves.push({ from: this.position, to: newPosition });
        }
      }
    }
    return moves;
  }

  clone(position?: Position): King {
    return new King(this.player, position ?? this.position);
  }
}