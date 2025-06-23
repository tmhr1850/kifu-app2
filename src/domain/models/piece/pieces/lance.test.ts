import { describe, it, expect, beforeEach } from 'vitest';

import { Lance } from './lance';
import { Board } from '../../board/board';
import { Player, PieceType } from '../types';
import { Position } from '../types';

describe('Lance', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it('should have the correct type and player', () => {
    const lance = new Lance(Player.SENTE, { row: 0, column: 0 });
    expect(lance.type).toBe(PieceType.LANCE);
    expect(lance.player).toBe(Player.SENTE);
  });

  describe('コンストラクタ', () => {
    it('正しく香車を作成できる', () => {
      const position: Position = { row: 8, column: 0 };
      const lance = new Lance(Player.SENTE, position);

      expect(lance.type).toBe(PieceType.LANCE);
      expect(lance.player).toBe(Player.SENTE);
      expect(lance.position).toEqual(position);
    });
  });

  describe('getValidMoves', () => {
    describe('先手の場合', () => {
      it('前方にまっすぐ、好きなだけ移動できる', () => {
        const lance = new Lance(Player.SENTE, { row: 8, column: 0 });
        board.setPiece({ row: 8, column: 0 }, lance);

        const moves = lance.getValidMoves(board);
        const destinations = moves.map(move => move.to);

        expect(destinations).toHaveLength(8);
        for (let i = 0; i < 8; i++) {
          expect(destinations).toContainEqual({ row: i, column: 0 });
        }
      });

      it('他の駒を飛び越えることはできない', () => {
        const lance = new Lance(Player.SENTE, { row: 8, column: 0 });
        const blockingPiece = new Lance(Player.GOTE, { row: 4, column: 0 });
        board.setPiece({ row: 8, column: 0 }, lance);
        board.setPiece({ row: 4, column: 0 }, blockingPiece);

        const moves = lance.getValidMoves(board);
        const destinations = moves.map(move => move.to);

        expect(destinations).toHaveLength(4); // 7,0から4,0まで
        expect(destinations).toContainEqual({ row: 4, column: 0 }); // 敵の駒は取れる
        expect(destinations).not.toContainEqual({ row: 3, column: 0 }); // 飛び越えられない
      });
    });

    describe('後手の場合', () => {
      it('前方にまっすぐ、好きなだけ移動できる', () => {
        const lance = new Lance(Player.GOTE, { row: 0, column: 0 });
        board.setPiece({ row: 0, column: 0 }, lance);

        const moves = lance.getValidMoves(board);
        const destinations = moves.map(move => move.to);

        expect(destinations).toHaveLength(8);
        for (let i = 1; i < 9; i++) {
          expect(destinations).toContainEqual({ row: i, column: 0 });
        }
      });
    });

    it('持ち駒の場合は移動できない', () => {
      const lance = new Lance(Player.SENTE);
      const moves = lance.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });
  });

  describe('canPromote', () => {
    it('先手の場合、敵陣に入る時に成れる', () => {
      const lance = new Lance(Player.SENTE, { row: 4, column: 0 });
      expect(lance.canPromote({ row: 2, column: 0 })).toBe(true);
    });
  });

  describe('promote', () => {
    it('香車を成香に変換できる', () => {
      const lance = new Lance(Player.SENTE, { row: 4, column: 0 });
      const promoted = lance.promote();
      expect(promoted.type).toBe(PieceType.PROMOTED_LANCE);
      expect(promoted.player).toBe(Player.SENTE);
      expect(promoted.position).toEqual(lance.position);
    });
  });
});