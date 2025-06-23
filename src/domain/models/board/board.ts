import { createPiece } from '../piece/factory';
import { IBoard, IPiece } from '../piece/interface';
import { Move, PieceType, Player, Position } from '../piece/types';

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
   * 指定された位置が盤面内であるか検証
   * @param position {row, column}
   * @returns boolean
   */
  public isValidPosition(position: Position): boolean {
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
    return this.squares[position.row][position.column];
  }

  /**
   * 指定した位置に駒を配置する
   * @param position {row, column}
   * @param piece IPiece | null
   */
  public setPiece(position: Position, piece: IPiece | null): void {
    if (this.isValidPosition(position)) {
      this.squares[position.row][position.column] = piece;
    }
  }

  /**
   * 盤面のディープコピーを作成する
   * @returns 新しいBoardインスタンス
   */
  public clone(): IBoard {
    const newSquares = this.squares.map(row => {
      return row.map(piece => {
        return piece ? piece.clone() : null;
      });
    });
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
          return { row: r, column: c };
        }
      }
    }
    return null;
  }

  /**
   * 指定された手を適用した新しい盤面を返す（非破壊）
   * @param move 適用する手
   * @returns 手が適用された新しい盤面
   */
  public applyMove(move: Move): IBoard {
    const newBoard = this.clone() as Board;
    const originalPiece = newBoard.getPiece(move.from);

    if (!originalPiece) {
      // 動かす駒がない場合は、ロジックエラーの可能性が高い
      // 本来は呼び出し側(GameRules)が有効な手を渡す責務を持つ
      // ここでは何もしないで盤面をそのまま返す or エラーをスローする
      return newBoard;
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

  public static createInitialBoard(): IBoard {
    const board = new Board();

    const initialPlacement: { piece: PieceType; pos: Position; player: Player }[] = [
      // Sente pieces
      { piece: PieceType.LANCE, pos: { row: 8, column: 0 }, player: Player.SENTE },
      { piece: PieceType.KNIGHT, pos: { row: 8, column: 1 }, player: Player.SENTE },
      { piece: PieceType.SILVER, pos: { row: 8, column: 2 }, player: Player.SENTE },
      { piece: PieceType.GOLD, pos: { row: 8, column: 3 }, player: Player.SENTE },
      { piece: PieceType.KING, pos: { row: 8, column: 4 }, player: Player.SENTE },
      { piece: PieceType.GOLD, pos: { row: 8, column: 5 }, player: Player.SENTE },
      { piece: PieceType.SILVER, pos: { row: 8, column: 6 }, player: Player.SENTE },
      { piece: PieceType.KNIGHT, pos: { row: 8, column: 7 }, player: Player.SENTE },
      { piece: PieceType.LANCE, pos: { row: 8, column: 8 }, player: Player.SENTE },
      { piece: PieceType.ROOK, pos: { row: 7, column: 1 }, player: Player.SENTE },
      { piece: PieceType.BISHOP, pos: { row: 7, column: 7 }, player: Player.SENTE },

      // Gote pieces
      { piece: PieceType.LANCE, pos: { row: 0, column: 0 }, player: Player.GOTE },
      { piece: PieceType.KNIGHT, pos: { row: 0, column: 1 }, player: Player.GOTE },
      { piece: PieceType.SILVER, pos: { row: 0, column: 2 }, player: Player.GOTE },
      { piece: PieceType.GOLD, pos: { row: 0, column: 3 }, player: Player.GOTE },
      { piece: PieceType.KING, pos: { row: 0, column: 4 }, player: Player.GOTE },
      { piece: PieceType.GOLD, pos: { row: 0, column: 5 }, player: Player.GOTE },
      { piece: PieceType.SILVER, pos: { row: 0, column: 6 }, player: Player.GOTE },
      { piece: PieceType.KNIGHT, pos: { row: 0, column: 7 }, player: Player.GOTE },
      { piece: PieceType.LANCE, pos: { row: 0, column: 8 }, player: Player.GOTE },
      { piece: PieceType.BISHOP, pos: { row: 1, column: 1 }, player: Player.GOTE },
      { piece: PieceType.ROOK, pos: { row: 1, column: 7 }, player: Player.GOTE },
    ];

    // Pawns
    for (let i = 0; i < 9; i++) {
      initialPlacement.push({ piece: PieceType.PAWN, pos: { row: 6, column: i }, player: Player.SENTE });
      initialPlacement.push({ piece: PieceType.PAWN, pos: { row: 2, column: i }, player: Player.GOTE });
    }
    
    initialPlacement.forEach(({ piece, pos, player }) => {
      board.setPiece(pos, createPiece(piece, player, pos));
    });
    
    return board;
  }
} 