import { PromotedKnight } from './promoted-knight';
import { PromotedLance } from './promoted-lance';
import { PromotedSilver } from './promoted-silver';
import { Tokin } from './tokin';
import { IBoard, IPiece } from '../interface';
import { PieceType, Player, Position } from '../types';

// モックボードの作成
class MockBoard implements IBoard {
  private pieces: Map<string, IPiece>;

  constructor() {
    this.pieces = new Map();
  }

  getPieceAt(position: Position): IPiece | null {
    const key = `${position.row}-${position.column}`;
    return this.pieces.get(key) || null;
  }

  isValidPosition(position: Position): boolean {
    return position.row >= 1 && position.row <= 9 && 
           position.column >= 1 && position.column <= 9;
  }

  setPieceAt(position: Position, piece: IPiece): void {
    const key = `${position.row}-${position.column}`;
    this.pieces.set(key, piece);
  }
}

// 成銀、成桂、成香、と金は全て金と同じ動きをするため、共通のテストを使用
const promotedPieceTestCases = [
  { name: 'PromotedSilver（成銀）', PieceClass: PromotedSilver, type: PieceType.PROMOTED_SILVER },
  { name: 'PromotedKnight（成桂）', PieceClass: PromotedKnight, type: PieceType.PROMOTED_KNIGHT },
  { name: 'PromotedLance（成香）', PieceClass: PromotedLance, type: PieceType.PROMOTED_LANCE },
  { name: 'Tokin（と金）', PieceClass: Tokin, type: PieceType.TOKIN },
];

promotedPieceTestCases.forEach(({ name, PieceClass, type }) => {
  describe(name, () => {
    describe('コンストラクタ', () => {
      it(`正しく${name}を作成できる`, () => {
        const position: Position = { row: 5, column: 5 };
        const piece = new PieceClass(Player.SENTE, position);

        expect(piece.type).toBe(type);
        expect(piece.player).toBe(Player.SENTE);
        expect(piece.position).toEqual(position);
      });
    });

    describe('getValidMoves', () => {
      describe('先手の場合', () => {
        it('金と同じく前方3マス、横2マス、後方1マスに移動できる', () => {
          const board = new MockBoard();
          const piece = new PieceClass(Player.SENTE, { row: 5, column: 5 });
          board.setPieceAt({ row: 5, column: 5 }, piece);

          const moves = piece.getValidMoves(board);
          const destinations = moves.map(move => move.to);

          // 前方3マス
          expect(destinations).toContainEqual({ row: 4, column: 4 });
          expect(destinations).toContainEqual({ row: 4, column: 5 });
          expect(destinations).toContainEqual({ row: 4, column: 6 });
          // 横2マス
          expect(destinations).toContainEqual({ row: 5, column: 4 });
          expect(destinations).toContainEqual({ row: 5, column: 6 });
          // 後方1マス
          expect(destinations).toContainEqual({ row: 6, column: 5 });
          
          expect(destinations).toHaveLength(6);
          // 斜め後ろには移動できない
          expect(destinations).not.toContainEqual({ row: 6, column: 4 });
          expect(destinations).not.toContainEqual({ row: 6, column: 6 });
        });
      });

      describe('後手の場合', () => {
        it('金と同じく前方3マス、横2マス、後方1マスに移動できる（後手の向き）', () => {
          const board = new MockBoard();
          const piece = new PieceClass(Player.GOTE, { row: 5, column: 5 });
          board.setPieceAt({ row: 5, column: 5 }, piece);

          const moves = piece.getValidMoves(board);
          const destinations = moves.map(move => move.to);

          // 前方3マス（後手は下向き）
          expect(destinations).toContainEqual({ row: 6, column: 4 });
          expect(destinations).toContainEqual({ row: 6, column: 5 });
          expect(destinations).toContainEqual({ row: 6, column: 6 });
          // 横2マス
          expect(destinations).toContainEqual({ row: 5, column: 4 });
          expect(destinations).toContainEqual({ row: 5, column: 6 });
          // 後方1マス
          expect(destinations).toContainEqual({ row: 4, column: 5 });
          
          expect(destinations).toHaveLength(6);
        });
      });

      it('味方の駒がある場所には移動できない', () => {
        const board = new MockBoard();
        const piece = new PieceClass(Player.SENTE, { row: 5, column: 5 });
        const allyPiece = new PieceClass(Player.SENTE, { row: 4, column: 5 });
        
        board.setPieceAt({ row: 5, column: 5 }, piece);
        board.setPieceAt({ row: 4, column: 5 }, allyPiece);

        const moves = piece.getValidMoves(board);
        const destinations = moves.map(move => move.to);

        expect(destinations).not.toContainEqual({ row: 4, column: 5 });
        expect(destinations).toHaveLength(5);
      });

      it('持ち駒の場合は移動できない', () => {
        const board = new MockBoard();
        const piece = new PieceClass(Player.SENTE);

        const moves = piece.getValidMoves(board);
        expect(moves).toHaveLength(0);
      });
    });

    describe('canPromote', () => {
      it('成り駒は成れない', () => {
        const piece = new PieceClass(Player.SENTE, { row: 5, column: 5 });
        
        expect(piece.canPromote({ row: 1, column: 5 })).toBe(false);
        expect(piece.canPromote({ row: 3, column: 5 })).toBe(false);
      });
    });

    describe('promote', () => {
      it('成り駒は成り駒に変換できない', () => {
        const piece = new PieceClass(Player.SENTE, { row: 5, column: 5 });
        
        expect(() => piece.promote()).toThrow('この駒は成ることができません');
      });
    });
  });
});