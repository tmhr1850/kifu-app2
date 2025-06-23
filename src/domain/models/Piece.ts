export enum PieceType {
  FU = 'FU',          // 歩
  KYOSHA = 'KYOSHA',  // 香車
  KEIMA = 'KEIMA',    // 桂馬
  GIN = 'GIN',        // 銀
  KIN = 'KIN',        // 金
  KAKU = 'KAKU',      // 角
  HISHA = 'HISHA',    // 飛車
  OU = 'OU',          // 王（先手）
  GYOKU = 'GYOKU',    // 玉（後手）
  // 成駒
  TO = 'TO',          // と金
  NARIKYO = 'NARIKYO',// 成香
  NARIKEI = 'NARIKEI',// 成桂
  NARIGIN = 'NARIGIN',// 成銀
  UMA = 'UMA',        // 馬（成角）
  RYU = 'RYU',        // 龍（成飛）
}

export enum Player {
  SENTE = 'SENTE',    // 先手
  GOTE = 'GOTE',      // 後手
}

export class Piece {
  constructor(
    public readonly type: PieceType,
    public readonly player: Player,
    public readonly isPromoted: boolean = false
  ) {}

  promote(): Piece {
    if (this.isPromoted || !this.canPromote()) {
      return this;
    }

    const promotedType = this.getPromotedType();
    if (!promotedType) {
      return this;
    }

    return new Piece(promotedType, this.player, true);
  }

  canPromote(): boolean {
    return [
      PieceType.FU,
      PieceType.KYOSHA,
      PieceType.KEIMA,
      PieceType.GIN,
      PieceType.KAKU,
      PieceType.HISHA,
    ].includes(this.type);
  }

  private getPromotedType(): PieceType | null {
    const promotionMap: Record<PieceType, PieceType> = {
      [PieceType.FU]: PieceType.TO,
      [PieceType.KYOSHA]: PieceType.NARIKYO,
      [PieceType.KEIMA]: PieceType.NARIKEI,
      [PieceType.GIN]: PieceType.NARIGIN,
      [PieceType.KAKU]: PieceType.UMA,
      [PieceType.HISHA]: PieceType.RYU,
    } as const;

    return promotionMap[this.type] || null;
  }
}