import { Pawn } from './pawn';
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

describe('Pawn（歩）', () => {
  describe('コンストラクタ', () => {
    it('正しく歩を作成できる', () => {
      const position: Position = { row: 5, column: 5 };
      const pawn = new Pawn(Player.SENTE, position);

      expect(pawn.type).toBe(PieceType.PAWN);
      expect(pawn.player).toBe(Player.SENTE);
      expect(pawn.position).toEqual(position);
    });
  });

  describe('getValidMoves', () => {
    describe('先手の場合', () => {
      it('前方1マスに移動できる', () => {
        const board = new MockBoard();
        const pawn = new Pawn(Player.SENTE, { row: 5, column: 5 });
        board.setPieceAt({ row: 5, column: 5 }, pawn);

        const moves = pawn.getValidMoves(board);
        const destinations = moves.map(move => move.to);

        expect(destinations).toContainEqual({ row: 4, column: 5 });
        expect(destinations).toHaveLength(1);
        
        // 横や後ろ、斜めには移動できない
        expect(destinations).not.toContainEqual({ row: 6, column: 5 });
        expect(destinations).not.toContainEqual({ row: 5, column: 4 });
        expect(destinations).not.toContainEqual({ row: 5, column: 6 });
        expect(destinations).not.toContainEqual({ row: 4, column: 4 });
      });

      it('1段目では移動できない（移動先がない）', () => {
        const board = new MockBoard();
        const pawn = new Pawn(Player.SENTE, { row: 1, column: 5 });
        board.setPieceAt({ row: 1, column: 5 }, pawn);

        const moves = pawn.getValidMoves(board);
        expect(moves).toHaveLength(0);
      });
    });

    describe('後手の場合', () => {
      it('前方1マスに移動できる（後手の向き）', () => {
        const board = new MockBoard();
        const pawn = new Pawn(Player.GOTE, { row: 5, column: 5 });
        board.setPieceAt({ row: 5, column: 5 }, pawn);

        const moves = pawn.getValidMoves(board);
        const destinations = moves.map(move => move.to);

        expect(destinations).toContainEqual({ row: 6, column: 5 });
        expect(destinations).toHaveLength(1);
      });

      it('9段目では移動できない（移動先がない）', () => {
        const board = new MockBoard();
        const pawn = new Pawn(Player.GOTE, { row: 9, column: 5 });
        board.setPieceAt({ row: 9, column: 5 }, pawn);

        const moves = pawn.getValidMoves(board);
        expect(moves).toHaveLength(0);
      });
    });

    it('前に敵の駒がある場合は取れる', () => {
      const board = new MockBoard();
      const pawn = new Pawn(Player.SENTE, { row: 5, column: 5 });
      const enemyPiece = new Pawn(Player.GOTE, { row: 4, column: 5 });
      
      board.setPieceAt({ row: 5, column: 5 }, pawn);
      board.setPieceAt({ row: 4, column: 5 }, enemyPiece);

      const moves = pawn.getValidMoves(board);
      const destinations = moves.map(move => move.to);

      expect(destinations).toContainEqual({ row: 4, column: 5 });
      expect(destinations).toHaveLength(1);
    });

    it('前に味方の駒がある場合は移動できない', () => {
      const board = new MockBoard();
      const pawn = new Pawn(Player.SENTE, { row: 5, column: 5 });
      const allyPiece = new Pawn(Player.SENTE, { row: 4, column: 5 });
      
      board.setPieceAt({ row: 5, column: 5 }, pawn);
      board.setPieceAt({ row: 4, column: 5 }, allyPiece);

      const moves = pawn.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });

    it('持ち駒の場合は移動できない', () => {
      const board = new MockBoard();
      const pawn = new Pawn(Player.SENTE);

      const moves = pawn.getValidMoves(board);
      expect(moves).toHaveLength(0);
    });
  });

  describe('canPromote', () => {
    it('先手の場合、敵陣に入る時に成れる', () => {
      const pawn = new Pawn(Player.SENTE, { row: 4, column: 5 });
      
      expect(pawn.canPromote({ row: 3, column: 5 })).toBe(true);
    });

    it('先手の場合、2段目から1段目への移動時は強制的に成る必要がある', () => {
      const pawn = new Pawn(Player.SENTE, { row: 2, column: 5 });
      
      // この実装では canPromote は true を返すが、
      // 実際のゲームロジックでは強制成りの判定が必要
      expect(pawn.canPromote({ row: 1, column: 5 })).toBe(true);
    });

    it('後手の場合、敵陣に入る時に成れる', () => {
      const pawn = new Pawn(Player.GOTE, { row: 6, column: 5 });
      
      expect(pawn.canPromote({ row: 7, column: 5 })).toBe(true);
    });

    it('敵陣外での移動では成れない', () => {
      const pawn = new Pawn(Player.SENTE, { row: 5, column: 5 });
      
      expect(pawn.canPromote({ row: 4, column: 5 })).toBe(false);
    });
  });

  describe('promote', () => {
    it('歩をと金に変換できる', () => {
      const pawn = new Pawn(Player.SENTE, { row: 5, column: 5 });
      const tokin = pawn.promote();
      
      expect(tokin.type).toBe(PieceType.TOKIN);
      expect(tokin.player).toBe(Player.SENTE);
      expect(tokin.position).toEqual(pawn.position);
    });
  });
});