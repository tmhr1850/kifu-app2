import { Dragon } from './dragon';
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

describe('Dragon（竜）', () => {
  describe('コンストラクタ', () => {
    it('正しく竜を作成できる', () => {
      const position: Position = { row: 5, column: 5 };
      const dragon = new Dragon(Player.SENTE, position);

      expect(dragon.type).toBe(PieceType.DRAGON);
      expect(dragon.player).toBe(Player.SENTE);
      expect(dragon.position).toEqual(position);
    });
  });

  describe('getValidMoves', () => {
    it('飛車の動き（縦横）に加えて、斜め1マスに移動できる', () => {
      const board = new MockBoard();
      const dragon = new Dragon(Player.SENTE, { row: 5, column: 5 });
      board.setPieceAt({ row: 5, column: 5 }, dragon);

      const moves = dragon.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      // 飛車と同じ縦横の動き
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
      
      // 斜め1マス
      expect(destinations).toContainEqual({ row: 4, column: 4 });
      expect(destinations).toContainEqual({ row: 4, column: 6 });
      expect(destinations).toContainEqual({ row: 6, column: 4 });
      expect(destinations).toContainEqual({ row: 6, column: 6 });
      
      expect(destinations).toHaveLength(20);
      
      // 斜め2マス以上は移動できない
      expect(destinations).not.toContainEqual({ row: 3, column: 3 });
      expect(destinations).not.toContainEqual({ row: 7, column: 7 });
    });

    it('縦横の移動は他の駒を飛び越えることができない', () => {
      const board = new MockBoard();
      const dragon = new Dragon(Player.SENTE, { row: 5, column: 5 });
      const blockingPiece = new Dragon(Player.GOTE, { row: 3, column: 5 });
      
      board.setPieceAt({ row: 5, column: 5 }, dragon);
      board.setPieceAt({ row: 3, column: 5 }, blockingPiece);

      const moves = dragon.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      // 敵の駒の位置までは移動できる
      expect(destinations).toContainEqual({ row: 3, column: 5 });
      // その先には移動できない
      expect(destinations).not.toContainEqual({ row: 2, column: 5 });
      expect(destinations).not.toContainEqual({ row: 1, column: 5 });
    });

    it('斜め1マスの移動でも味方の駒がある場所には移動できない', () => {
      const board = new MockBoard();
      const dragon = new Dragon(Player.SENTE, { row: 5, column: 5 });
      const allyPiece = new Dragon(Player.SENTE, { row: 4, column: 4 });
      
      board.setPieceAt({ row: 5, column: 5 }, dragon);
      board.setPieceAt({ row: 4, column: 4 }, allyPiece);

      const moves = dragon.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      expect(destinations).not.toContainEqual({ row: 4, column: 4 });
    });

    it('持ち駒の場合は移動できない', () => {
      const board = new MockBoard();
      const dragon = new Dragon(Player.SENTE);

      const moves = dragon.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });
  });

  describe('canPromote', () => {
    it('竜は成れない（すでに成り駒）', () => {
      const dragon = new Dragon(Player.SENTE, { row: 5, column: 5 });
      
      expect(dragon.canPromote({ row: 1, column: 5 })).toBe(false);
      expect(dragon.canPromote({ row: 3, column: 5 })).toBe(false);
    });
  });

  describe('promote', () => {
    it('竜は成り駒に変換できない', () => {
      const dragon = new Dragon(Player.SENTE, { row: 5, column: 5 });
      
      expect(() => dragon.promote()).toThrow('この駒は成ることができません');
    });
  });
});