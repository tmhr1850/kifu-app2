import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position, Move } from '../types';
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
  getValidMoves(board: IBoard): Move[] {
    if (!this.position) return [];

    // 飛車の動き
    const rookMoves = new Rook(this.player, this.position).getValidMoves(board);

    // 王の動きの一部（斜め）
    const king = new King(this.player, this.position);
    const kingAllMoves = king.getValidMoves(board);

    // Rookの動きは直線のみなので、Kingの動きから斜めの動きだけをフィルタリング
    const kingDiagonalMoves = kingAllMoves.filter(kingMove => {
        return Math.abs(kingMove.to.row - this.position!.row) === Math.abs(kingMove.to.column - this.position!.column)
    });

    return [...rookMoves, ...kingDiagonalMoves];
  }

  clone(position?: Position): Dragon {
    return new Dragon(this.player, position ?? this.position);
  }
}