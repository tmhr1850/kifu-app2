import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position, Move } from '../types';
import { Gold } from './gold';

/**
 * 成桂クラス
 * 金と同じ動きをする
 */
export class PromotedKnight extends Piece {
  constructor(player: Player, position: Position | null = null) {
    super(PieceType.PROMOTED_KNIGHT, player, position);
  }

  getValidMoves(board: IBoard): Move[] {
    const gold = new Gold(this.player, this.position);
    return gold.getValidMoves(board);
  }

  clone(position?: Position): PromotedKnight {
    return new PromotedKnight(this.player, position ?? this.position);
  }
}