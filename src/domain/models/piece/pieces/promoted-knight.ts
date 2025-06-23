import { Gold } from './gold';
import { PieceType, Player, Position } from '../types';

/**
 * 成桂クラス
 * 金と同じ動きをする
 */
export class PromotedKnight extends Gold {
  constructor(player: Player, position: Position | null = null) {
    super(player, position);
    // typeを成桂に上書き
    Object.defineProperty(this, 'type', {
      value: PieceType.PROMOTED_KNIGHT,
      writable: false,
      enumerable: true,
      configurable: false,
    });
  }
}