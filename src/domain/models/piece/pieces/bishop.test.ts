import { describe, it, expect } from 'vitest';

import { Player, PieceType } from '../types';
import { Bishop } from './bishop';

describe('Bishop', () => {
  it('should have the correct type and player', () => {
    const bishop = new Bishop(Player.SENTE, { row: 0, column: 0 });
    expect(bishop.type).toBe(PieceType.BISHOP);
    expect(bishop.player).toBe(Player.SENTE);
  });
});