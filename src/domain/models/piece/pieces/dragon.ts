import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position } from '../types';
import { King } from './king';
import { Rook } from './rook';

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
  getValidMoves(board: IBoard): Position[] {
    if (!this.position) return [];

    const moveSet = new Map<string, Position>();

    // 飛車の動き
    const rookMoves = Rook.getRookMoves(this.position, this.player, board);
    for (const pos of rookMoves) {
      const key = `${pos.row},${pos.column}`;
      moveSet.set(key, pos);
    }

    // 王の動き（斜め方向のみ）
    const kingAllMoves = King.getKingMoves(this.position, this.player, board);
    const kingDiagonalMoves = kingAllMoves.filter(pos => {
      return (
        Math.abs(pos.row - this.position!.row) === 1 &&
        Math.abs(pos.column - this.position!.column) === 1
      );
    });

    for (const pos of kingDiagonalMoves) {
      const key = `${pos.row},${pos.column}`;
      moveSet.set(key, pos);
    }

    return Array.from(moveSet.values());
  }

  clone(position?: Position): Dragon {
    return new Dragon(this.player, position ?? this.position);
  }
}