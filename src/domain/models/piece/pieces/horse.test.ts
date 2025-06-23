import { Horse } from './horse';
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

describe('Horse（馬）', () => {
  describe('コンストラクタ', () => {
    it('正しく馬を作成できる', () => {
      const position: Position = { row: 5, column: 5 };
      const horse = new Horse(Player.SENTE, position);

      expect(horse.type).toBe(PieceType.HORSE);
      expect(horse.player).toBe(Player.SENTE);
      expect(horse.position).toEqual(position);
    });
  });

  describe('getValidMoves', () => {
    it('角の動き（斜め）に加えて、縦横1マスに移動できる', () => {
      const board = new MockBoard();
      const horse = new Horse(Player.SENTE, { row: 5, column: 5 });
      board.setPieceAt({ row: 5, column: 5 }, horse);

      const moves = horse.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      // 角と同じ斜めの動き
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
      
      // 縦横1マス
      expect(destinations).toContainEqual({ row: 4, column: 5 });
      expect(destinations).toContainEqual({ row: 6, column: 5 });
      expect(destinations).toContainEqual({ row: 5, column: 4 });
      expect(destinations).toContainEqual({ row: 5, column: 6 });
      
      expect(destinations).toHaveLength(20);
      
      // 縦横2マス以上は移動できない
      expect(destinations).not.toContainEqual({ row: 3, column: 5 });
      expect(destinations).not.toContainEqual({ row: 5, column: 3 });
    });

    it('斜めの移動は他の駒を飛び越えることができない', () => {
      const board = new MockBoard();
      const horse = new Horse(Player.SENTE, { row: 5, column: 5 });
      const blockingPiece = new Horse(Player.GOTE, { row: 3, column: 3 });
      
      board.setPieceAt({ row: 5, column: 5 }, horse);
      board.setPieceAt({ row: 3, column: 3 }, blockingPiece);

      const moves = horse.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      // 敵の駒の位置までは移動できる
      expect(destinations).toContainEqual({ row: 3, column: 3 });
      // その先には移動できない
      expect(destinations).not.toContainEqual({ row: 2, column: 2 });
      expect(destinations).not.toContainEqual({ row: 1, column: 1 });
    });

    it('縦横1マスの移動でも味方の駒がある場所には移動できない', () => {
      const board = new MockBoard();
      const horse = new Horse(Player.SENTE, { row: 5, column: 5 });
      const allyPiece = new Horse(Player.SENTE, { row: 4, column: 5 });
      
      board.setPieceAt({ row: 5, column: 5 }, horse);
      board.setPieceAt({ row: 4, column: 5 }, allyPiece);

      const moves = horse.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      expect(destinations).not.toContainEqual({ row: 4, column: 5 });
    });

    it('持ち駒の場合は移動できない', () => {
      const board = new MockBoard();
      const horse = new Horse(Player.SENTE);

      const moves = horse.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });
  });

  describe('canPromote', () => {
    it('馬は成れない（すでに成り駒）', () => {
      const horse = new Horse(Player.SENTE, { row: 5, column: 5 });
      
      expect(horse.canPromote({ row: 1, column: 5 })).toBe(false);
      expect(horse.canPromote({ row: 3, column: 5 })).toBe(false);
    });
  });

  describe('promote', () => {
    it('馬は成り駒に変換できない', () => {
      const horse = new Horse(Player.SENTE, { row: 5, column: 5 });
      
      expect(() => horse.promote()).toThrow('この駒は成ることができません');
    });
  });
});