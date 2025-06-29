import { PromotedKnight } from './promoted-knight';
import { PromotedLance } from './promoted-lance';
import { PromotedSilver } from './promoted-silver';
import { Tokin } from './tokin';
import { createPiece } from '../factory';
import { IBoard, IPiece } from '../interface';
import { Move, PieceType, Player, Position } from '../types';

// モックボードの作成
class MockBoard implements IBoard {
  private pieces: Map<string, IPiece>;

  constructor() {
    this.pieces = new Map();
  }

  getPiece(position: Position): IPiece | null {
    const key = `${position.row}-${position.column}`;
    return this.pieces.get(key) || null;
  }

  isValidPosition(position: Position): boolean {
    return position.row >= 0 && position.row < 9 && 
           position.column >= 0 && position.column < 9;
  }

  setPiece(position: Position, piece: IPiece): void {
    const key = `${position.row}-${position.column}`;
    this.pieces.set(key, piece);
  }

  clone(): IBoard {
    const newBoard = new MockBoard();
    this.pieces.forEach((piece, key) => {
      newBoard.pieces.set(key, piece.clone());
    });
    return newBoard;
  }

  getPieces(player: Player): IPiece[] {
    return Array.from(this.pieces.values()).filter(p => p.player === player);
  }

  findKing(player: Player): Position | null {
    for (const piece of this.pieces.values()) {
      if (piece.type === PieceType.KING && piece.player === player) {
        return piece.position;
      }
    }
    return null;
  }

  applyMove(move: Move): IBoard {
    const newBoard = this.clone();
    if ('from' in move) {
      const piece = newBoard.getPiece(move.from);
      if (piece) {
        newBoard.setPiece(move.from, null);
        newBoard.setPiece(move.to, piece.clone(move.to));
      }
    }
    return newBoard;
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
          const piece = new PieceClass(Player.SENTE, { row: 4, column: 4 });
          board.setPiece({ row: 4, column: 4 }, piece);

          const destinations = piece.getValidMoves(board);

          // 前方3マス
          expect(destinations).toContainEqual({ row: 3, column: 3 });
          expect(destinations).toContainEqual({ row: 3, column: 4 });
          expect(destinations).toContainEqual({ row: 3, column: 5 });
          // 横2マス
          expect(destinations).toContainEqual({ row: 4, column: 3 });
          expect(destinations).toContainEqual({ row: 4, column: 5 });
          // 後方1マス
          expect(destinations).toContainEqual({ row: 5, column: 4 });
          
          expect(destinations).toHaveLength(6);
          // 斜め後ろには移動できない
          expect(destinations).not.toContainEqual({ row: 5, column: 3 });
          expect(destinations).not.toContainEqual({ row: 5, column: 5 });
        });
      });

      describe('後手の場合', () => {
        it('金と同じく前方3マス、横2マス、後方1マスに移動できる（後手の向き）', () => {
          const board = new MockBoard();
          const piece = new PieceClass(Player.GOTE, { row: 4, column: 4 });
          board.setPiece({ row: 4, column: 4 }, piece);

          const destinations = piece.getValidMoves(board);

          // 前方3マス（後手は下向き）
          expect(destinations).toContainEqual({ row: 5, column: 3 });
          expect(destinations).toContainEqual({ row: 5, column: 4 });
          expect(destinations).toContainEqual({ row: 5, column: 5 });
          // 横2マス
          expect(destinations).toContainEqual({ row: 4, column: 3 });
          expect(destinations).toContainEqual({ row: 4, column: 5 });
          // 後方1マス
          expect(destinations).toContainEqual({ row: 3, column: 4 });
          
          expect(destinations).toHaveLength(6);
        });
      });

      it('味方の駒がある場所には移動できない', () => {
        const board = new MockBoard();
        const piece = new PieceClass(Player.SENTE, { row: 4, column: 4 });
        const allyPiece = new PieceClass(Player.SENTE, { row: 3, column: 4 });
        
        board.setPiece({ row: 4, column: 4 }, piece);
        board.setPiece({ row: 3, column: 4 }, allyPiece);

        const destinations = piece.getValidMoves(board);

        expect(destinations).not.toContainEqual({ row: 3, column: 4 });
        expect(destinations).toHaveLength(5);
      });

      it('持ち駒の場合は移動できない', () => {
        const board = new MockBoard();
        const piece = new PieceClass(Player.SENTE);

        const destinations = piece.getValidMoves(board);
        expect(destinations).toHaveLength(0);
      });
    });


    describe('promote', () => {
      it('成り駒は成り駒に変換できない', () => {
        const piece = new PieceClass(Player.SENTE, { row: 4, column: 4 });
        
        expect(() => piece.promote(createPiece)).toThrow('この駒は成ることができません');
      });
    });
  });
});