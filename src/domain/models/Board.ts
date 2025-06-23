import { Piece, PieceType, Player } from './Piece';

type Square = Piece | null;
type CapturedPieces = Record<PieceType, number>;

export class Board {
  private squares: Square[][];
  private capturedPieces: Record<Player, CapturedPieces>;

  constructor() {
    this.squares = Array(9).fill(null).map(() => Array(9).fill(null));
    this.capturedPieces = {
      [Player.SENTE]: {},
      [Player.GOTE]: {},
    };
  }

  setInitialPosition(): void {
    // 後手（上手）の配置
    // 1段目
    this.placePiece(0, 0, new Piece(PieceType.KYOSHA, Player.GOTE));
    this.placePiece(0, 1, new Piece(PieceType.KEIMA, Player.GOTE));
    this.placePiece(0, 2, new Piece(PieceType.GIN, Player.GOTE));
    this.placePiece(0, 3, new Piece(PieceType.KIN, Player.GOTE));
    this.placePiece(0, 4, new Piece(PieceType.GYOKU, Player.GOTE));
    this.placePiece(0, 5, new Piece(PieceType.KIN, Player.GOTE));
    this.placePiece(0, 6, new Piece(PieceType.GIN, Player.GOTE));
    this.placePiece(0, 7, new Piece(PieceType.KEIMA, Player.GOTE));
    this.placePiece(0, 8, new Piece(PieceType.KYOSHA, Player.GOTE));

    // 2段目
    this.placePiece(1, 1, new Piece(PieceType.HISHA, Player.GOTE));
    this.placePiece(1, 7, new Piece(PieceType.KAKU, Player.GOTE));

    // 3段目（歩）
    for (let col = 0; col < 9; col++) {
      this.placePiece(2, col, new Piece(PieceType.FU, Player.GOTE));
    }

    // 先手（下手）の配置
    // 7段目（歩）
    for (let col = 0; col < 9; col++) {
      this.placePiece(6, col, new Piece(PieceType.FU, Player.SENTE));
    }

    // 8段目
    this.placePiece(7, 1, new Piece(PieceType.KAKU, Player.SENTE));
    this.placePiece(7, 7, new Piece(PieceType.HISHA, Player.SENTE));

    // 9段目
    this.placePiece(8, 0, new Piece(PieceType.KYOSHA, Player.SENTE));
    this.placePiece(8, 1, new Piece(PieceType.KEIMA, Player.SENTE));
    this.placePiece(8, 2, new Piece(PieceType.GIN, Player.SENTE));
    this.placePiece(8, 3, new Piece(PieceType.KIN, Player.SENTE));
    this.placePiece(8, 4, new Piece(PieceType.OU, Player.SENTE));
    this.placePiece(8, 5, new Piece(PieceType.KIN, Player.SENTE));
    this.placePiece(8, 6, new Piece(PieceType.GIN, Player.SENTE));
    this.placePiece(8, 7, new Piece(PieceType.KEIMA, Player.SENTE));
    this.placePiece(8, 8, new Piece(PieceType.KYOSHA, Player.SENTE));
  }

  getPiece(row: number, col: number): Square {
    this.validateCoordinates(row, col);
    return this.squares[row][col];
  }

  placePiece(row: number, col: number, piece: Piece): void {
    this.validateCoordinates(row, col);
    this.squares[row][col] = piece;
  }

  removePiece(row: number, col: number): Square {
    this.validateCoordinates(row, col);
    const piece = this.squares[row][col];
    this.squares[row][col] = null;
    return piece;
  }

  movePiece(fromRow: number, fromCol: number, toRow: number, toCol: number): Square {
    this.validateCoordinates(fromRow, fromCol);
    this.validateCoordinates(toRow, toCol);

    const piece = this.getPiece(fromRow, fromCol);
    if (!piece) {
      throw new Error(`No piece at position (${fromRow}, ${fromCol})`);
    }

    const capturedPiece = this.getPiece(toRow, toCol);
    this.removePiece(fromRow, fromCol);
    this.placePiece(toRow, toCol, piece);

    return capturedPiece;
  }

  getCapturedPieces(player: Player): CapturedPieces {
    return { ...this.capturedPieces[player] };
  }

  addCapturedPiece(player: Player, pieceType: PieceType): void {
    if (!this.capturedPieces[player][pieceType]) {
      this.capturedPieces[player][pieceType] = 0;
    }
    this.capturedPieces[player][pieceType]++;
  }

  useCapturedPiece(player: Player, pieceType: PieceType): boolean {
    const count = this.capturedPieces[player][pieceType] || 0;
    if (count === 0) {
      return false;
    }

    this.capturedPieces[player][pieceType]--;
    if (this.capturedPieces[player][pieceType] === 0) {
      delete this.capturedPieces[player][pieceType];
    }
    return true;
  }

  copy(): Board {
    const newBoard = new Board();
    
    // 盤面のコピー
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = this.squares[row][col];
        if (piece) {
          newBoard.squares[row][col] = new Piece(piece.type, piece.player, piece.isPromoted);
        }
      }
    }

    // 持ち駒のコピー
    for (const player of [Player.SENTE, Player.GOTE]) {
      newBoard.capturedPieces[player] = { ...this.capturedPieces[player] };
    }

    return newBoard;
  }

  private validateCoordinates(row: number, col: number): void {
    if (row < 0 || row >= 9 || col < 0 || col >= 9) {
      throw new Error(`Invalid coordinates: (${row}, ${col})`);
    }
  }

  static toShogiNotation(row: number, col: number): string {
    const file = 9 - col; // 筋（1-9）
    const ranks = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const rank = ranks[row];
    return `${file}${rank}`;
  }

  static fromShogiNotation(notation: string): { row: number; col: number } {
    if (!notation || notation.length !== 2) {
      throw new Error(`Invalid shogi notation: ${notation}`);
    }

    // 筋（1-9）の処理（全角数字も対応）
    const fileChar = notation[0];
    let file: number;
    if (fileChar >= '1' && fileChar <= '9') {
      file = parseInt(fileChar);
    } else if (fileChar >= '１' && fileChar <= '９') {
      file = fileChar.charCodeAt(0) - '１'.charCodeAt(0) + 1;
    } else {
      throw new Error(`Invalid file in notation: ${notation}`);
    }

    if (file < 1 || file > 9) {
      throw new Error(`Invalid file number: ${file}`);
    }

    // 段（一-九）の処理
    const rankChar = notation[1];
    const ranks = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const row = ranks.indexOf(rankChar);
    
    if (row === -1) {
      throw new Error(`Invalid rank in notation: ${notation}`);
    }

    const col = 9 - file;
    return { row, col };
  }
}