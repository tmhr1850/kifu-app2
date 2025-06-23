import { Gold } from './gold';
import { PieceType, Player, Position } from '../types';

/**
 * 成銀クラス
 * 金と同じ動きをする
 */
export class PromotedSilver extends Gold {
  constructor(player: Player, position: Position | null = null) {
    super(player, position);
    // typeを成銀に上書き
    Object.defineProperty(this, 'type', {
      value: PieceType.PROMOTED_SILVER,
      writable: false,
      enumerable: true,
      configurable: false,
    });
  }
}