import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position } from '../types';
import { Gold } from './gold';

/**
 * と金クラス
 * 金と同じ動きをする
 */
export class Tokin extends Piece {
  constructor(player: Player, position: Position | null = null) {
    super(PieceType.TOKIN, player, position);
  }

  getValidMoves(board: IBoard): Position[] {
    const gold = new Gold(this.player, this.position);
    return gold.getValidMoves(board);
  }

  clone(position?: Position): Tokin {
    return new Tokin(this.player, position ?? this.position);
  }
}