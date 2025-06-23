import { Silver } from './silver';
import { createPiece } from '../factory';
import { IBoard, IPiece } from '../interface';
import { Move, PieceType, Player, Position } from '../types';

// モックボードの作成
class MockBoard implements IBoard {
  private pieces: Map<string, IPiece> = new Map();

  getPiece(position: Position): IPiece | null {
    const key = `${position.row}-${position.column}`;
    return this.pieces.get(key) || null;
  }

  isValidPosition(position: Position): boolean {
    return position.row >= 0 && position.row < 9 && 
           position.column >= 0 && position.column < 9;
  }

  setPiece(position: Position, piece: IPiece | null): void {
    if (!piece) {
      const key = `${position.row}-${position.column}`;
      this.pieces.delete(key);
      return;
    }
    const key = `${position.row}-${position.column}`;
    this.pieces.set(key, piece);
  }

  clone(): IBoard {
    const newBoard = new MockBoard();
    this.pieces.forEach((piece, key) => {
      newBoard.pieces.set(key, piece.clone());
    });
    return newBoard;
  }

  getPieces(player: Player): IPiece[] {
    return Array.from(this.pieces.values()).filter(p => p.player === player);
  }

  findKing(player: Player): Position | null {
    for (const piece of this.pieces.values()) {
      if (piece.type === PieceType.KING && piece.player === player) {
        return piece.position;
      }
    }
    return null;
  }

  applyMove(move: Move): IBoard {
    const newBoard = this.clone();
    const piece = newBoard.getPiece(move.from);
    if (piece) {
      newBoard.setPiece(move.from, null);
      newBoard.setPiece(move.to, piece.clone(move.to));
    }
    return newBoard;
  }
}

describe('Silver（銀）', () => {
  describe('コンストラクタ', () => {
    it('正しく銀を作成できる', () => {
      const position: Position = { row: 4, column: 4 };
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
        const silver = new Silver(Player.SENTE, { row: 4, column: 4 });
        board.setPiece({ row: 4, column: 4 }, silver);

        const destinations = silver.getValidMoves(board);

        // 前方3マス
        expect(destinations).toContainEqual({ row: 3, column: 3 });
        expect(destinations).toContainEqual({ row: 3, column: 4 });
        expect(destinations).toContainEqual({ row: 3, column: 5 });
        // 斜め後ろ2マス
        expect(destinations).toContainEqual({ row: 5, column: 3 });
        expect(destinations).toContainEqual({ row: 5, column: 5 });
        
        expect(destinations).toHaveLength(5);
        // 横と真後ろには移動できない
        expect(destinations).not.toContainEqual({ row: 4, column: 3 });
        expect(destinations).not.toContainEqual({ row: 4, column: 5 });
        expect(destinations).not.toContainEqual({ row: 5, column: 4 });
      });
    });

    describe('後手の場合', () => {
      it('前方3マス、斜め後ろ2マスに移動できる（後手の向き）', () => {
        const board = new MockBoard();
        const silver = new Silver(Player.GOTE, { row: 4, column: 4 });
        board.setPiece({ row: 4, column: 4 }, silver);

        const destinations = silver.getValidMoves(board);

        // 前方3マス（後手は下向き）
        expect(destinations).toContainEqual({ row: 5, column: 3 });
        expect(destinations).toContainEqual({ row: 5, column: 4 });
        expect(destinations).toContainEqual({ row: 5, column: 5 });
        // 斜め後ろ2マス
        expect(destinations).toContainEqual({ row: 3, column: 3 });
        expect(destinations).toContainEqual({ row: 3, column: 5 });
        
        expect(destinations).toHaveLength(5);
      });
    });

    it('盤面の端では移動可能マスが制限される', () => {
      const board = new MockBoard();
      const silver = new Silver(Player.SENTE, { row: 0, column: 0 });
      board.setPiece({ row: 0, column: 0 }, silver);

      const moves = silver.getValidMoves(board);
      expect(moves).toHaveLength(1); // Only (1, 1) is valid
      const destinations = moves;
      expect(destinations).toContainEqual({ row: 1, column: 1 });
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
      const silver = new Silver(Player.SENTE, { row: 3, column: 4 });
      
      expect(silver.canPromote({ row: 2, column: 4 })).toBe(true);
      expect(silver.canPromote({ row: 1, column: 4 })).toBe(true);
    });

    it('敵陣から出る時も成れる', () => {
      const silver = new Silver(Player.SENTE, { row: 2, column: 4 });
      
      expect(silver.canPromote({ row: 3, column: 4 })).toBe(true);
    });

    it('敵陣外での移動では成れない', () => {
      const silver = new Silver(Player.SENTE, { row: 4, column: 4 });
      
      expect(silver.canPromote({ row: 3, column: 4 })).toBe(false);
    });
  });

  describe('promote', () => {
    it('銀を成銀に変換できる', () => {
      const silver = new Silver(Player.SENTE, { row: 4, column: 4 });
      const promoted = silver.promote(createPiece);
      
      expect(promoted.type).toBe(PieceType.PROMOTED_SILVER);
      expect(promoted.player).toBe(Player.SENTE);
      expect(promoted.position).toEqual(silver.position);
    });
  });
});