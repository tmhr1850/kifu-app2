export const PieceType = {
  KING: 'KING',
  GOLD: 'GOLD',
  SILVER: 'SILVER',
  KNIGHT: 'KNIGHT',
  LANCE: 'LANCE',
  BISHOP: 'BISHOP',
  ROOK: 'ROOK',
  PAWN: 'PAWN',
} as const;

export type PieceType = typeof PieceType[keyof typeof PieceType];

export const PieceOwner = {
  SENTE: 'SENTE',
  GOTE: 'GOTE',
} as const;

export type PieceOwner = typeof PieceOwner[keyof typeof PieceOwner];

export interface IPiece {
  type: PieceType;
  owner: PieceOwner;
  isPromoted: boolean;
}

export const pieceToKanji: Record<PieceType, { normal: string; promoted?: string }> = {
  [PieceType.KING]: { normal: '玉' },
  [PieceType.GOLD]: { normal: '金' },
  [PieceType.SILVER]: { normal: '銀', promoted: '成銀' },
  [PieceType.KNIGHT]: { normal: '桂', promoted: '成桂' },
  [PieceType.LANCE]: { normal: '香', promoted: '成香' },
  [PieceType.BISHOP]: { normal: '角', promoted: '馬' },
  [PieceType.ROOK]: { normal: '飛', promoted: '龍' },
  [PieceType.PAWN]: { normal: '歩', promoted: 'と' },
};

export class Piece implements IPiece {
  constructor(
    public readonly type: PieceType,
    public readonly owner: PieceOwner,
    public readonly isPromoted: boolean = false
  ) {}

  getKanji(): string {
    const pieceKanji = pieceToKanji[this.type];
    if (this.isPromoted && pieceKanji.promoted) {
      return pieceKanji.promoted;
    }
    return pieceKanji.normal;
  }

  canPromote(): boolean {
    return this.type !== PieceType.KING && this.type !== PieceType.GOLD && !this.isPromoted;
  }
}