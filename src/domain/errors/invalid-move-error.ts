import { Position } from '../models/piece/types';

export class InvalidMoveError extends Error {
  constructor(public readonly from: Position) {
    super(`指定された位置(${from.row}, ${from.column})に駒が存在しません`);
    this.name = 'InvalidMoveError';
  }
} 