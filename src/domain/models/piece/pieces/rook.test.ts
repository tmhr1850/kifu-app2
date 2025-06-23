import { Rook } from './rook';
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

describe('Rook（飛車）', () => {
  describe('コンストラクタ', () => {
    it('正しく飛車を作成できる', () => {
      const position: Position = { row: 5, column: 5 };
      const rook = new Rook(Player.SENTE, position);

      expect(rook.type).toBe(PieceType.ROOK);
      expect(rook.player).toBe(Player.SENTE);
      expect(rook.position).toEqual(position);
    });
  });

  describe('getValidMoves', () => {
    it('縦横に自由に移動できる', () => {
      const board = new MockBoard();
      const rook = new Rook(Player.SENTE, { row: 5, column: 5 });
      board.setPieceAt({ row: 5, column: 5 }, rook);

      const moves = rook.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      // 上方向
      expect(destinations).toContainEqual({ row: 4, column: 5 });
      expect(destinations).toContainEqual({ row: 3, column: 5 });
      expect(destinations).toContainEqual({ row: 2, column: 5 });
      expect(destinations).toContainEqual({ row: 1, column: 5 });
      
      // 下方向
      expect(destinations).toContainEqual({ row: 6, column: 5 });
      expect(destinations).toContainEqual({ row: 7, column: 5 });
      expect(destinations).toContainEqual({ row: 8, column: 5 });
      expect(destinations).toContainEqual({ row: 9, column: 5 });
      
      // 左方向
      expect(destinations).toContainEqual({ row: 5, column: 4 });
      expect(destinations).toContainEqual({ row: 5, column: 3 });
      expect(destinations).toContainEqual({ row: 5, column: 2 });
      expect(destinations).toContainEqual({ row: 5, column: 1 });
      
      // 右方向
      expect(destinations).toContainEqual({ row: 5, column: 6 });
      expect(destinations).toContainEqual({ row: 5, column: 7 });
      expect(destinations).toContainEqual({ row: 5, column: 8 });
      expect(destinations).toContainEqual({ row: 5, column: 9 });
      
      expect(destinations).toHaveLength(16);
      
      // 斜めには移動できない
      expect(destinations).not.toContainEqual({ row: 4, column: 4 });
      expect(destinations).not.toContainEqual({ row: 6, column: 6 });
    });

    it('他の駒を飛び越えることはできない', () => {
      const board = new MockBoard();
      const rook = new Rook(Player.SENTE, { row: 5, column: 5 });
      const blockingPiece = new Rook(Player.GOTE, { row: 3, column: 5 });
      
      board.setPieceAt({ row: 5, column: 5 }, rook);
      board.setPieceAt({ row: 3, column: 5 }, blockingPiece);

      const moves = rook.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      // 敵の駒の位置までは移動できる
      expect(destinations).toContainEqual({ row: 3, column: 5 });
      // その先には移動できない
      expect(destinations).not.toContainEqual({ row: 2, column: 5 });
      expect(destinations).not.toContainEqual({ row: 1, column: 5 });
    });

    it('味方の駒の手前までしか移動できない', () => {
      const board = new MockBoard();
      const rook = new Rook(Player.SENTE, { row: 5, column: 5 });
      const allyPiece = new Rook(Player.SENTE, { row: 3, column: 5 });
      
      board.setPieceAt({ row: 5, column: 5 }, rook);
      board.setPieceAt({ row: 3, column: 5 }, allyPiece);

      const moves = rook.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      // 味方の駒の手前まで
      expect(destinations).toContainEqual({ row: 4, column: 5 });
      // 味方の駒の位置には移動できない
      expect(destinations).not.toContainEqual({ row: 3, column: 5 });
      // その先にも移動できない
      expect(destinations).not.toContainEqual({ row: 2, column: 5 });
    });

    it('持ち駒の場合は移動できない', () => {
      const board = new MockBoard();
      const rook = new Rook(Player.SENTE);

      const moves = rook.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });
  });

  describe('canPromote', () => {
    it('敵陣に入る時に成れる', () => {
      const rook = new Rook(Player.SENTE, { row: 4, column: 5 });
      
      expect(rook.canPromote({ row: 3, column: 5 })).toBe(true);
      expect(rook.canPromote({ row: 2, column: 5 })).toBe(true);
    });

    it('敵陣から出る時も成れる', () => {
      const rook = new Rook(Player.SENTE, { row: 3, column: 5 });
      
      expect(rook.canPromote({ row: 4, column: 5 })).toBe(true);
    });

    it('敵陣内での移動でも成れる', () => {
      const rook = new Rook(Player.SENTE, { row: 2, column: 5 });
      
      expect(rook.canPromote({ row: 1, column: 5 })).toBe(true);
    });
  });

  describe('promote', () => {
    it('飛車を竜に変換できる', () => {
      const rook = new Rook(Player.SENTE, { row: 5, column: 5 });
      const dragon = rook.promote();
      
      expect(dragon.type).toBe(PieceType.DRAGON);
      expect(dragon.player).toBe(Player.SENTE);
      expect(dragon.position).toEqual(rook.position);
    });
  });
});