import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position } from '../types';

/**
 * 飛車の駒クラス
 */
export class Rook extends Piece {
  constructor(player: Player, position: Position | null = null) {
    super(PieceType.ROOK, player, position);
  }

  /**
   * 飛車の移動可能な位置を計算する静的メソッド
   * @param piecePosition - 飛車の現在の位置
   * @param player - プレイヤー
   * @param board - 現在の盤面状態
   * @returns 移動可能な位置の配列
   */
  static getRookMoves(
    piecePosition: Position,
    player: Player,
    board: IBoard,
  ): Position[] {
    const moves: Position[] = [];
    const directions = [
      { row: -1, column: 0 }, // 上
      { row: 1, column: 0 }, // 下
      { row: 0, column: -1 }, // 左
      { row: 0, column: 1 }, // 右
    ];

    for (const dir of directions) {
      let nextPos = {
        row: piecePosition.row + dir.row,
        column: piecePosition.column + dir.column,
      };

      while (board.isValidPosition(nextPos)) {
        const piece = board.getPiece(nextPos);
        if (piece) {
          if (piece.player !== player) {
            moves.push(nextPos);
          }
          break;
        }
        moves.push(nextPos);
        nextPos = {
          row: nextPos.row + dir.row,
          column: nextPos.column + dir.column,
        };
      }
    }
    return moves;
  }

  getValidMoves(board: IBoard): Position[] {
    if (!this.position) return [];
    return Rook.getRookMoves(this.position, this.player, board);
  }

  clone(position?: Position): Rook {
    return new Rook(this.player, position ?? this.position);
  }
}