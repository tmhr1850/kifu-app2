import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position } from '../types';
import { Bishop } from './bishop';
import { King } from './king';

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
  getValidMoves(board: IBoard): Position[] {
    if (!this.position) return [];

    const moveSet = new Map<string, Position>();

    // 角の動き
    const bishop = new Bishop(this.player, this.position);
    const bishopMoves = bishop.getValidMoves(board);
    for (const pos of bishopMoves) {
      const key = `${pos.row},${pos.column}`;
      moveSet.set(key, pos);
    }

    // 王の動きの一部（前方、左右、後方）
    const king = new King(this.player, this.position);
    const kingAllMoves = king.getValidMoves(board);
    const nonDiagonalKingMoves = kingAllMoves.filter(pos => {
      const dy = Math.abs(pos.row - this.position!.row);
      const dx = Math.abs(pos.column - this.position!.column);
      // 縦横の動き (dx+dy=1) のみを追加
      return dx + dy === 1;
    });

    for (const pos of nonDiagonalKingMoves) {
      const key = `${pos.row},${pos.column}`;
      moveSet.set(key, pos);
    }

    return Array.from(moveSet.values());
  }

  clone(position?: Position): Horse {
    return new Horse(this.player, position ?? this.position);
  }
}