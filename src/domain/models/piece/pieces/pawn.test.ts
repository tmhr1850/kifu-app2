import { describe, it, expect, beforeEach } from 'vitest';

import { Pawn } from './pawn';
import { Board } from '../../board/board';
import { createPiece } from '../factory';
import { Player, PieceType } from '../types';
import { Position } from '../types';

describe('Pawn', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it('should have the correct type and player', () => {
    const pawn = new Pawn(Player.SENTE, { row: 0, column: 0 });
    expect(pawn.type).toBe(PieceType.PAWN);
    expect(pawn.player).toBe(Player.SENTE);
  });

  describe('コンストラクタ', () => {
    it('正しく歩を作成できる', () => {
      const position: Position = { row: 6, column: 4 }; // 5七歩
      const pawn = new Pawn(Player.SENTE, position);

      expect(pawn.type).toBe(PieceType.PAWN);
      expect(pawn.player).toBe(Player.SENTE);
      expect(pawn.position).toEqual(position);
    });
  });

  describe('getValidMoves', () => {
    describe('先手の場合', () => {
      it('前方1マスに移動できる', () => {
        const pawn = new Pawn(Player.SENTE, { row: 6, column: 4 }); // 5七歩
        board.setPiece({ row: 6, column: 4 }, pawn);

        const destinations = pawn.getValidMoves(board);

        expect(destinations).toContainEqual({ row: 5, column: 4 }); // 5六へ
        expect(destinations).toHaveLength(1);
        
        // 横や後ろ、斜めには移動できない
        expect(destinations).not.toContainEqual({ row: 7, column: 4 });
        expect(destinations).not.toContainEqual({ row: 6, column: 3 });
        expect(destinations).not.toContainEqual({ row: 6, column: 5 });
        expect(destinations).not.toContainEqual({ row: 5, column: 3 });
      });

      it('1段目では移動できない（移動先がない）', () => {
        const pawn = new Pawn(Player.SENTE, { row: 0, column: 4 }); // 5一歩
        board.setPiece({ row: 0, column: 4 }, pawn);

        const moves = pawn.getValidMoves(board);
        expect(moves).toHaveLength(0);
      });
    });

    describe('後手の場合', () => {
      it('前方1マスに移動できる（後手の向き）', () => {
        const pawn = new Pawn(Player.GOTE, { row: 2, column: 4 }); // 5三歩
        board.setPiece({ row: 2, column: 4 }, pawn);

        const destinations = pawn.getValidMoves(board);

        expect(destinations).toContainEqual({ row: 3, column: 4 }); // 5四へ
        expect(destinations).toHaveLength(1);
      });

      it('9段目では移動できない（移動先がない）', () => {
        const pawn = new Pawn(Player.GOTE, { row: 8, column: 4 }); // 5九歩
        board.setPiece({ row: 8, column: 4 }, pawn);

        const moves = pawn.getValidMoves(board);
        expect(moves).toHaveLength(0);
      });
    });

    it('前に敵の駒がある場合は取れる', () => {
      const pawn = new Pawn(Player.SENTE, { row: 6, column: 4 }); // 5七歩
      const enemyPiece = new Pawn(Player.GOTE, { row: 5, column: 4 }); // 5六歩
      
      board.setPiece({ row: 6, column: 4 }, pawn);
      board.setPiece({ row: 5, column: 4 }, enemyPiece);

      const destinations = pawn.getValidMoves(board);

      expect(destinations).toContainEqual({ row: 5, column: 4 });
      expect(destinations).toHaveLength(1);
    });

    it('前に味方の駒がある場合は移動できない', () => {
      const pawn = new Pawn(Player.SENTE, { row: 6, column: 4 }); // 5七歩
      const allyPiece = new Pawn(Player.SENTE, { row: 5, column: 4 }); // 5六歩
      
      board.setPiece({ row: 6, column: 4 }, pawn);
      board.setPiece({ row: 5, column: 4 }, allyPiece);

      const moves = pawn.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });

    it('持ち駒の場合は移動できない', () => {
      const pawn = new Pawn(Player.SENTE); // 持ち駒

      const moves = pawn.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });
  });


  describe('promote', () => {
    it('歩をと金に変換できる', () => {
      const pawn = new Pawn(Player.SENTE, { row: 5, column: 5 });
      const tokin = pawn.promote(createPiece);
      
      expect(tokin.type).toBe(PieceType.TOKIN);
      expect(tokin.player).toBe(Player.SENTE);
      expect(tokin.position).toEqual(pawn.position);
    });
  });
});