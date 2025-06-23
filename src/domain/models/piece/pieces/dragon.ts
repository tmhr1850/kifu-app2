import { Piece } from '../piece';
import { PieceType, Player, Position, Move } from '../types';
import { IBoard } from '../interface';

/**
 * 竜（成り飛車）クラス
 */
export class Dragon extends Piece {
  constructor(player: Player, position: Position | null = null) {
    super(PieceType.DRAGON, player, position);
  }

  /**
   * 竜の移動可能な位置を計算
   * 飛車の動き（縦横自由）＋ 斜め1マス
   * @param board 現在の盤面状態
   * @returns 移動可能な位置の配列
   */
  getValidMoves(board: IBoard): Move[] {
    if (!this.position) {
      return [];
    }

    const moves: Move[] = [];
    
    // 飛車と同じ縦横の動き
    const straightDirections = [
      { dr: -1, dc: 0 }, // 上
      { dr: 1, dc: 0 },  // 下
      { dr: 0, dc: -1 }, // 左
      { dr: 0, dc: 1 },  // 右
    ];

    for (const { dr, dc } of straightDirections) {
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

    // 斜め1マスの動き
    const diagonalDirections = [
      { dr: -1, dc: -1 }, // 左上
      { dr: -1, dc: 1 },  // 右上
      { dr: 1, dc: -1 },  // 左下
      { dr: 1, dc: 1 },   // 右下
    ];

    for (const { dr, dc } of diagonalDirections) {
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