import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position } from '../types';

/**
 * 玉クラス
 */
export class King extends Piece {
  constructor(player: Player, position: Position | null = null) {
    super(PieceType.KING, player, position);
  }

  /**
   * 王の移動可能な位置を計算する静的メソッド
   * @param piecePosition - 王の現在の位置
   * @param player - プレイヤー
   * @param board - 現在の盤面状態
   * @returns 移動可能な位置の配列
   */
  static getKingMoves(
    piecePosition: Position,
    player: Player,
    board: IBoard,
  ): Position[] {
    const moves: Position[] = [];
    const directions = [
      { row: -1, column: 0 },
      { row: 1, column: 0 },
      { row: 0, column: -1 },
      { row: 0, column: 1 },
      { row: -1, column: -1 },
      { row: -1, column: 1 },
      { row: 1, column: -1 },
      { row: 1, column: 1 },
    ];

    for (const dir of directions) {
      const nextPos = {
        row: piecePosition.row + dir.row,
        column: piecePosition.column + dir.column,
      };

      if (board.isValidPosition(nextPos)) {
        const piece = board.getPiece(nextPos);
        if (!piece || piece.player !== player) {
          moves.push(nextPos);
        }
      }
    }
    return moves;
  }

  getValidMoves(board: IBoard): Position[] {
    if (!this.position) return [];
    return King.getKingMoves(this.position, this.player, board);
  }

  clone(position?: Position): King {
    return new King(this.player, position ?? this.position);
  }
}