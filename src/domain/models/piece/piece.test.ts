import { IBoard, IPiece } from './interface';
import { Piece } from './piece';
import { PieceType, Player, Position } from './types';
import { Rook } from './pieces/rook';
import { Bishop } from './pieces/bishop';
import { Silver } from './pieces/silver';
import { Knight } from './pieces/knight';
import { Lance } from './pieces/lance';
import { Pawn } from './pieces/pawn';
import { PromotedSilver } from './pieces/promoted-silver';

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

describe('Piece基底クラス', () => {
  it('コンストラクタ > 駒の種類、プレイヤー、位置を正しく設定できる', () => {
    const position: Position = { row: 0, column: 0 };
    // 具象クラスでテスト
    const piece = new Rook(Player.SENTE, position);
    expect(piece.type).toBe(PieceType.ROOK);
    expect(piece.player).toBe(Player.SENTE);
    expect(piece.position).toEqual(position);
  });

  it('コンストラクタ > 位置なしで駒を作成できる', () => {
    // 具象クラスでテスト
    const piece = new Pawn(Player.GOTE);
    expect(piece.position).toBeNull();
  });

  it('clone > 駒を正しく複製できる', () => {
    const originalPosition: Position = { row: 3, column: 3 };
    const original = new Rook(Player.SENTE, originalPosition);
    const clone = original.clone();

    expect(clone.type).toBe(original.type);
    expect(clone.player).toBe(original.player);
    expect(clone.position).toEqual(original.position);
    expect(clone).not.toBe(original); // 別のインスタンスであること
  });

  it('clone > 新しい位置で駒を複製できる', () => {
    const original = new Bishop(Player.GOTE, { row: 2, column: 2 });
    const newPosition: Position = { row: 6, column: 6 };
    const clone = original.clone(newPosition);

    expect(clone.type).toBe(original.type);
    expect(clone.player).toBe(original.player);
    expect(clone.position).toEqual(newPosition);
  });

  describe('成り駒の判定', () => {
    it('先手の場合 > 敵陣（1-3段目）に入る場合、成り可能', () => {
      const piece = new Pawn(Player.SENTE, { row: 4, column: 0 });
      expect(piece.canPromote({ row: 3, column: 0 })).toBe(true);
    });

    it('先手の場合 > 敵陣から出る場合も成り可能', () => {
      const piece = new Pawn(Player.SENTE, { row: 3, column: 0 });
      expect(piece.canPromote({ row: 4, column: 0 })).toBe(true);
    });

    it('先手の場合 > 敵陣外から敵陣外への移動は成り不可', () => {
      const piece = new Pawn(Player.SENTE, { row: 5, column: 0 });
      expect(piece.canPromote({ row: 4, column: 0 })).toBe(false);
    });

    it('後手の場合 > 敵陣（7-9段目）に入る場合、成り可能', () => {
      const piece = new Pawn(Player.GOTE, { row: 6, column: 0 });
      expect(piece.canPromote({ row: 7, column: 0 })).toBe(true);
    });

    it('後手の場合 > 敵陣から出る場合も成り可能', () => {
      const piece = new Pawn(Player.GOTE, { row: 7, column: 0 });
      expect(piece.canPromote({ row: 6, column: 0 })).toBe(true);
    });

    it('金と玉は成れない', () => {
      const gold = createPiece(PieceType.GOLD, Player.SENTE, { row: 5, column: 5 });
      const king = createPiece(PieceType.KING, Player.SENTE, { row: 5, column: 5 });
      expect(gold.canPromote({ row: 1, column: 1 })).toBe(false);
      expect(king.canPromote({ row: 1, column: 1 })).toBe(false);
    });

    it('すでに成り駒の場合は成れない', () => {
      const promoted = new PromotedSilver(Player.SENTE, { row: 5, column: 5 });
      expect(promoted.canPromote({ row: 1, column: 1 })).toBe(false);
    });

    it('持ち駒（位置なし）は成れない', () => {
      const piece = new Pawn(Player.SENTE); // position is null
      expect(piece.canPromote({ row: 1, column: 1 })).toBe(false);
    });
  });

  describe('成り駒への変換', () => {
    it('飛車を竜に変換できる', () => {
      const piece = new Rook(Player.SENTE);
      const promoted = piece.promote();
      expect(promoted.type).toBe(PieceType.DRAGON);
    });

    it('角を馬に変換できる', () => {
      const piece = new Bishop(Player.SENTE);
      const promoted = piece.promote();
      expect(promoted.type).toBe(PieceType.HORSE);
    });

    it('銀を成銀に変換できる', () => {
      const piece = new Silver(Player.SENTE);
      const promoted = piece.promote();
      expect(promoted.type).toBe(PieceType.PROMOTED_SILVER);
    });

    it('桂馬を成桂に変換できる', () => {
      const piece = new Knight(Player.SENTE);
      const promoted = piece.promote();
      expect(promoted.type).toBe(PieceType.PROMOTED_KNIGHT);
    });

    it('香車を成香に変換できる', () => {
      const piece = new Lance(Player.SENTE);
      const promoted = piece.promote();
      expect(promoted.type).toBe(PieceType.PROMOTED_LANCE);
    });

    it('歩をと金に変換できる', () => {
      const piece = new Pawn(Player.SENTE);
      const promoted = piece.promote();
      expect(promoted.type).toBe(PieceType.TOKIN);
    });

    it('金と玉は成り駒に変換できない（例外をスロー）', () => {
      const gold = createPiece(PieceType.GOLD, Player.SENTE, { row: 5, column: 5 });
      const king = createPiece(PieceType.KING, Player.SENTE, { row: 5, column: 5 });
      expect(() => gold.promote()).toThrow();
      expect(() => king.promote()).toThrow();
    });

    it('すでに成り駒の場合は変換できない（例外をスロー）', () => {
      const promoted = new PromotedSilver(Player.SENTE, { row: 5, column: 5 });
      expect(() => promoted.promote()).toThrow();
    });
  });

  it('基底クラスのgetValidMoves > 基底クラスでは空配列を返す', () => {
    // 抽象クラスなので、具象クラスでテストするが、
    // ほとんどの具象クラスはgetValidMovesをオーバーライドしている。
    // ここでは、もしオーバーライドしないクラスがあった場合の挙動を確認する。
    class TestPiece extends Piece {
      clone(): IPiece {
        return new TestPiece(this.player, this.position);
      }
    }
    const piece = new TestPiece(PieceType.PAWN, Player.SENTE);
    const board = new MockBoard();
    expect(piece.getValidMoves(board)).toEqual([]);
  });
});