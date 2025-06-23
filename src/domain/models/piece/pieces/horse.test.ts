import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Horse } from './horse';
import { IBoard } from '../interface';
import { PieceType, Player, Position } from '../types';
import { Board } from '../../board/board';
import { Pawn } from './pawn';

describe('Horse（馬）', () => {
  let board: IBoard;

  beforeEach(() => {
    board = new Board();
  });

  describe('コンストラクタ', () => {
    it('正しく馬を作成できる', () => {
      const position: Position = { row: 4, column: 4 };
      const horse = new Horse(Player.SENTE, position);

      expect(horse.type).toBe(PieceType.HORSE);
      expect(horse.player).toBe(Player.SENTE);
      expect(horse.position).toEqual(position);
    });
  });

  describe('getValidMoves', () => {
    it('角の動き（斜め）に加えて、縦横1マスに移動できる', () => {
      const horse = new Horse(Player.SENTE, { row: 4, column: 4 });
      board.setPiece({ row: 4, column: 4 }, horse);

      const moves = horse.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      // 角の動き
      expect(destinations).toContainEqual({ row: 3, column: 3 });
      expect(destinations).toContainEqual({ row: 0, column: 0 });
      expect(destinations).toContainEqual({ row: 3, column: 5 });
      expect(destinations).toContainEqual({ row: 0, column: 8 });
      expect(destinations).toContainEqual({ row: 5, column: 3 });
      expect(destinations).toContainEqual({ row: 8, column: 0 });
      expect(destinations).toContainEqual({ row: 5, column: 5 });
      expect(destinations).toContainEqual({ row: 8, column: 8 });

      // 玉の動き（縦横1マス）
      expect(destinations).toContainEqual({ row: 3, column: 4 }); // 前
      expect(destinations).toContainEqual({ row: 5, column: 4 }); // 後
      expect(destinations).toContainEqual({ row: 4, column: 3 }); // 左
      expect(destinations).toContainEqual({ row: 4, column: 5 }); // 右
    });

    it('斜めの移動は他の駒を飛び越えることができない', () => {
      const horse = new Horse(Player.SENTE, { row: 4, column: 4 });
      const blockingPiece = new Pawn(Player.GOTE, { row: 2, column: 2 });
      board.setPiece({ row: 4, column: 4 }, horse);
      board.setPiece({ row: 2, column: 2 }, blockingPiece);

      const moves = horse.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      expect(destinations).toContainEqual({ row: 2, column: 2 }); // 敵の駒は取れる
      expect(destinations).not.toContainEqual({ row: 1, column: 1 }); // 飛び越えられない
    });

    it('縦横1マスの移動でも味方の駒がある場所には移動できない', () => {
      const horse = new Horse(Player.SENTE, { row: 4, column: 4 });
      const allyPiece = new Pawn(Player.SENTE, { row: 3, column: 4 });
      board.setPiece({ row: 4, column: 4 }, horse);
      board.setPiece({ row: 3, column: 4 }, allyPiece);

      const moves = horse.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      expect(destinations).not.toContainEqual({ row: 3, column: 4 });
    });

    it('持ち駒の場合は移動できない', () => {
      const horse = new Horse(Player.SENTE);
      const moves = horse.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });
  });

  describe('canPromote', () => {
    it('馬は成れない（すでに成り駒）', () => {
      const horse = new Horse(Player.SENTE, { row: 4, column: 4 });
      expect(horse.canPromote({ row: 2, column: 4 })).toBe(false);
    });
  });

  describe('promote', () => {
    it('馬は成り駒に変換できない', () => {
      const horse = new Horse(Player.SENTE, { row: 4, column: 4 });
      expect(() => horse.promote()).toThrow('この駒は成ることができません');
    });
  });
});