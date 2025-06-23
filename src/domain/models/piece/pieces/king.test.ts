import { describe, it, expect, beforeEach } from 'vitest';

import { King } from './king';
import { Board } from '../../board/board';
import { Player, PieceType } from '../types';
import { createPiece } from '../factory';

describe('King', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it('should have the correct type and player', () => {
    const king = new King(Player.SENTE, { row: 0, column: 0 });
    expect(king.type).toBe(PieceType.KING);
    expect(king.player).toBe(Player.SENTE);
  });

  describe('getValidMoves', () => {
    it('全ての方向に1マスずつ移動できる', () => {
      const king = new King(Player.SENTE, { row: 4, column: 4 });
      board.setPiece({ row: 4, column: 4 }, king);

      const destinations = king.getValidMoves(board);

      expect(destinations).toHaveLength(8);
      expect(destinations).toContainEqual({ row: 3, column: 3 });
      expect(destinations).toContainEqual({ row: 3, column: 4 });
      expect(destinations).toContainEqual({ row: 3, column: 5 });
      expect(destinations).toContainEqual({ row: 4, column: 3 });
      expect(destinations).toContainEqual({ row: 4, column: 5 });
      expect(destinations).toContainEqual({ row: 5, column: 3 });
      expect(destinations).toContainEqual({ row: 5, column: 4 });
      expect(destinations).toContainEqual({ row: 5, column: 5 });
    });

    it('盤面の端では移動可能マスが制限される', () => {
      const king = new King(Player.SENTE, { row: 0, column: 0 });
      board.setPiece({ row: 0, column: 0 }, king);

      const destinations = king.getValidMoves(board);

      expect(destinations).toHaveLength(3);
      expect(destinations).toContainEqual({ row: 0, column: 1 });
      expect(destinations).toContainEqual({ row: 1, column: 0 });
      expect(destinations).toContainEqual({ row: 1, column: 1 });
    });

    it('味方の駒がある場所には移動できない', () => {
      const king = new King(Player.SENTE, { row: 4, column: 4 });
      const ally = new King(Player.SENTE, { row: 3, column: 4 });
      board.setPiece({ row: 4, column: 4 }, king);
      board.setPiece({ row: 3, column: 4 }, ally);

      const moves = king.getValidMoves(board);
      expect(moves).not.toContainEqual({ row: 3, column: 4 });
      expect(moves).toHaveLength(7);
    });

    it('持ち駒の場合は移動できない', () => {
      const king = new King(Player.SENTE);
      const moves = king.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });
  });

  describe('canPromote', () => {
    it('玉は成れない', () => {
      const king = new King(Player.SENTE, { row: 4, column: 4 });
      expect(king.canPromote({ row: 2, column: 4 })).toBe(false);
    });
  });

  describe('promote', () => {
    it('玉は成り駒に変換できない', () => {
      const king = new King(Player.SENTE, { row: 4, column: 4 });
      expect(() => king.promote(createPiece)).toThrow('この駒は成ることができません');
    });
  });
});