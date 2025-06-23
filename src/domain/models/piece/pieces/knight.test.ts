import { describe, it, expect, beforeEach } from 'vitest';

import { Knight } from './knight';
import { Board } from '../../board/board';
import { createPiece } from '../factory';
import { Player, PieceType, Position } from '../types';

describe('Knight', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it('should have the correct type and player', () => {
    const knight = new Knight(Player.SENTE, { row: 0, column: 0 });
    expect(knight.type).toBe(PieceType.KNIGHT);
    expect(knight.player).toBe(Player.SENTE);
  });

  describe('コンストラクタ', () => {
    it('正しく桂馬を作成できる', () => {
      const position: Position = { row: 6, column: 2 };
      const knight = new Knight(Player.SENTE, position);

      expect(knight.type).toBe(PieceType.KNIGHT);
      expect(knight.player).toBe(Player.SENTE);
      expect(knight.position).toEqual(position);
    });
  });

  describe('getValidMoves', () => {
    describe('先手の場合', () => {
      it('前方2マス先、左右1マスの位置に移動できる', () => {
        const knight = new Knight(Player.SENTE, { row: 6, column: 2 });
        board.setPiece({ row: 6, column: 2 }, knight);

        const destinations = knight.getValidMoves(board);

        expect(destinations).toHaveLength(2);
        expect(destinations).toContainEqual({ row: 4, column: 1 });
        expect(destinations).toContainEqual({ row: 4, column: 3 });
      });

      it('移動先に味方の駒がいる場合は移動できない', () => {
        const knight = new Knight(Player.SENTE, { row: 6, column: 2 });
        const ally = new Knight(Player.SENTE, { row: 4, column: 1 });
        board.setPiece({ row: 6, column: 2 }, knight);
        board.setPiece({ row: 4, column: 1 }, ally);

        const moves = knight.getValidMoves(board);
        expect(moves).not.toContainEqual({ row: 4, column: 1 });
        expect(moves).toHaveLength(1);
      });
    });

    describe('後手の場合', () => {
      it('前方2マス先、左右1マスの位置に移動できる', () => {
        const knight = new Knight(Player.GOTE, { row: 2, column: 2 });
        board.setPiece({ row: 2, column: 2 }, knight);

        const destinations = knight.getValidMoves(board);

        expect(destinations).toHaveLength(2);
        expect(destinations).toContainEqual({ row: 4, column: 1 });
        expect(destinations).toContainEqual({ row: 4, column: 3 });
      });
    });

    it('持ち駒の場合は移動できない', () => {
      const knight = new Knight(Player.SENTE);
      const moves = knight.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });
  });


  describe('promote', () => {
    it('桂馬を成桂に変換できる', () => {
      const knight = new Knight(Player.SENTE, { row: 4, column: 2 });
      const promoted = knight.promote(createPiece);
      expect(promoted.type).toBe(PieceType.PROMOTED_KNIGHT);
      expect(promoted.player).toBe(Player.SENTE);
      expect(promoted.position).toEqual(knight.position);
    });
  });
});