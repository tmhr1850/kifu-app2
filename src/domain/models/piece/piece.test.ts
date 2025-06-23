import { IBoard, IPiece } from './interface';
import { Piece } from './piece';
import { PieceType, Player, Position } from './types';

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
  describe('コンストラクタ', () => {
    it('駒の種類、プレイヤー、位置を正しく設定できる', () => {
      const position: Position = { row: 5, column: 5 };
      const piece = new Piece(PieceType.GOLD, Player.SENTE, position);

      expect(piece.type).toBe(PieceType.GOLD);
      expect(piece.player).toBe(Player.SENTE);
      expect(piece.position).toEqual(position);
    });

    it('位置なしで駒を作成できる', () => {
      const piece = new Piece(PieceType.SILVER, Player.GOTE);

      expect(piece.type).toBe(PieceType.SILVER);
      expect(piece.player).toBe(Player.GOTE);
      expect(piece.position).toBeNull();
    });
  });

  describe('clone', () => {
    it('駒を正しく複製できる', () => {
      const originalPosition: Position = { row: 3, column: 3 };
      const original = new Piece(PieceType.ROOK, Player.SENTE, originalPosition);
      const clone = original.clone();

      expect(clone.type).toBe(original.type);
      expect(clone.player).toBe(original.player);
      expect(clone.position).toEqual(original.position);
      expect(clone).not.toBe(original);
    });

    it('新しい位置で駒を複製できる', () => {
      const original = new Piece(PieceType.BISHOP, Player.GOTE, { row: 2, column: 2 });
      const newPosition: Position = { row: 6, column: 6 };
      const clone = original.clone(newPosition);

      expect(clone.type).toBe(original.type);
      expect(clone.player).toBe(original.player);
      expect(clone.position).toEqual(newPosition);
    });
  });

  describe('成り駒の判定', () => {
    describe('先手の場合', () => {
      it('敵陣（1-3段目）に入る場合、成り可能', () => {
        const piece = new Piece(PieceType.SILVER, Player.SENTE, { row: 4, column: 5 });
        
        expect(piece.canPromote({ row: 3, column: 5 })).toBe(true);
        expect(piece.canPromote({ row: 2, column: 5 })).toBe(true);
        expect(piece.canPromote({ row: 1, column: 5 })).toBe(true);
      });

      it('敵陣から出る場合も成り可能', () => {
        const piece = new Piece(PieceType.SILVER, Player.SENTE, { row: 3, column: 5 });
        
        expect(piece.canPromote({ row: 4, column: 5 })).toBe(true);
      });

      it('敵陣外から敵陣外への移動は成り不可', () => {
        const piece = new Piece(PieceType.SILVER, Player.SENTE, { row: 5, column: 5 });
        
        expect(piece.canPromote({ row: 6, column: 5 })).toBe(false);
      });
    });

    describe('後手の場合', () => {
      it('敵陣（7-9段目）に入る場合、成り可能', () => {
        const piece = new Piece(PieceType.SILVER, Player.GOTE, { row: 6, column: 5 });
        
        expect(piece.canPromote({ row: 7, column: 5 })).toBe(true);
        expect(piece.canPromote({ row: 8, column: 5 })).toBe(true);
        expect(piece.canPromote({ row: 9, column: 5 })).toBe(true);
      });

      it('敵陣から出る場合も成り可能', () => {
        const piece = new Piece(PieceType.SILVER, Player.GOTE, { row: 7, column: 5 });
        
        expect(piece.canPromote({ row: 6, column: 5 })).toBe(true);
      });
    });

    it('金と玉は成れない', () => {
      const goldPiece = new Piece(PieceType.GOLD, Player.SENTE, { row: 4, column: 5 });
      const kingPiece = new Piece(PieceType.KING, Player.SENTE, { row: 4, column: 5 });
      
      expect(goldPiece.canPromote({ row: 1, column: 5 })).toBe(false);
      expect(kingPiece.canPromote({ row: 1, column: 5 })).toBe(false);
    });

    it('すでに成り駒の場合は成れない', () => {
      const dragonPiece = new Piece(PieceType.DRAGON, Player.SENTE, { row: 4, column: 5 });
      
      expect(dragonPiece.canPromote({ row: 1, column: 5 })).toBe(false);
    });

    it('持ち駒（位置なし）は成れない', () => {
      const piece = new Piece(PieceType.SILVER, Player.SENTE);
      
      expect(piece.canPromote({ row: 1, column: 5 })).toBe(false);
    });
  });

  describe('成り駒への変換', () => {
    it('飛車を竜に変換できる', () => {
      const rook = new Piece(PieceType.ROOK, Player.SENTE, { row: 5, column: 5 });
      const dragon = rook.promote();

      expect(dragon.type).toBe(PieceType.DRAGON);
      expect(dragon.player).toBe(Player.SENTE);
      expect(dragon.position).toEqual(rook.position);
    });

    it('角を馬に変換できる', () => {
      const bishop = new Piece(PieceType.BISHOP, Player.GOTE, { row: 5, column: 5 });
      const horse = bishop.promote();

      expect(horse.type).toBe(PieceType.HORSE);
    });

    it('銀を成銀に変換できる', () => {
      const silver = new Piece(PieceType.SILVER, Player.SENTE, { row: 5, column: 5 });
      const promotedSilver = silver.promote();

      expect(promotedSilver.type).toBe(PieceType.PROMOTED_SILVER);
    });

    it('桂馬を成桂に変換できる', () => {
      const knight = new Piece(PieceType.KNIGHT, Player.SENTE, { row: 5, column: 5 });
      const promotedKnight = knight.promote();

      expect(promotedKnight.type).toBe(PieceType.PROMOTED_KNIGHT);
    });

    it('香車を成香に変換できる', () => {
      const lance = new Piece(PieceType.LANCE, Player.SENTE, { row: 5, column: 5 });
      const promotedLance = lance.promote();

      expect(promotedLance.type).toBe(PieceType.PROMOTED_LANCE);
    });

    it('歩をと金に変換できる', () => {
      const pawn = new Piece(PieceType.PAWN, Player.SENTE, { row: 5, column: 5 });
      const tokin = pawn.promote();

      expect(tokin.type).toBe(PieceType.TOKIN);
    });

    it('金と玉は成り駒に変換できない（例外をスロー）', () => {
      const gold = new Piece(PieceType.GOLD, Player.SENTE, { row: 5, column: 5 });
      const king = new Piece(PieceType.KING, Player.SENTE, { row: 5, column: 5 });

      expect(() => gold.promote()).toThrow('この駒は成ることができません');
      expect(() => king.promote()).toThrow('この駒は成ることができません');
    });

    it('すでに成り駒の場合は変換できない（例外をスロー）', () => {
      const dragon = new Piece(PieceType.DRAGON, Player.SENTE, { row: 5, column: 5 });

      expect(() => dragon.promote()).toThrow('この駒は成ることができません');
    });
  });

  describe('基底クラスのgetValidMoves', () => {
    it('基底クラスでは空配列を返す', () => {
      const piece = new Piece(PieceType.GOLD, Player.SENTE, { row: 5, column: 5 });
      const board = new MockBoard();

      expect(piece.getValidMoves(board)).toEqual([]);
    });
  });
});