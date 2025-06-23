import { Piece } from '../piece';
import { PieceType, Player, Position, Move } from '../types';
import { IBoard } from '../interface';

/**
 * 馬（成り角）クラス
 */
export class Horse extends Piece {
  constructor(player: Player, position: Position | null = null) {
    super(PieceType.HORSE, player, position);
  }

  /**
   * 馬の移動可能な位置を計算
   * 角の動き（斜め自由）＋ 縦横1マス
   * @param board 現在の盤面状態
   * @returns 移動可能な位置の配列
   */
  getValidMoves(board: IBoard): Move[] {
    if (!this.position) {
      return [];
    }

    const moves: Move[] = [];
    
    // 角と同じ斜めの動き
    const diagonalDirections = [
      { dr: -1, dc: -1 }, // 左上
      { dr: -1, dc: 1 },  // 右上
      { dr: 1, dc: -1 },  // 左下
      { dr: 1, dc: 1 },   // 右下
    ];

    for (const { dr, dc } of diagonalDirections) {
      // 各方向に進めるだけ進む
      for (let i = 1; i <= 8; i++) {
        const newPosition: Position = {
          row: this.position.row + dr * i,
          column: this.position.column + dc * i,
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
            });
          }
          // 駒があったらそれ以上進めない
          break;
        }

        moves.push({
          from: this.position,
          to: newPosition,
        });
      }
    }

    // 縦横1マスの動き
    const straightDirections = [
      { dr: -1, dc: 0 }, // 上
      { dr: 1, dc: 0 },  // 下
      { dr: 0, dc: -1 }, // 左
      { dr: 0, dc: 1 },  // 右
    ];

    for (const { dr, dc } of straightDirections) {
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