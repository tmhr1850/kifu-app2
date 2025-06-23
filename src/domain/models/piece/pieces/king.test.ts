import { King } from './king';
import { PieceType, Player, Position } from '../types';
import { IBoard, IPiece } from '../interface';

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

describe('King（玉）', () => {
  describe('コンストラクタ', () => {
    it('正しく玉を作成できる', () => {
      const position: Position = { row: 5, column: 5 };
      const king = new King(Player.SENTE, position);

      expect(king.type).toBe(PieceType.KING);
      expect(king.player).toBe(Player.SENTE);
      expect(king.position).toEqual(position);
    });
  });

  describe('getValidMoves', () => {
    it('周囲8マスに移動できる', () => {
      const board = new MockBoard();
      const king = new King(Player.SENTE, { row: 5, column: 5 });
      board.setPieceAt({ row: 5, column: 5 }, king);

      const moves = king.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      expect(destinations).toContainEqual({ row: 4, column: 4 });
      expect(destinations).toContainEqual({ row: 4, column: 5 });
      expect(destinations).toContainEqual({ row: 4, column: 6 });
      expect(destinations).toContainEqual({ row: 5, column: 4 });
      expect(destinations).toContainEqual({ row: 5, column: 6 });
      expect(destinations).toContainEqual({ row: 6, column: 4 });
      expect(destinations).toContainEqual({ row: 6, column: 5 });
      expect(destinations).toContainEqual({ row: 6, column: 6 });
      expect(destinations).toHaveLength(8);
    });

    it('盤面の端では移動可能マスが制限される', () => {
      const board = new MockBoard();
      const king = new King(Player.SENTE, { row: 1, column: 1 });
      board.setPieceAt({ row: 1, column: 1 }, king);

      const moves = king.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      expect(destinations).toContainEqual({ row: 1, column: 2 });
      expect(destinations).toContainEqual({ row: 2, column: 1 });
      expect(destinations).toContainEqual({ row: 2, column: 2 });
      expect(destinations).toHaveLength(3);
    });

    it('味方の駒がある場所には移動できない', () => {
      const board = new MockBoard();
      const king = new King(Player.SENTE, { row: 5, column: 5 });
      const allyPiece = new King(Player.SENTE, { row: 4, column: 5 });
      
      board.setPieceAt({ row: 5, column: 5 }, king);
      board.setPieceAt({ row: 4, column: 5 }, allyPiece);

      const moves = king.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      expect(destinations).not.toContainEqual({ row: 4, column: 5 });
      expect(destinations).toHaveLength(7);
    });

    it('敵の駒がある場所には移動できる（取れる）', () => {
      const board = new MockBoard();
      const king = new King(Player.SENTE, { row: 5, column: 5 });
      const enemyPiece = new King(Player.GOTE, { row: 4, column: 5 });
      
      board.setPieceAt({ row: 5, column: 5 }, king);
      board.setPieceAt({ row: 4, column: 5 }, enemyPiece);

      const moves = king.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      expect(destinations).toContainEqual({ row: 4, column: 5 });
      expect(destinations).toHaveLength(8);
    });

    it('持ち駒の場合は移動できない', () => {
      const board = new MockBoard();
      const king = new King(Player.SENTE);

      const moves = king.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });
  });

  describe('canPromote', () => {
    it('玉は成れない', () => {
      const king = new King(Player.SENTE, { row: 5, column: 5 });
      
      expect(king.canPromote({ row: 1, column: 5 })).toBe(false);
      expect(king.canPromote({ row: 3, column: 5 })).toBe(false);
    });
  });

  describe('promote', () => {
    it('玉は成り駒に変換できない', () => {
      const king = new King(Player.SENTE, { row: 5, column: 5 });
      
      expect(() => king.promote()).toThrow('この駒は成ることができません');
    });
  });
});