import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position } from '../types';
import { Gold } from './gold';

/**
 * 成銀クラス
 * 金と同じ動きをする
 */
export class PromotedSilver extends Piece {
  constructor(player: Player, position: Position | null = null) {
    super(PieceType.PROMOTED_SILVER, player, position);
  }

  getValidMoves(board: IBoard): Position[] {
    const gold = new Gold(this.player, this.position);
    return gold.getValidMoves(board);
  }

  clone(position?: Position): PromotedSilver {
    return new PromotedSilver(this.player, position ?? this.position);
  }
}