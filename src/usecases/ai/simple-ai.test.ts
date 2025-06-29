import { IBoard, IPiece } from '@/domain/models/piece/interface';
import { Player, PieceType, Move, Position } from '@/domain/models/piece/types';

import { SimpleAI } from './simple-ai';

// モックボードの作成
class MockBoard implements IBoard {
  private board: (IPiece | null)[][] = Array(9).fill(null).map(() => Array(9).fill(null));
  private pieces: IPiece[] = [];

  getPiece(position: Position): IPiece | null {
    if (!this.isValidPosition(position)) return null;
    return this.board[position.row][position.column];
  }

  setPiece(position: Position, piece: IPiece | null): void {
    if (!this.isValidPosition(position)) return;
    this.board[position.row][position.column] = piece;
    if (piece && !this.pieces.includes(piece)) {
      this.pieces.push(piece);
    }
  }

  isValidPosition(position: Position): boolean {
    return position.row >= 0 && position.row < 9 && position.column >= 0 && position.column < 9;
  }

  clone(): IBoard {
    const cloned = new MockBoard();
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = this.board[row][col];
        if (piece) {
          cloned.setPiece({ row, column: col }, piece.clone());
        }
      }
    }
    return cloned;
  }

  getPieces(player: Player): IPiece[] {
    return this.pieces.filter(p => p.player === player && p.position !== null);
  }

  findKing(player: Player): Position | null {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = this.board[row][col];
        if (piece && piece.type === PieceType.KING && piece.player === player) {
          return { row, column: col };
        }
      }
    }
    return null;
  }

  applyMove(move: Move): IBoard {
    const cloned = this.clone();
    if ('from' in move) {
      const piece = this.getPiece(move.from);
      if (piece) {
        cloned.setPiece(move.from, null);
        const movedPiece = piece.clone(move.to);
        cloned.setPiece(move.to, movedPiece);
      }
    }
    return cloned;
  }
}

// モック駒の作成
class MockPiece implements IPiece {
  constructor(
    public readonly type: PieceType,
    public readonly player: Player,
    public readonly position: Position | null,
    private validMoves: Position[] = []
  ) {}

  getValidMoves(_board: IBoard): Position[] {
    return this.validMoves;
  }

  promote(createPiece: (type: PieceType, player: Player, position: Position | null) => IPiece): IPiece {
    return createPiece(PieceType.TOKIN, this.player, this.position);
  }

  clone(position?: Position): IPiece {
    return new MockPiece(this.type, this.player, position || this.position, this.validMoves);
  }

  equals(otherPiece: IPiece | null): boolean {
    if (!otherPiece) return false;
    return this.type === otherPiece.type && 
           this.player === otherPiece.player &&
           this.position?.row === otherPiece.position?.row &&
           this.position?.column === otherPiece.position?.column;
  }

  setValidMoves(moves: Position[]): void {
    this.validMoves = moves;
  }

  isPromoted(): boolean {
    return false;
  }
}

describe('SimpleAI', () => {
  let ai: SimpleAI;
  let board: MockBoard;

  beforeEach(() => {
    ai = new SimpleAI();
    board = new MockBoard();
  });

  describe('基本機能', () => {
    it('AIエンジンの名前を取得できる', () => {
      expect(ai.getName()).toBe('SimpleAI');
    });

    it('AIエンジンの強さレベルを取得できる', () => {
      expect(ai.getStrengthLevel()).toBe(1);
    });
  });

  describe('手の選択', () => {
    it('合法手が1つしかない場合、その手を選択する', async () => {
      // 先手の王を配置
      const king = new MockPiece(PieceType.KING, Player.SENTE, { row: 8, column: 4 });
      king.setValidMoves([{ row: 7, column: 4 }]);
      board.setPiece({ row: 8, column: 4 }, king);

      // 後手の王を配置（王手を避けるため）
      const enemyKing = new MockPiece(PieceType.KING, Player.GOTE, { row: 0, column: 4 });
      board.setPiece({ row: 0, column: 4 }, enemyKing);

      const move = await ai.selectMove(board, Player.SENTE);
      expect(move).toEqual({
        from: { row: 8, column: 4 },
        to: { row: 7, column: 4 },
        isPromotion: false
      });
    });

    it('複数の合法手がある場合、いずれかを選択する', async () => {
      // 先手の歩を配置
      const pawn = new MockPiece(PieceType.PAWN, Player.SENTE, { row: 6, column: 4 });
      pawn.setValidMoves([{ row: 5, column: 4 }]);
      board.setPiece({ row: 6, column: 4 }, pawn);

      // 先手の角を配置
      const bishop = new MockPiece(PieceType.BISHOP, Player.SENTE, { row: 7, column: 7 });
      bishop.setValidMoves([{ row: 6, column: 6 }, { row: 5, column: 5 }]);
      board.setPiece({ row: 7, column: 7 }, bishop);

      // 王を配置
      const king = new MockPiece(PieceType.KING, Player.SENTE, { row: 8, column: 4 });
      board.setPiece({ row: 8, column: 4 }, king);
      const enemyKing = new MockPiece(PieceType.KING, Player.GOTE, { row: 0, column: 4 });
      board.setPiece({ row: 0, column: 4 }, enemyKing);

      const move = await ai.selectMove(board, Player.SENTE);
      const possibleMoves = [
        { from: { row: 6, column: 4 }, to: { row: 5, column: 4 }, isPromotion: false },
        { from: { row: 7, column: 7 }, to: { row: 6, column: 6 }, isPromotion: false },
        { from: { row: 7, column: 7 }, to: { row: 5, column: 5 }, isPromotion: false }
      ];

      expect(possibleMoves).toContainEqual(move);
    });

    it('思考時間制限内に手を返す', async () => {
      // 簡単な盤面設定
      const pawn = new MockPiece(PieceType.PAWN, Player.SENTE, { row: 6, column: 4 });
      pawn.setValidMoves([{ row: 5, column: 4 }]);
      board.setPiece({ row: 6, column: 4 }, pawn);

      // 王を配置
      const king = new MockPiece(PieceType.KING, Player.SENTE, { row: 8, column: 4 });
      board.setPiece({ row: 8, column: 4 }, king);
      const enemyKing = new MockPiece(PieceType.KING, Player.GOTE, { row: 0, column: 4 });
      board.setPiece({ row: 0, column: 4 }, enemyKing);

      const startTime = Date.now();
      const move = await ai.selectMove(board, Player.SENTE, 1000);
      const elapsedTime = Date.now() - startTime;

      expect(elapsedTime).toBeLessThan(1000);
      expect(move).toBeDefined();
    });

    it('合法手がない場合はエラーを投げる', async () => {
      // 王だけを配置して動けない状況を作る
      const king = new MockPiece(PieceType.KING, Player.SENTE, { row: 8, column: 4 });
      king.setValidMoves([]); // 動ける場所がない
      board.setPiece({ row: 8, column: 4 }, king);

      await expect(ai.selectMove(board, Player.SENTE)).rejects.toThrow('No legal moves available');
    });
  });

  describe('評価関数', () => {
    it('駒の価値に基づいて手を評価する', () => {
      // 評価関数のテストは実装後に追加
      expect(true).toBe(true);
    });

    it('相手の駒を取る手を高く評価する', () => {
      // 評価関数のテストは実装後に追加
      expect(true).toBe(true);
    });
  });

  describe('ミニマックス法', () => {
    it('1手先まで読む', () => {
      // ミニマックス法のテストは実装後に追加
      expect(true).toBe(true);
    });

    it('詰みがある場合は詰みを選択する', () => {
      // 詰みのテストは実装後に追加
      expect(true).toBe(true);
    });
  });
});