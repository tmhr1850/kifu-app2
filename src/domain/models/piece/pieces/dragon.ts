import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position } from '../types';

/**
 * 竜（成り飛車）クラス
 */
export class Dragon extends Piece {
  // 斜め方向の相対移動を定義（1マスのみ）
  private static readonly DIAGONAL_OFFSETS = [
    { row: -1, column: -1 },
    { row: -1, column: 1 },
    { row: 1, column: -1 },
    { row: 1, column: 1 }
  ];

  constructor(player: Player, position: Position | null = null) {
    super(PieceType.DRAGON, player, position);
  }

  /**
   * 竜の移動可能な位置を計算
   * 飛車の動き（縦横自由）＋ 斜め1マス
   * @param board 現在の盤面状態
   * @returns 移動可能な位置の配列
   */
  getValidMoves(board: IBoard): Position[] {
    if (!this.position) return [];

    const moves: Position[] = [];

    // 飛車の動き（縦横の直線移動）を直接実装
    // 上方向
    for (let row = this.position.row - 1; row >= 0; row--) {
      const pos = { row, column: this.position.column };
      const piece = board.getPiece(pos);
      if (!piece) {
        moves.push(pos);
      } else {
        if (piece.player !== this.player) {
          moves.push(pos);
        }
        break;
      }
    }

    // 下方向
    for (let row = this.position.row + 1; row < 9; row++) {
      const pos = { row, column: this.position.column };
      const piece = board.getPiece(pos);
      if (!piece) {
        moves.push(pos);
      } else {
        if (piece.player !== this.player) {
          moves.push(pos);
        }
        break;
      }
    }

    // 左方向
    for (let column = this.position.column - 1; column >= 0; column--) {
      const pos = { row: this.position.row, column };
      const piece = board.getPiece(pos);
      if (!piece) {
        moves.push(pos);
      } else {
        if (piece.player !== this.player) {
          moves.push(pos);
        }
        break;
      }
    }

    // 右方向
    for (let column = this.position.column + 1; column < 9; column++) {
      const pos = { row: this.position.row, column };
      const piece = board.getPiece(pos);
      if (!piece) {
        moves.push(pos);
      } else {
        if (piece.player !== this.player) {
          moves.push(pos);
        }
        break;
      }
    }

    // 斜め1マスの動き
    for (const offset of Dragon.DIAGONAL_OFFSETS) {
      const newRow = this.position.row + offset.row;
      const newColumn = this.position.column + offset.column;
      
      if (newRow >= 0 && newRow < 9 && newColumn >= 0 && newColumn < 9) {
        const pos = { row: newRow, column: newColumn };
        const piece = board.getPiece(pos);
        
        if (!piece || piece.player !== this.player) {
          moves.push(pos);
        }
      }
    }

    return moves;
  }

  clone(position?: Position): Dragon {
    return new Dragon(this.player, position ?? this.position);
  }
}