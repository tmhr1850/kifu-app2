import { Rook } from './rook';
import { IBoard, IPiece } from '../interface';
import { Move, PieceType, Player, Position } from '../types';
import { createPiece } from '../factory';

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

describe('Rook（飛車）', () => {
  describe('コンストラクタ', () => {
    it('正しく飛車を作成できる', () => {
      const position: Position = { row: 4, column: 4 };
      const rook = new Rook(Player.SENTE, position);

      expect(rook.type).toBe(PieceType.ROOK);
      expect(rook.player).toBe(Player.SENTE);
      expect(rook.position).toEqual(position);
    });
  });

  describe('getValidMoves', () => {
    it('縦横に自由に移動できる', () => {
      const board = new MockBoard();
      const rook = new Rook(Player.SENTE, { row: 4, column: 4 });
      board.setPiece({ row: 4, column: 4 }, rook);

      const destinations = rook.getValidMoves(board);

      // 上方向
      expect(destinations).toContainEqual({ row: 3, column: 4 });
      expect(destinations).toContainEqual({ row: 2, column: 4 });
      expect(destinations).toContainEqual({ row: 1, column: 4 });
      expect(destinations).toContainEqual({ row: 0, column: 4 });
      
      // 下方向
      expect(destinations).toContainEqual({ row: 5, column: 4 });
      expect(destinations).toContainEqual({ row: 6, column: 4 });
      expect(destinations).toContainEqual({ row: 7, column: 4 });
      expect(destinations).toContainEqual({ row: 8, column: 4 });
      
      // 左方向
      expect(destinations).toContainEqual({ row: 4, column: 3 });
      expect(destinations).toContainEqual({ row: 4, column: 2 });
      expect(destinations).toContainEqual({ row: 4, column: 1 });
      expect(destinations).toContainEqual({ row: 4, column: 0 });
      
      // 右方向
      expect(destinations).toContainEqual({ row: 4, column: 5 });
      expect(destinations).toContainEqual({ row: 4, column: 6 });
      expect(destinations).toContainEqual({ row: 4, column: 7 });
      expect(destinations).toContainEqual({ row: 4, column: 8 });
      
      expect(destinations).toHaveLength(16);
      
      // 斜めには移動できない
      expect(destinations).not.toContainEqual({ row: 3, column: 3 });
      expect(destinations).not.toContainEqual({ row: 5, column: 5 });
    });

    it('他の駒を飛び越えることはできない', () => {
      const board = new MockBoard();
      const rook = new Rook(Player.SENTE, { row: 4, column: 4 });
      const blockingPiece = new Rook(Player.GOTE, { row: 2, column: 4 });
      
      board.setPiece({ row: 4, column: 4 }, rook);
      board.setPiece({ row: 2, column: 4 }, blockingPiece);

      const destinations = rook.getValidMoves(board);

      // 敵の駒の位置までは移動できる
      expect(destinations).toContainEqual({ row: 2, column: 4 });
      // その先には移動できない
      expect(destinations).not.toContainEqual({ row: 1, column: 4 });
      expect(destinations).not.toContainEqual({ row: 0, column: 4 });
    });

    it('味方の駒の手前までしか移動できない', () => {
      const board = new MockBoard();
      const rook = new Rook(Player.SENTE, { row: 4, column: 4 });
      const allyPiece = new Rook(Player.SENTE, { row: 2, column: 4 });
      
      board.setPiece({ row: 4, column: 4 }, rook);
      board.setPiece({ row: 2, column: 4 }, allyPiece);

      const destinations = rook.getValidMoves(board);

      // 味方の駒の手前まで
      expect(destinations).toContainEqual({ row: 3, column: 4 });
      // 味方の駒の位置には移動できない
      expect(destinations).not.toContainEqual({ row: 2, column: 4 });
      // その先にも移動できない
      expect(destinations).not.toContainEqual({ row: 1, column: 4 });
    });

    it('持ち駒の場合は移動できない', () => {
      const board = new MockBoard();
      const rook = new Rook(Player.SENTE);

      const destinations = rook.getValidMoves(board);
      expect(destinations).toHaveLength(0);
    });
  });

  describe('canPromote', () => {
    it('敵陣に入る時に成れる', () => {
      const rook = new Rook(Player.SENTE, { row: 3, column: 4 });
      
      expect(rook.canPromote({ row: 2, column: 4 })).toBe(true);
      expect(rook.canPromote({ row: 1, column: 4 })).toBe(true);
    });

    it('敵陣から出る時も成れる', () => {
      const rook = new Rook(Player.SENTE, { row: 2, column: 4 });
      
      expect(rook.canPromote({ row: 3, column: 4 })).toBe(true);
    });

    it('敵陣内での移動でも成れる', () => {
      const rook = new Rook(Player.SENTE, { row: 1, column: 4 });
      
      expect(rook.canPromote({ row: 0, column: 4 })).toBe(true);
    });
  });

  describe('promote', () => {
    it('飛車を竜に変換できる', () => {
      const rook = new Rook(Player.SENTE, { row: 4, column: 4 });
      const dragon = rook.promote(createPiece);
      
      expect(dragon.type).toBe(PieceType.DRAGON);
      expect(dragon.player).toBe(Player.SENTE);
      expect(dragon.position).toEqual(rook.position);
    });
  });
});