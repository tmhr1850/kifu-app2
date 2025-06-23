import { Silver } from './silver';
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

describe('Silver（銀）', () => {
  describe('コンストラクタ', () => {
    it('正しく銀を作成できる', () => {
      const position: Position = { row: 5, column: 5 };
      const silver = new Silver(Player.SENTE, position);

      expect(silver.type).toBe(PieceType.SILVER);
      expect(silver.player).toBe(Player.SENTE);
      expect(silver.position).toEqual(position);
    });
  });

  describe('getValidMoves', () => {
    describe('先手の場合', () => {
      it('前方3マス、斜め後ろ2マスに移動できる', () => {
        const board = new MockBoard();
        const silver = new Silver(Player.SENTE, { row: 5, column: 5 });
        board.setPieceAt({ row: 5, column: 5 }, silver);

        const moves = silver.getValidMoves(board);
        const destinations = moves.map(move => move.to);

        // 前方3マス
        expect(destinations).toContainEqual({ row: 4, column: 4 });
        expect(destinations).toContainEqual({ row: 4, column: 5 });
        expect(destinations).toContainEqual({ row: 4, column: 6 });
        // 斜め後ろ2マス
        expect(destinations).toContainEqual({ row: 6, column: 4 });
        expect(destinations).toContainEqual({ row: 6, column: 6 });
        
        expect(destinations).toHaveLength(5);
        // 横と真後ろには移動できない
        expect(destinations).not.toContainEqual({ row: 5, column: 4 });
        expect(destinations).not.toContainEqual({ row: 5, column: 6 });
        expect(destinations).not.toContainEqual({ row: 6, column: 5 });
      });
    });

    describe('後手の場合', () => {
      it('前方3マス、斜め後ろ2マスに移動できる（後手の向き）', () => {
        const board = new MockBoard();
        const silver = new Silver(Player.GOTE, { row: 5, column: 5 });
        board.setPieceAt({ row: 5, column: 5 }, silver);

        const moves = silver.getValidMoves(board);
        const destinations = moves.map(move => move.to);

        // 前方3マス（後手は下向き）
        expect(destinations).toContainEqual({ row: 6, column: 4 });
        expect(destinations).toContainEqual({ row: 6, column: 5 });
        expect(destinations).toContainEqual({ row: 6, column: 6 });
        // 斜め後ろ2マス
        expect(destinations).toContainEqual({ row: 4, column: 4 });
        expect(destinations).toContainEqual({ row: 4, column: 6 });
        
        expect(destinations).toHaveLength(5);
      });
    });

    it('盤面の端では移動可能マスが制限される', () => {
      const board = new MockBoard();
      const silver = new Silver(Player.SENTE, { row: 1, column: 1 });
      board.setPieceAt({ row: 1, column: 1 }, silver);

      const moves = silver.getValidMoves(board);
      expect(moves).toHaveLength(1); // 右斜め前(2,2)のみ
    });

    it('持ち駒の場合は移動できない', () => {
      const board = new MockBoard();
      const silver = new Silver(Player.SENTE);

      const moves = silver.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });
  });

  describe('canPromote', () => {
    it('敵陣に入る時に成れる', () => {
      const silver = new Silver(Player.SENTE, { row: 4, column: 5 });
      
      expect(silver.canPromote({ row: 3, column: 5 })).toBe(true);
      expect(silver.canPromote({ row: 2, column: 5 })).toBe(true);
    });

    it('敵陣から出る時も成れる', () => {
      const silver = new Silver(Player.SENTE, { row: 3, column: 5 });
      
      expect(silver.canPromote({ row: 4, column: 5 })).toBe(true);
    });

    it('敵陣外での移動では成れない', () => {
      const silver = new Silver(Player.SENTE, { row: 5, column: 5 });
      
      expect(silver.canPromote({ row: 6, column: 5 })).toBe(false);
    });
  });

  describe('promote', () => {
    it('銀を成銀に変換できる', () => {
      const silver = new Silver(Player.SENTE, { row: 5, column: 5 });
      const promoted = silver.promote();
      
      expect(promoted.type).toBe(PieceType.PROMOTED_SILVER);
      expect(promoted.player).toBe(Player.SENTE);
      expect(promoted.position).toEqual(silver.position);
    });
  });
});