import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position, Move } from '../types';
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
  getValidMoves(board: IBoard): Move[] {
    if (!this.position) return [];

    const moves: Move[] = [];

    // 角の動き
    const bishop = new Bishop(this.player, this.position);
    moves.push(...bishop.getValidMoves(board));

    // 王の動きの一部（前方、左右、後方）
    const king = new King(this.player, this.position);
    const kingAllMoves = king.getValidMoves(board);
    moves.push(...kingAllMoves);

    return moves;
  }

  clone(position?: Position): Horse {
    return new Horse(this.player, position ?? this.position);
  }
}