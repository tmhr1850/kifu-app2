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

    // 角の動き
    const bishopMoves = new Bishop(this.player, this.position).getValidMoves(board);

    // 王の動きの一部（上下左右）
    const kingLikeMoves: Move[] = [];
    const king = new King(this.player, this.position);
    const kingAllMoves = king.getValidMoves(board);

    // Bishopの動きは斜めのみなので、Kingの動きから直線的な動きだけをフィルタリング
    const bishopMovePositions = new Set(bishopMoves.map(m => `${m.to.row},${m.to.column}`));
    const kingStraightMoves = kingAllMoves.filter(kingMove => {
        const isDiagonal = Math.abs(kingMove.to.row - this.position!.row) === Math.abs(kingMove.to.column - this.position!.column)
        return !isDiagonal;
    });

    return [...bishopMoves, ...kingStraightMoves];
  }

  clone(position?: Position): Horse {
    return new Horse(this.player, position ?? this.position);
  }
}