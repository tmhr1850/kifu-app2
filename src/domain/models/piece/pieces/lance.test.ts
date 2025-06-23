import { Lance } from './lance';
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

describe('Lance（香車）', () => {
  describe('コンストラクタ', () => {
    it('正しく香車を作成できる', () => {
      const position: Position = { row: 5, column: 5 };
      const lance = new Lance(Player.SENTE, position);

      expect(lance.type).toBe(PieceType.LANCE);
      expect(lance.player).toBe(Player.SENTE);
      expect(lance.position).toEqual(position);
    });
  });

  describe('getValidMoves', () => {
    describe('先手の場合', () => {
      it('前方に自由に移動できる', () => {
        const board = new MockBoard();
        const lance = new Lance(Player.SENTE, { row: 5, column: 5 });
        board.setPieceAt({ row: 5, column: 5 }, lance);

        const moves = lance.getValidMoves(board);
        const destinations = moves.map(move => move.to);

        // 前方のみ
        expect(destinations).toContainEqual({ row: 4, column: 5 });
        expect(destinations).toContainEqual({ row: 3, column: 5 });
        expect(destinations).toContainEqual({ row: 2, column: 5 });
        expect(destinations).toContainEqual({ row: 1, column: 5 });
        
        expect(destinations).toHaveLength(4);
        
        // 横や後ろには移動できない
        expect(destinations).not.toContainEqual({ row: 6, column: 5 });
        expect(destinations).not.toContainEqual({ row: 5, column: 4 });
        expect(destinations).not.toContainEqual({ row: 5, column: 6 });
      });

      it('1段目では移動できない（移動先がない）', () => {
        const board = new MockBoard();
        const lance = new Lance(Player.SENTE, { row: 1, column: 5 });
        board.setPieceAt({ row: 1, column: 5 }, lance);

        const moves = lance.getValidMoves(board);
        expect(moves).toHaveLength(0);
      });
    });

    describe('後手の場合', () => {
      it('前方に自由に移動できる（後手の向き）', () => {
        const board = new MockBoard();
        const lance = new Lance(Player.GOTE, { row: 5, column: 5 });
        board.setPieceAt({ row: 5, column: 5 }, lance);

        const moves = lance.getValidMoves(board);
        const destinations = moves.map(move => move.to);

        // 前方のみ（後手は下向き）
        expect(destinations).toContainEqual({ row: 6, column: 5 });
        expect(destinations).toContainEqual({ row: 7, column: 5 });
        expect(destinations).toContainEqual({ row: 8, column: 5 });
        expect(destinations).toContainEqual({ row: 9, column: 5 });
        
        expect(destinations).toHaveLength(4);
      });

      it('9段目では移動できない（移動先がない）', () => {
        const board = new MockBoard();
        const lance = new Lance(Player.GOTE, { row: 9, column: 5 });
        board.setPieceAt({ row: 9, column: 5 }, lance);

        const moves = lance.getValidMoves(board);
        expect(moves).toHaveLength(0);
      });
    });

    it('他の駒を飛び越えることはできない', () => {
      const board = new MockBoard();
      const lance = new Lance(Player.SENTE, { row: 5, column: 5 });
      const blockingPiece = new Lance(Player.GOTE, { row: 3, column: 5 });
      
      board.setPieceAt({ row: 5, column: 5 }, lance);
      board.setPieceAt({ row: 3, column: 5 }, blockingPiece);

      const moves = lance.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      // 敵の駒の位置までは移動できる
      expect(destinations).toContainEqual({ row: 3, column: 5 });
      // その先には移動できない
      expect(destinations).not.toContainEqual({ row: 2, column: 5 });
      expect(destinations).not.toContainEqual({ row: 1, column: 5 });
      expect(destinations).toHaveLength(2); // 4と3のみ
    });

    it('味方の駒の手前までしか移動できない', () => {
      const board = new MockBoard();
      const lance = new Lance(Player.SENTE, { row: 5, column: 5 });
      const allyPiece = new Lance(Player.SENTE, { row: 3, column: 5 });
      
      board.setPieceAt({ row: 5, column: 5 }, lance);
      board.setPieceAt({ row: 3, column: 5 }, allyPiece);

      const moves = lance.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      // 味方の駒の手前まで
      expect(destinations).toContainEqual({ row: 4, column: 5 });
      // 味方の駒の位置には移動できない
      expect(destinations).not.toContainEqual({ row: 3, column: 5 });
      expect(destinations).toHaveLength(1);
    });

    it('持ち駒の場合は移動できない', () => {
      const board = new MockBoard();
      const lance = new Lance(Player.SENTE);

      const moves = lance.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });
  });

  describe('canPromote', () => {
    it('先手の場合、敵陣に入る時に成れる', () => {
      const lance = new Lance(Player.SENTE, { row: 4, column: 5 });
      
      expect(lance.canPromote({ row: 3, column: 5 })).toBe(true);
      expect(lance.canPromote({ row: 2, column: 5 })).toBe(true);
    });

    it('先手の場合、2段目から1段目への移動時は強制的に成る必要がある', () => {
      const lance = new Lance(Player.SENTE, { row: 2, column: 5 });
      
      // この実装では canPromote は true を返すが、
      // 実際のゲームロジックでは強制成りの判定が必要
      expect(lance.canPromote({ row: 1, column: 5 })).toBe(true);
    });

    it('後手の場合、敵陣に入る時に成れる', () => {
      const lance = new Lance(Player.GOTE, { row: 6, column: 5 });
      
      expect(lance.canPromote({ row: 7, column: 5 })).toBe(true);
      expect(lance.canPromote({ row: 8, column: 5 })).toBe(true);
    });
  });

  describe('promote', () => {
    it('香車を成香に変換できる', () => {
      const lance = new Lance(Player.SENTE, { row: 5, column: 5 });
      const promoted = lance.promote();
      
      expect(promoted.type).toBe(PieceType.PROMOTED_LANCE);
      expect(promoted.player).toBe(Player.SENTE);
      expect(promoted.position).toEqual(lance.position);
    });
  });
});