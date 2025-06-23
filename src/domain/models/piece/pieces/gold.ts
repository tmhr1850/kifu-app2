import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position, Move } from '../types';

/**
 * 金クラス
 */
export class Gold extends Piece {
  constructor(player: Player, position: Position | null = null) {
    super(PieceType.GOLD, player, position);
  }

  /**
   * 金の移動可能な位置を計算
   * 前方3マス、横2マス、後方1マスに移動可能（斜め後ろは不可）
   * @param board 現在の盤面状態
   * @returns 移動可能な位置の配列
   */
  getValidMoves(board: IBoard): Move[] {
    if (!this.position) {
      return [];
    }
    const moves: Move[] = [];
    const forward = this.player === Player.SENTE ? -1 : 1;
    const destinations = [
      { row: this.position.row + forward, column: this.position.column }, // 前
      { row: this.position.row + forward, column: this.position.column - 1 }, // 左前
      { row: this.position.row + forward, column: this.position.column + 1 }, // 右前
      { row: this.position.row, column: this.position.column - 1 }, // 左
      { row: this.position.row, column: this.position.column + 1 }, // 右
      { row: this.position.row - forward, column: this.position.column }, // 後
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

  clone(position?: Position): Gold {
    return new Gold(this.player, position ?? this.position);
  }
}