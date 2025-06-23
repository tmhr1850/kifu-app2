import { describe, it, expect, beforeEach } from 'vitest';

import { Gold } from './gold';
import { Board } from '../../board/board';
import { Player, PieceType } from '../types';

describe('Gold', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it('should have the correct type and player', () => {
    const gold = new Gold(Player.SENTE, { row: 0, column: 0 });
    expect(gold.type).toBe(PieceType.GOLD);
    expect(gold.player).toBe(Player.SENTE);
  });

  describe('getValidMoves', () => {
    describe('先手の場合', () => {
      it('前方3マス、横2マス、後方1マスに移動できる', () => {
        const gold = new Gold(Player.SENTE, { row: 4, column: 4 });
        board.setPiece({ row: 4, column: 4 }, gold);

        const moves = gold.getValidMoves(board);
        const destinations = moves.map(move => move.to);

        expect(destinations).toHaveLength(6);
        expect(destinations).toContainEqual({ row: 3, column: 3 }); // 左上
        expect(destinations).toContainEqual({ row: 3, column: 4 }); // 前
        expect(destinations).toContainEqual({ row: 3, column: 5 }); // 右上
        expect(destinations).toContainEqual({ row: 4, column: 3 }); // 左
        expect(destinations).toContainEqual({ row: 4, column: 5 }); // 右
        expect(destinations).toContainEqual({ row: 5, column: 4 }); // 後
      });
    });

    describe('後手の場合', () => {
      it('前方3マス、横2マス、後方1マスに移動できる（後手の向き）', () => {
        const gold = new Gold(Player.GOTE, { row: 4, column: 4 });
        board.setPiece({ row: 4, column: 4 }, gold);

        const moves = gold.getValidMoves(board);
        const destinations = moves.map(move => move.to);

        expect(destinations).toHaveLength(6);
        expect(destinations).toContainEqual({ row: 5, column: 3 });
        expect(destinations).toContainEqual({ row: 5, column: 4 });
        expect(destinations).toContainEqual({ row: 5, column: 5 });
        expect(destinations).toContainEqual({ row: 4, column: 3 });
        expect(destinations).toContainEqual({ row: 4, column: 5 });
        expect(destinations).toContainEqual({ row: 3, column: 4 });
      });
    });

    it('盤面の端では移動可能マスが制限される', () => {
      const gold = new Gold(Player.SENTE, { row: 0, column: 0 });
      board.setPiece({ row: 0, column: 0 }, gold);
      const moves = gold.getValidMoves(board);
      expect(moves).toHaveLength(2);
      expect(moves.map(m => m.to)).toContainEqual({ row: 0, column: 1 });
      expect(moves.map(m => m.to)).toContainEqual({ row: 1, column: 0 });
    });

    it('味方の駒がある場所には移動できない', () => {
      const gold = new Gold(Player.SENTE, { row: 4, column: 4 });
      const ally = new Gold(Player.SENTE, { row: 3, column: 4 });
      board.setPiece({ row: 4, column: 4 }, gold);
      board.setPiece({ row: 3, column: 4 }, ally);

      const moves = gold.getValidMoves(board);
      expect(moves.map(m => m.to)).not.toContainEqual({ row: 3, column: 4 });
      expect(moves).toHaveLength(5);
    });

    it('持ち駒の場合は移動できない', () => {
      const gold = new Gold(Player.SENTE);
      const moves = gold.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });
  });

  describe('canPromote', () => {
    it('金は成れない', () => {
      const gold = new Gold(Player.SENTE, { row: 4, column: 4 });
      expect(gold.canPromote({ row: 2, column: 4 })).toBe(false);
    });
  });

  describe('promote', () => {
    it('金は成り駒に変換できない', () => {
      const gold = new Gold(Player.SENTE, { row: 4, column: 4 });
      expect(() => gold.promote()).toThrow('この駒は成ることができません');
    });
  });
});