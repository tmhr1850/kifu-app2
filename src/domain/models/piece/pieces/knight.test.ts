import { Knight } from './knight';
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

describe('Knight（桂馬）', () => {
  describe('コンストラクタ', () => {
    it('正しく桂馬を作成できる', () => {
      const position: Position = { row: 5, column: 5 };
      const knight = new Knight(Player.SENTE, position);

      expect(knight.type).toBe(PieceType.KNIGHT);
      expect(knight.player).toBe(Player.SENTE);
      expect(knight.position).toEqual(position);
    });
  });

  describe('getValidMoves', () => {
    describe('先手の場合', () => {
      it('前方斜め2マスに移動できる', () => {
        const board = new MockBoard();
        const knight = new Knight(Player.SENTE, { row: 5, column: 5 });
        board.setPieceAt({ row: 5, column: 5 }, knight);

        const moves = knight.getValidMoves(board);
        const destinations = moves.map(move => move.to);

        // 左前方
        expect(destinations).toContainEqual({ row: 3, column: 4 });
        // 右前方
        expect(destinations).toContainEqual({ row: 3, column: 6 });
        
        expect(destinations).toHaveLength(2);
        
        // 他の方向には移動できない
        expect(destinations).not.toContainEqual({ row: 7, column: 4 });
        expect(destinations).not.toContainEqual({ row: 7, column: 6 });
        expect(destinations).not.toContainEqual({ row: 4, column: 5 });
      });

      it('盤面の端では移動可能マスが制限される', () => {
        const board = new MockBoard();
        const knight = new Knight(Player.SENTE, { row: 3, column: 1 });
        board.setPieceAt({ row: 3, column: 1 }, knight);

        const moves = knight.getValidMoves(board);
        const destinations = moves.map(move => move.to);

        // 右前方のみ
        expect(destinations).toContainEqual({ row: 1, column: 2 });
        expect(destinations).toHaveLength(1);
      });

      it('1段目、2段目では移動できない（移動先がない）', () => {
        const board = new MockBoard();
        const knight1 = new Knight(Player.SENTE, { row: 1, column: 5 });
        const knight2 = new Knight(Player.SENTE, { row: 2, column: 5 });
        board.setPieceAt({ row: 1, column: 5 }, knight1);
        board.setPieceAt({ row: 2, column: 5 }, knight2);

        expect(knight1.getValidMoves(board)).toHaveLength(0);
        expect(knight2.getValidMoves(board)).toHaveLength(0);
      });
    });

    describe('後手の場合', () => {
      it('前方斜め2マスに移動できる（後手の向き）', () => {
        const board = new MockBoard();
        const knight = new Knight(Player.GOTE, { row: 5, column: 5 });
        board.setPieceAt({ row: 5, column: 5 }, knight);

        const moves = knight.getValidMoves(board);
        const destinations = moves.map(move => move.to);

        // 左前方（後手は下向き）
        expect(destinations).toContainEqual({ row: 7, column: 4 });
        // 右前方
        expect(destinations).toContainEqual({ row: 7, column: 6 });
        
        expect(destinations).toHaveLength(2);
      });

      it('8段目、9段目では移動できない（移動先がない）', () => {
        const board = new MockBoard();
        const knight1 = new Knight(Player.GOTE, { row: 8, column: 5 });
        const knight2 = new Knight(Player.GOTE, { row: 9, column: 5 });
        board.setPieceAt({ row: 8, column: 5 }, knight1);
        board.setPieceAt({ row: 9, column: 5 }, knight2);

        expect(knight1.getValidMoves(board)).toHaveLength(0);
        expect(knight2.getValidMoves(board)).toHaveLength(0);
      });
    });

    it('味方の駒がある場所には移動できない', () => {
      const board = new MockBoard();
      const knight = new Knight(Player.SENTE, { row: 5, column: 5 });
      const allyPiece = new Knight(Player.SENTE, { row: 3, column: 4 });
      
      board.setPieceAt({ row: 5, column: 5 }, knight);
      board.setPieceAt({ row: 3, column: 4 }, allyPiece);

      const moves = knight.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      expect(destinations).not.toContainEqual({ row: 3, column: 4 });
      expect(destinations).toHaveLength(1);
    });

    it('他の駒を飛び越えて移動できる', () => {
      const board = new MockBoard();
      const knight = new Knight(Player.SENTE, { row: 5, column: 5 });
      const blockingPiece = new Knight(Player.GOTE, { row: 4, column: 5 });
      
      board.setPieceAt({ row: 5, column: 5 }, knight);
      board.setPieceAt({ row: 4, column: 5 }, blockingPiece);

      const moves = knight.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      // 前に駒があっても飛び越えて移動できる
      expect(destinations).toContainEqual({ row: 3, column: 4 });
      expect(destinations).toContainEqual({ row: 3, column: 6 });
      expect(destinations).toHaveLength(2);
    });

    it('持ち駒の場合は移動できない', () => {
      const board = new MockBoard();
      const knight = new Knight(Player.SENTE);

      const moves = knight.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });
  });

  describe('canPromote', () => {
    it('先手の場合、敵陣に入る時に成れる', () => {
      const knight = new Knight(Player.SENTE, { row: 5, column: 5 });
      
      expect(knight.canPromote({ row: 3, column: 4 })).toBe(true);
    });

    it('先手の場合、3段目から1段目への移動時は強制的に成る必要がある', () => {
      const knight = new Knight(Player.SENTE, { row: 3, column: 5 });
      
      // この実装では canPromote は true を返すが、
      // 実際のゲームロジックでは強制成りの判定が必要
      expect(knight.canPromote({ row: 1, column: 4 })).toBe(true);
    });

    it('後手の場合、敵陣に入る時に成れる', () => {
      const knight = new Knight(Player.GOTE, { row: 5, column: 5 });
      
      expect(knight.canPromote({ row: 7, column: 4 })).toBe(true);
    });
  });

  describe('promote', () => {
    it('桂馬を成桂に変換できる', () => {
      const knight = new Knight(Player.SENTE, { row: 5, column: 5 });
      const promoted = knight.promote();
      
      expect(promoted.type).toBe(PieceType.PROMOTED_KNIGHT);
      expect(promoted.player).toBe(Player.SENTE);
      expect(promoted.position).toEqual(knight.position);
    });
  });
});