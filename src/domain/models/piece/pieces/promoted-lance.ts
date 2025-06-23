import { Gold } from './gold';
import { PieceType, Player, Position } from '../types';

/**
 * 成香クラス
 * 金と同じ動きをする
 */
export class PromotedLance extends Gold {
  constructor(player: Player, position: Position | null = null) {
    super(player, position);
    // typeを成香に上書き
    Object.defineProperty(this, 'type', {
      value: PieceType.PROMOTED_LANCE,
      writable: false,
      enumerable: true,
      configurable: false,
    });
  }
}