
import { describe, it, expect, beforeEach } from 'vitest';

import { Dragon } from './dragon';
import { Board } from '../../board/board';
import { createPiece } from '../factory';
import { Player, PieceType } from '../types';

describe('Dragon', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it('should have the correct type and player', () => {
    const dragon = new Dragon(Player.SENTE, { row: 0, column: 0 });
    expect(dragon.type).toBe(PieceType.DRAGON);
    expect(dragon.player).toBe(Player.SENTE);
  });

  describe('getValidMoves', () => {
    it('飛車の動き（縦横）に加えて、斜め1マスに移動できる', () => {
      const dragon = new Dragon(Player.SENTE, { row: 4, column: 4 });
      board.setPiece({ row: 4, column: 4 }, dragon);

      const destinations = dragon.getValidMoves(board);

      // 飛車と同じ縦横の動き
      // 上方向
      expect(destinations).toContainEqual({ row: 3, column: 4 });
      expect(destinations).toContainEqual({ row: 2, column: 4 });
      expect(destinations).toContainEqual({ row: 1, column: 4 });
      expect(destinations).toContainEqual({ row: 0, column: 4 });
      
      // 下方向
      expect(destinations).toContainEqual({ row: 5, column: 4 });
      expect(destinations).toContainEqual({ row: 6, column: 4 });
      expect(destinations).toContainEqual({ row: 7, column: 4 });
      expect(destinations).toContainEqual({ row: 8, column: 4 });
      
      // 左方向
      expect(destinations).toContainEqual({ row: 4, column: 3 });
      expect(destinations).toContainEqual({ row: 4, column: 2 });
      expect(destinations).toContainEqual({ row: 4, column: 1 });
      expect(destinations).toContainEqual({ row: 4, column: 0 });
      
      // 右方向
      expect(destinations).toContainEqual({ row: 4, column: 5 });
      expect(destinations).toContainEqual({ row: 4, column: 6 });
      expect(destinations).toContainEqual({ row: 4, column: 7 });
      expect(destinations).toContainEqual({ row: 4, column: 8 });
      
      // 斜め1マス
      expect(destinations).toContainEqual({ row: 3, column: 3 });
      expect(destinations).toContainEqual({ row: 3, column: 5 });
      expect(destinations).toContainEqual({ row: 5, column: 3 });
      expect(destinations).toContainEqual({ row: 5, column: 5 });
      
      expect(destinations).toHaveLength(16 + 4); // 縦横16マス + 斜め4マス
      
      // 斜め2マス以上は移動できない
      expect(destinations).not.toContainEqual({ row: 2, column: 2 });
      expect(destinations).not.toContainEqual({ row: 6, column: 6 });
    });

    it('縦横の移動は他の駒を飛び越えることができない', () => {
      const dragon = new Dragon(Player.SENTE, { row: 4, column: 4 });
      const blockingPiece = new Dragon(Player.GOTE, { row: 2, column: 4 });
      
      board.setPiece({ row: 4, column: 4 }, dragon);
      board.setPiece({ row: 2, column: 4 }, blockingPiece);

      const destinations = dragon.getValidMoves(board);

      // 敵の駒の位置までは移動できる
      expect(destinations).toContainEqual({ row: 2, column: 4 });
      // その先には移動できない
      expect(destinations).not.toContainEqual({ row: 1, column: 4 });
      expect(destinations).not.toContainEqual({ row: 0, column: 4 });
    });

    it('斜め1マスの移動でも味方の駒がある場所には移動できない', () => {
      const dragon = new Dragon(Player.SENTE, { row: 4, column: 4 });
      const allyPiece = new Dragon(Player.SENTE, { row: 3, column: 3 });
      
      board.setPiece({ row: 4, column: 4 }, dragon);
      board.setPiece({ row: 3, column: 3 }, allyPiece);

      const destinations = dragon.getValidMoves(board);

      expect(destinations).not.toContainEqual({ row: 3, column: 3 });
    });

    it('持ち駒の場合は移動できない', () => {
      const dragon = new Dragon(Player.SENTE);

      const destinations = dragon.getValidMoves(board);
      expect(destinations).toHaveLength(0);
    });
  });


  describe('promote', () => {
    it('竜は成り駒に変換できない', () => {
      const dragon = new Dragon(Player.SENTE, { row: 4, column: 4 });
      
      expect(() => dragon.promote(createPiece)).toThrow('この駒は成ることができません');
    });
  });
});