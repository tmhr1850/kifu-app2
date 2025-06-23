import { Bishop } from './bishop';
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

describe('Bishop（角）', () => {
  describe('コンストラクタ', () => {
    it('正しく角を作成できる', () => {
      const position: Position = { row: 5, column: 5 };
      const bishop = new Bishop(Player.SENTE, position);

      expect(bishop.type).toBe(PieceType.BISHOP);
      expect(bishop.player).toBe(Player.SENTE);
      expect(bishop.position).toEqual(position);
    });
  });

  describe('getValidMoves', () => {
    it('斜めに自由に移動できる', () => {
      const board = new MockBoard();
      const bishop = new Bishop(Player.SENTE, { row: 5, column: 5 });
      board.setPieceAt({ row: 5, column: 5 }, bishop);

      const moves = bishop.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      // 左上方向
      expect(destinations).toContainEqual({ row: 4, column: 4 });
      expect(destinations).toContainEqual({ row: 3, column: 3 });
      expect(destinations).toContainEqual({ row: 2, column: 2 });
      expect(destinations).toContainEqual({ row: 1, column: 1 });
      
      // 右上方向
      expect(destinations).toContainEqual({ row: 4, column: 6 });
      expect(destinations).toContainEqual({ row: 3, column: 7 });
      expect(destinations).toContainEqual({ row: 2, column: 8 });
      expect(destinations).toContainEqual({ row: 1, column: 9 });
      
      // 左下方向
      expect(destinations).toContainEqual({ row: 6, column: 4 });
      expect(destinations).toContainEqual({ row: 7, column: 3 });
      expect(destinations).toContainEqual({ row: 8, column: 2 });
      expect(destinations).toContainEqual({ row: 9, column: 1 });
      
      // 右下方向
      expect(destinations).toContainEqual({ row: 6, column: 6 });
      expect(destinations).toContainEqual({ row: 7, column: 7 });
      expect(destinations).toContainEqual({ row: 8, column: 8 });
      expect(destinations).toContainEqual({ row: 9, column: 9 });
      
      expect(destinations).toHaveLength(16);
      
      // 縦横には移動できない
      expect(destinations).not.toContainEqual({ row: 4, column: 5 });
      expect(destinations).not.toContainEqual({ row: 5, column: 4 });
    });

    it('他の駒を飛び越えることはできない', () => {
      const board = new MockBoard();
      const bishop = new Bishop(Player.SENTE, { row: 5, column: 5 });
      const blockingPiece = new Bishop(Player.GOTE, { row: 3, column: 3 });
      
      board.setPieceAt({ row: 5, column: 5 }, bishop);
      board.setPieceAt({ row: 3, column: 3 }, blockingPiece);

      const moves = bishop.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      // 敵の駒の位置までは移動できる
      expect(destinations).toContainEqual({ row: 3, column: 3 });
      // その先には移動できない
      expect(destinations).not.toContainEqual({ row: 2, column: 2 });
      expect(destinations).not.toContainEqual({ row: 1, column: 1 });
    });

    it('味方の駒の手前までしか移動できない', () => {
      const board = new MockBoard();
      const bishop = new Bishop(Player.SENTE, { row: 5, column: 5 });
      const allyPiece = new Bishop(Player.SENTE, { row: 3, column: 3 });
      
      board.setPieceAt({ row: 5, column: 5 }, bishop);
      board.setPieceAt({ row: 3, column: 3 }, allyPiece);

      const moves = bishop.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      // 味方の駒の手前まで
      expect(destinations).toContainEqual({ row: 4, column: 4 });
      // 味方の駒の位置には移動できない
      expect(destinations).not.toContainEqual({ row: 3, column: 3 });
      // その先にも移動できない
      expect(destinations).not.toContainEqual({ row: 2, column: 2 });
    });

    it('持ち駒の場合は移動できない', () => {
      const board = new MockBoard();
      const bishop = new Bishop(Player.SENTE);

      const moves = bishop.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });
  });

  describe('canPromote', () => {
    it('敵陣に入る時に成れる', () => {
      const bishop = new Bishop(Player.SENTE, { row: 4, column: 5 });
      
      expect(bishop.canPromote({ row: 3, column: 4 })).toBe(true);
      expect(bishop.canPromote({ row: 2, column: 3 })).toBe(true);
    });

    it('敵陣から出る時も成れる', () => {
      const bishop = new Bishop(Player.SENTE, { row: 3, column: 5 });
      
      expect(bishop.canPromote({ row: 4, column: 6 })).toBe(true);
    });

    it('敵陣内での移動でも成れる', () => {
      const bishop = new Bishop(Player.SENTE, { row: 2, column: 5 });
      
      expect(bishop.canPromote({ row: 1, column: 4 })).toBe(true);
    });
  });

  describe('promote', () => {
    it('角を馬に変換できる', () => {
      const bishop = new Bishop(Player.SENTE, { row: 5, column: 5 });
      const horse = bishop.promote();
      
      expect(horse.type).toBe(PieceType.HORSE);
      expect(horse.player).toBe(Player.SENTE);
      expect(horse.position).toEqual(bishop.position);
    });
  });
});