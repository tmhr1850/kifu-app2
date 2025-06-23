import { createPiece } from './factory';
import { PieceType, Player, Position } from './types';
import {
  King,
  Rook,
  Bishop,
  Gold,
  Silver,
  Knight,
  Lance,
  Pawn,
  Dragon,
  Horse,
  PromotedSilver,
  PromotedKnight,
  PromotedLance,
  Tokin,
} from './pieces';

describe('createPiece ファクトリ関数', () => {
  const position: Position = { row: 5, column: 5 };

  it('玉を正しく作成できる', () => {
    const piece = createPiece(PieceType.KING, Player.SENTE, position);
    expect(piece).toBeInstanceOf(King);
    expect(piece.type).toBe(PieceType.KING);
    expect(piece.player).toBe(Player.SENTE);
    expect(piece.position).toEqual(position);
  });

  it('飛車を正しく作成できる', () => {
    const piece = createPiece(PieceType.ROOK, Player.GOTE, position);
    expect(piece).toBeInstanceOf(Rook);
    expect(piece.type).toBe(PieceType.ROOK);
  });

  it('角を正しく作成できる', () => {
    const piece = createPiece(PieceType.BISHOP, Player.SENTE, position);
    expect(piece).toBeInstanceOf(Bishop);
    expect(piece.type).toBe(PieceType.BISHOP);
  });

  it('金を正しく作成できる', () => {
    const piece = createPiece(PieceType.GOLD, Player.GOTE, position);
    expect(piece).toBeInstanceOf(Gold);
    expect(piece.type).toBe(PieceType.GOLD);
  });

  it('銀を正しく作成できる', () => {
    const piece = createPiece(PieceType.SILVER, Player.SENTE, position);
    expect(piece).toBeInstanceOf(Silver);
    expect(piece.type).toBe(PieceType.SILVER);
  });

  it('桂馬を正しく作成できる', () => {
    const piece = createPiece(PieceType.KNIGHT, Player.GOTE, position);
    expect(piece).toBeInstanceOf(Knight);
    expect(piece.type).toBe(PieceType.KNIGHT);
  });

  it('香車を正しく作成できる', () => {
    const piece = createPiece(PieceType.LANCE, Player.SENTE, position);
    expect(piece).toBeInstanceOf(Lance);
    expect(piece.type).toBe(PieceType.LANCE);
  });

  it('歩を正しく作成できる', () => {
    const piece = createPiece(PieceType.PAWN, Player.GOTE, position);
    expect(piece).toBeInstanceOf(Pawn);
    expect(piece.type).toBe(PieceType.PAWN);
  });

  it('竜を正しく作成できる', () => {
    const piece = createPiece(PieceType.DRAGON, Player.SENTE, position);
    expect(piece).toBeInstanceOf(Dragon);
    expect(piece.type).toBe(PieceType.DRAGON);
  });

  it('馬を正しく作成できる', () => {
    const piece = createPiece(PieceType.HORSE, Player.GOTE, position);
    expect(piece).toBeInstanceOf(Horse);
    expect(piece.type).toBe(PieceType.HORSE);
  });

  it('成銀を正しく作成できる', () => {
    const piece = createPiece(PieceType.PROMOTED_SILVER, Player.SENTE, position);
    expect(piece).toBeInstanceOf(PromotedSilver);
    expect(piece.type).toBe(PieceType.PROMOTED_SILVER);
  });

  it('成桂を正しく作成できる', () => {
    const piece = createPiece(PieceType.PROMOTED_KNIGHT, Player.GOTE, position);
    expect(piece).toBeInstanceOf(PromotedKnight);
    expect(piece.type).toBe(PieceType.PROMOTED_KNIGHT);
  });

  it('成香を正しく作成できる', () => {
    const piece = createPiece(PieceType.PROMOTED_LANCE, Player.SENTE, position);
    expect(piece).toBeInstanceOf(PromotedLance);
    expect(piece.type).toBe(PieceType.PROMOTED_LANCE);
  });

  it('と金を正しく作成できる', () => {
    const piece = createPiece(PieceType.TOKIN, Player.GOTE, position);
    expect(piece).toBeInstanceOf(Tokin);
    expect(piece.type).toBe(PieceType.TOKIN);
  });

  it('位置なしで駒を作成できる', () => {
    const piece = createPiece(PieceType.GOLD, Player.SENTE);
    expect(piece.position).toBeNull();
  });

  it('不明な駒の種類でエラーを投げる', () => {
    expect(() => createPiece('UNKNOWN' as PieceType, Player.SENTE))
      .toThrow('不明な駒の種類: UNKNOWN');
  });
});