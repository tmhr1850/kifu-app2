import { Gold } from './gold';
import { PieceType, Player, Position } from '../types';

/**
 * と金クラス
 * 金と同じ動きをする
 */
export class Tokin extends Gold {
  constructor(player: Player, position: Position | null = null) {
    super(player, position);
    // typeをと金に上書き
    Object.defineProperty(this, 'type', {
      value: PieceType.TOKIN,
      writable: false,
      enumerable: true,
      configurable: false,
    });
  }
}