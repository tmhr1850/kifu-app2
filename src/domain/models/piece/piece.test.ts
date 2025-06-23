import { describe, it, expect, beforeEach } from 'vitest';

import { createPiece } from './factory';
import { IBoard, IPiece } from './interface';
import { King } from './pieces/king';
import { Pawn } from './pieces/pawn';
import { PromotedSilver } from './pieces/promoted-silver';
import { Rook } from './pieces/rook';
import { Silver } from './pieces/silver';
import { PieceType, Player, Position } from './types';

// IBoardインターフェースを満たすMockBoardを作成
class MockBoard implements IBoard {
  private pieces: Map<string, IPiece> = new Map();

  isValidPosition(position: Position): boolean {
    return (
      position.row >= 0 &&
      position.row < 9 &&
      position.column >= 0 &&
      position.column < 9
    );
  }

  getPiece(position: Position): IPiece | null {
    const key = `${position.row},${position.column}`;
    return this.pieces.get(key) || null;
  }

  setPiece(position: Position, piece: IPiece | null): void {
    const key = `${position.row},${position.column}`;
    if (piece) {
      this.pieces.set(key, piece);
    } else {
      this.pieces.delete(key);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findKing(player: Player): Position | null {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  applyMove(move: import('./types').Move): IBoard {
    throw new Error('Method not implemented.');
  }

  clone(): IBoard {
    // テストでは使わないので簡易的な実装
    return new MockBoard();
  }

  getPieces(player: Player): IPiece[] {
    // テストでは使わないので簡易的な実装
    return Array.from(this.pieces.values()).filter(p => p.player === player);
  }
}

describe('Piece', () => {
  describe('equals', () => {
    it('同じプロパティを持つ駒は等しいと判断されること', () => {
      const piece1 = new Pawn(Player.SENTE, { row: 6, column: 7 });
      const piece2 = new Pawn(Player.SENTE, { row: 6, column: 7 });
      expect(piece1.equals(piece2)).toBe(true);
    });

    it('プレイヤーが異なる駒は等しくないと判断されること', () => {
      const piece1 = new Pawn(Player.SENTE, { row: 6, column: 7 });
      const piece2 = new Pawn(Player.GOTE, { row: 6, column: 7 });
      expect(piece1.equals(piece2)).toBe(false);
    });

    it('種類が異なる駒は等しくないと判断されること', () => {
      const piece1 = new Pawn(Player.SENTE, { row: 6, column: 7 });
      const piece2 = new Rook(Player.SENTE, { row: 6, column: 7 });
      expect(piece1.equals(piece2)).toBe(false);
    });
  });

  describe('promote and unpromote', () => {
    it('成れる駒は成ると成り駒になること', () => {
      const silver = new Silver(Player.SENTE, { row: 2, column: 2 });
      const promoted = silver.promote(createPiece);
      expect(promoted).toBeInstanceOf(PromotedSilver);
      expect(promoted?.type).toBe(PieceType.PROMOTED_SILVER);
    });

    // it('成り駒は元の駒に戻ること', () => {
    //   const promotedSilver = new PromotedSilver(Player.SENTE, {
    //     row: 2,
    //     column: 2,
    //   });
    //   const demoted = promotedSilver.unpromote();
    //   expect(demoted).toBeInstanceOf(Silver);
    //   expect(demoted?.type).toBe(PieceType.SILVER);
    // });

    it('成れない駒はpromoteを呼んでもエラーを投げること', () => {
      const king = new King(Player.SENTE, { row: 0, column: 4 });
      expect(() => king.promote(createPiece)).toThrow('この駒は成ることができません');
    });
  });


  describe('getValidMoves', () => {
    let board: IBoard;

    beforeEach(() => {
      board = new MockBoard();
    });

    it('歩は正面に1マス進める', () => {
      const pawn = createPiece(PieceType.PAWN, Player.SENTE, {
        row: 6,
        column: 7,
      });
      board.setPiece({ row: 6, column: 7 }, pawn);
      const moves = pawn.getValidMoves(board);
      expect(moves.length).toBe(1);
      expect(moves[0]).toEqual({ row: 5, column: 7 });
    });

    it('飛車は障害物がなければ全ての直線方向に動ける', () => {
      const rook = createPiece(PieceType.ROOK, Player.SENTE, {
        row: 4,
        column: 4,
      });
      board.setPiece({ row: 4, column: 4 }, rook);
      const moves = rook.getValidMoves(board);
      // 縦8マス + 横8マス = 16マス
      expect(moves.length).toBe(16);
    });

    it('飛車は味方の駒の手前までしか動けない', () => {
      const rook = createPiece(PieceType.ROOK, Player.SENTE, {
        row: 4,
        column: 4,
      });
      const friendlyPawn = createPiece(PieceType.PAWN, Player.SENTE, {
        row: 4,
        column: 2,
      });
      board.setPiece({ row: 4, column: 4 }, rook);
      board.setPiece({ row: 4, column: 2 }, friendlyPawn);
      const moves = rook.getValidMoves(board);
      const leftMoves = moves.filter(m => m.column < 4);
      expect(leftMoves.length).toBe(1); // (4,3) のみ
    });
  });
});