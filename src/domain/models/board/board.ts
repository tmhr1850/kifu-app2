import { InvalidMoveError } from '../../errors/invalid-move-error';
import { createPiece } from '../piece/factory';
import { IBoard, IPiece } from '../piece/interface';
import { PieceMove, PieceType, Player, Position } from '../piece/types';
import { Position as PositionClass } from '../position';

/**
 * 将棋盤を表すクラス
 * 9x9の盤面状態を管理する
 */
export class Board implements IBoard {
  // 盤面を表現する二次元配列。駒が存在しない場所はnull
  private readonly squares: (IPiece | null)[][];
  public static readonly SIZE = 9;

  constructor(initialState?: (IPiece | null)[][]) {
    if (initialState) {
      this.squares = initialState;
    } else {
      this.squares = Array.from({ length: Board.SIZE }, () =>
        Array(Board.SIZE).fill(null)
      );
    }
  }

  /**
   * Position を正規化するヘルパーメソッド
   * Position インターフェースまたは Position クラスを受け取り、
   * 検証済みの座標を返す
   * @private
   */
  private normalizePosition(position: Position): { row: number; column: number } {
    if (position instanceof PositionClass) {
      return position;
    }
    try {
      const validPosition = PositionClass.fromObject(position);
      return validPosition;
    } catch {
      // Position クラスの検証に失敗した場合は元のオブジェクトを返す
      // 既存のコードとの互換性のため
      return position;
    }
  }

  /**
   * 指定された位置が盤面内であるか検証
   * @param position {row, column}
   * @returns boolean
   */
  public isValidPosition(position: Position): boolean {
    // すべてのPositionで統一的な境界チェックを実行
    return (
      position.row >= 0 &&
      position.row < Board.SIZE &&
      position.column >= 0 &&
      position.column < Board.SIZE
    );
  }

  /**
   * 指定した位置の駒を取得する
   * @param position {row, column}
   * @returns IPiece | null
   */
  public getPiece(position: Position): IPiece | null {
    if (!this.isValidPosition(position)) {
      return null;
    }
    const pos = this.normalizePosition(position);
    return this.squares[pos.row][pos.column];
  }

  /**
   * 指定した位置に駒を配置する
   * @param position {row, column}
   * @param piece IPiece | null
   */
  public setPiece(position: Position, piece: IPiece | null): void {
    if (this.isValidPosition(position)) {
      const pos = this.normalizePosition(position);
      this.squares[pos.row][pos.column] = piece;
    }
  }

  /**
   * 盤面のディープコピーを作成する
   * @returns 新しいBoardインスタンス
   */
  public clone(): Board {
    const newSquares = this.squares.map(row => 
      row.map(piece => piece ? piece.clone() : null)
    );
    return new Board(newSquares);
  }

  /**
   * 指定されたプレイヤーの盤上の駒をすべて取得する
   * @param player プレイヤー
   * @returns 駒の配列
   */
  public getPieces(player: Player): IPiece[] {
    return this.squares.flat().filter((piece): piece is IPiece => 
      piece !== null && piece.player === player
    );
  }

  /**
   * 指定されたプレイヤーの王の位置を探す
   * @param player プレイヤー
   * @returns 王の座標、見つからなければnull
   */
  public findKing(player: Player): Position | null {
    for (let r = 0; r < Board.SIZE; r++) {
      for (let c = 0; c < Board.SIZE; c++) {
        const piece = this.squares[r][c];
        if (piece && piece.player === player && piece.type === PieceType.KING) {
          return new PositionClass(r, c);
        }
      }
    }
    return null;
  }

  /**
   * 指定された手を適用した新しい盤面を返す（非破壊）
   * @param move 適用する手（通常の駒移動のみ）
   * @returns 手が適用された新しい盤面
   */
  public applyMove(move: PieceMove): Board {
    const newBoard = this.clone();
    const originalPiece = newBoard.getPiece(move.from);

    if (!originalPiece) {
      // 動かす駒がないのは、呼び出し側(GameRules)の責務違反
      throw new InvalidMoveError(`指定された位置(${move.from.row}, ${move.from.column})に駒が存在しません`);
    }

    // 新しい位置情報を持つクローンを作成
    const movedPiece = originalPiece.clone(move.to);

    // 移動元を空にする
    newBoard.setPiece(move.from, null);

    // 成りの処理
    if (move.isPromotion) {
      // promoteは成れない駒の場合エラーを投げる
      const promotedPiece = movedPiece.promote(createPiece);
      newBoard.setPiece(move.to, promotedPiece);
      return newBoard;
    }

    // 移動先に新しい駒を配置
    newBoard.setPiece(move.to, movedPiece);

    return newBoard;
  }

  public static createInitialBoard(): Board {
    const board = new Board();

    const initialPlacement: { piece: PieceType; pos: Position; player: Player }[] = [
      // Sente pieces
      { piece: PieceType.LANCE, pos: new PositionClass(8, 0), player: Player.SENTE },
      { piece: PieceType.KNIGHT, pos: new PositionClass(8, 1), player: Player.SENTE },
      { piece: PieceType.SILVER, pos: new PositionClass(8, 2), player: Player.SENTE },
      { piece: PieceType.GOLD, pos: new PositionClass(8, 3), player: Player.SENTE },
      { piece: PieceType.KING, pos: new PositionClass(8, 4), player: Player.SENTE },
      { piece: PieceType.GOLD, pos: new PositionClass(8, 5), player: Player.SENTE },
      { piece: PieceType.SILVER, pos: new PositionClass(8, 6), player: Player.SENTE },
      { piece: PieceType.KNIGHT, pos: new PositionClass(8, 7), player: Player.SENTE },
      { piece: PieceType.LANCE, pos: new PositionClass(8, 8), player: Player.SENTE },
      { piece: PieceType.ROOK, pos: new PositionClass(7, 1), player: Player.SENTE },
      { piece: PieceType.BISHOP, pos: new PositionClass(7, 7), player: Player.SENTE },

      // Gote pieces
      { piece: PieceType.LANCE, pos: new PositionClass(0, 0), player: Player.GOTE },
      { piece: PieceType.KNIGHT, pos: new PositionClass(0, 1), player: Player.GOTE },
      { piece: PieceType.SILVER, pos: new PositionClass(0, 2), player: Player.GOTE },
      { piece: PieceType.GOLD, pos: new PositionClass(0, 3), player: Player.GOTE },
      { piece: PieceType.KING, pos: new PositionClass(0, 4), player: Player.GOTE },
      { piece: PieceType.GOLD, pos: new PositionClass(0, 5), player: Player.GOTE },
      { piece: PieceType.SILVER, pos: new PositionClass(0, 6), player: Player.GOTE },
      { piece: PieceType.KNIGHT, pos: new PositionClass(0, 7), player: Player.GOTE },
      { piece: PieceType.LANCE, pos: new PositionClass(0, 8), player: Player.GOTE },
      { piece: PieceType.ROOK, pos: new PositionClass(1, 1), player: Player.GOTE },
      { piece: PieceType.BISHOP, pos: new PositionClass(1, 7), player: Player.GOTE },
    ];

    // Pawns
    for (let i = 0; i < 9; i++) {
      initialPlacement.push({ piece: PieceType.PAWN, pos: new PositionClass(6, i), player: Player.SENTE });
      initialPlacement.push({ piece: PieceType.PAWN, pos: new PositionClass(2, i), player: Player.GOTE });
    }
    
    initialPlacement.forEach(({ piece, pos, player }) => {
      board.setPiece(pos, createPiece(piece, player, pos));
    });
    
    return board;
  }

  /**
   * 盤面状態をシリアライズする（Web Worker通信用）
   * @returns シリアライズされた盤面データ
   */
  public serialize(): unknown {
    return {
      type: 'Board',
      squares: this.squares.map(row => 
        row.map(piece => piece ? {
          type: piece.type,
          player: piece.player,
          position: piece.position ? {
            row: piece.position.row,
            column: piece.position.column
          } : null
        } : null)
      )
    };
  }

  /**
   * シリアライズされたデータから盤面を復元する（Web Worker通信用）
   * @param data シリアライズされた盤面データ
   * @returns 復元されたBoardインスタンス
   */
  public static deserialize(data: unknown): Board {
    if (!data || typeof data !== 'object' || !('type' in data) || data.type !== 'Board') {
      throw new Error('Invalid serialized board data');
    }
    
    const boardData = data as { 
      type: string; 
      squares: Array<Array<{
        type: PieceType;
        player: Player;
        position: { row: number; column: number } | null;
      } | null>>
    };
    
    const board = new Board();
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const pieceData = boardData.squares[row]?.[col];
        if (pieceData) {
          const position = new PositionClass(row, col);
          const piece = createPiece(pieceData.type, pieceData.player, position);
          board.setPiece(position, piece);
        }
      }
    }
    
    return board;
  }
} 