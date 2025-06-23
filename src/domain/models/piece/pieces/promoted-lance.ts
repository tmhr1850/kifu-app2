import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position, Move } from '../types';
import { Gold } from './gold';

/**
 * 成香クラス
 * 金と同じ動きをする
 */
export class PromotedLance extends Piece {
  constructor(player: Player, position: Position | null = null) {
    super(PieceType.PROMOTED_LANCE, player, position);
  }

  getValidMoves(board: IBoard): Move[] {
    // 成香の動きは金と同じ
    const gold = new Gold(this.player, this.position);
    return gold.getValidMoves(board);
  }

  clone(position?: Position): PromotedLance {
    return new PromotedLance(this.player, position ?? this.position);
  }
}