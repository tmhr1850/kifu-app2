import { describe, it, expect, beforeEach } from 'vitest';

import { Board } from './board';
import { createPiece } from '../piece/factory';
import { IBoard, IPiece } from '../piece/interface';
import { Move, PieceType, Player } from '../piece/types';

describe('Board', () => {
  let board: IBoard;

  beforeEach(() => {
    board = new Board();
  });

  it('駒を配置し、同じ駒が取得できること', () => {
    const position = { row: 5, column: 5 };
    const piece = createPiece(PieceType.PAWN, Player.SENTE);
    board.setPiece(position, piece);
    const retrievedPiece = board.getPiece(position);
    expect(retrievedPiece).toEqual(piece);
    expect(retrievedPiece?.equals(piece)).toBe(true);
  });

  it('駒が置かれていない位置からはnullが返ること', () => {
    const position = { row: 1, column: 1 };
    expect(board.getPiece(position)).toBeNull();
  });

  it('盤面をクローンした際に、駒の状態が同じでインスタンスが異なること', () => {
    // 1. セットアップ：いくつかの駒を盤面に配置
    const pawn = createPiece(PieceType.PAWN, Player.SENTE);
    const rook = createPiece(PieceType.ROOK, Player.GOTE);
    board.setPiece({ row: 2, column: 2 }, pawn);
    board.setPiece({ row: 7, column: 7 }, rook);

    // 2. 実行：盤面をクローン
    const clonedBoard = board.clone();

    // 3. 検証：
    // インスタンスが異なることを確認
    expect(clonedBoard).not.toBe(board);

    // 各駒がクローンされていることを確認 (位置は同じだがインスタンスは別)
    const originalPawn = board.getPiece({ row: 2, column: 2 });
    const clonedPawn = clonedBoard.getPiece({ row: 2, column: 2 });
    expect(clonedPawn).toEqual(originalPawn);
    expect(clonedPawn).not.toBe(originalPawn);

    const originalRook = board.getPiece({ row: 7, column: 7 });
    const clonedRook = clonedBoard.getPiece({ row: 7, column: 7 });
    expect(clonedRook).toEqual(originalRook);
    expect(clonedRook).not.toBe(originalRook);

    // 空白マスも一致することを確認
    expect(clonedBoard.getPiece({ row: 0, column: 0 })).toBeNull();
  });

  describe('初期盤面の生成', () => {
    it('平手の初期盤面を正しく生成できること', () => {
      const initialBoard = Board.createInitialBoard();

      // 先手の王将が正しい位置にいるか
      const senteKing = initialBoard.getPiece({ row: 8, column: 4 });
      expect(senteKing).not.toBeNull();
      expect(senteKing?.type).toBe(PieceType.KING);
      expect(senteKing?.player).toBe(Player.SENTE);

      // 後手の歩兵が正しい位置にいるか
      const gotePawn = initialBoard.getPiece({ row: 2, column: 0 });
      expect(gotePawn).not.toBeNull();
      expect(gotePawn?.type).toBe(PieceType.PAWN);
      expect(gotePawn?.player).toBe(Player.GOTE);

      // 何も置かれていない中央のマスが空白か
      const emptySquare = initialBoard.getPiece({ row: 4, column: 4 });
      expect(emptySquare).toBeNull();
    });
  });

  describe('駒の取得', () => {
    it('指定したプレイヤーの全ての駒を取得できること', () => {
      const board = Board.createInitialBoard();
      const sentePieces = board.getPieces(Player.SENTE);
      const gotePieces = board.getPieces(Player.GOTE);

      expect(sentePieces.length).toBe(20);
      expect(gotePieces.length).toBe(20);
      expect(sentePieces.every((p: IPiece) => p.player === Player.SENTE)).toBe(
        true
      );
      expect(gotePieces.every((p: IPiece) => p.player === Player.GOTE)).toBe(
        true
      );
    });
  });

  describe('王の探索', () => {
    it('指定したプレイヤーの王の位置を見つけられること', () => {
      const board = Board.createInitialBoard();
      const senteKingPos = board.findKing(Player.SENTE);
      const goteKingPos = board.findKing(Player.GOTE);

      expect(senteKingPos).toEqual({ row: 8, column: 4 });
      expect(goteKingPos).toEqual({ row: 0, column: 4 });
    });

    it('王が盤面にいない場合はnullを返すこと', () => {
      const board = new Board(); // 空の盤面
      const kingPos = board.findKing(Player.SENTE);
      expect(kingPos).toBeNull();
    });
  });

  describe('手の適用', () => {
    it('指定された手を適用し、新しい盤面を返すこと', () => {
      // セットアップ
      const board = Board.createInitialBoard();
      const move: Move = {
        from: { row: 6, column: 7 }, // 7七の歩
        to: { row: 5, column: 7 }, // 7六へ
        isPromotion: false,
      };

      // 実行
      const newBoard = board.applyMove(move);

      // 検証
      // 1. 新しいインスタンスが返されているか
      expect(newBoard).not.toBe(board);

      // 2. 元の盤面は変更されていないか
      const originalPiece = board.getPiece({ row: 6, column: 7 });
      expect(originalPiece).not.toBeNull();
      expect(originalPiece?.type).toBe(PieceType.PAWN);

      // 3. 新しい盤面で駒が移動しているか
      const movedPiece = newBoard.getPiece({ row: 5, column: 7 });
      expect(movedPiece).not.toBeNull();
      expect(movedPiece?.type).toBe(PieceType.PAWN);
      expect(newBoard.getPiece({ row: 6, column: 7 })).toBeNull();
    });
  });
}); 