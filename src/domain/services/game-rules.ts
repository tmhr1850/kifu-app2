import { IBoard, IPiece } from '../models/piece/interface';
import { Player, Position, PieceMove, PieceType } from '../models/piece/types';

/**
 * ゲームのルールを管理するクラス
 * 駒の動きの生成、王手、詰みの判定などを行う
 *
 * NOTE: このクラスは現在、`IBoard` `IPiece` などのインターフェースに依存しています。
 * これらのインターフェースを実装する具体的なクラス (Board, Pieceなど) は
 * このプルリクエストの範囲外であり、別途実装される必要があります。
 * そのため、このクラスの多くのメソッドは、インターフェースのAPIを呼び出す
 * 骨格のみが実装されています。
 */
export class GameRules {
  /**
   * 指定されたプレイヤーの全ての合法手を生成する
   * @param board - 現在の盤面
   * @param player - 手番のプレイヤー
   * @returns 合法手の配列（通常の駒移動のみ）
   */
  public generateLegalMoves(board: IBoard, player: Player): PieceMove[] {
    const legalMoves: PieceMove[] = [];
    const pieces = board.getPieces(player);

    for (const piece of pieces) {
      const from = piece.position;
      if (!from) continue; // 持ち駒はここでは扱わない

      const validDestinations = piece.getValidMoves(board);

      for (const to of validDestinations) {
        // 成りのロジック
        const canPromote = this.canPromote(piece, to, from);
        const mustPromote = this.mustPromote(piece, to);

        const promotionMoves: (boolean | undefined)[] = [];
        if (mustPromote) {
          promotionMoves.push(true);
        } else if (canPromote) {
          promotionMoves.push(true, false);
        } else {
          promotionMoves.push(false);
        }

        for (const isPromotion of promotionMoves) {
          const move: PieceMove = { from, to, isPromotion };
          const testBoard = board.applyMove(move);
          if (!this.isInCheck(testBoard, player)) {
            legalMoves.push(move);
          }
        }
      }
    }

    return legalMoves;
  }

  /**
   * 指定されたプレイヤーが王手されているか判定する
   * @param board - 現在の盤面
   * @param player - 判定対象のプレイヤー
   * @returns 王手の場合 true
   */
  public isInCheck(board: IBoard, player: Player): boolean {
    const kingPosition = board.findKing(player);
    if (!kingPosition) {
      // 王が見つからない場合は王手ではない（ありえない状況だが念のため）
      return false;
    }

    const opponent = player === Player.SENTE ? Player.GOTE : Player.SENTE;
    const opponentPieces = board.getPieces(opponent);

    for (const piece of opponentPieces) {
      const moves = piece.getValidMoves(board);
      if (moves.some(move => this.positionsEqual(move, kingPosition))) {
        return true;
      }
    }

    return false;
  }

  /**
   * 指定されたプレイヤーが詰まされているか判定する
   * @param board - 現在の盤面
   * @param player - 判定対象のプレイヤー
   * @returns 詰みの場合 true
   */
  public isCheckmate(board: IBoard, player: Player): boolean {
    if (!this.isInCheck(board, player)) {
      return false;
    }
    return this.generateLegalMoves(board, player).length === 0;
  }

  /**
   * 指定された場所に歩を打つと二歩になるか判定する
   * @param board - 現在の盤面
   * @param column - 歩を打つ列
   * @param player - 手番のプレイヤー
   * @returns 二歩の場合 true
   */
  public isNifu(board: IBoard, column: number, player: Player): boolean {
    for (let row = 0; row < 9; row++) {
      const piece = board.getPiece({ row, column });
      if (
        piece &&
        piece.player === player &&
        piece.type === PieceType.PAWN
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * 駒が成れるかどうかを判定します。
   * @param {IPiece} piece - 判定対象の駒
   * @param {Position} to - 移動先の位置
   * @param {Position} from - 移動元の位置
   * @returns {boolean} - 成れる場合はtrue、そうでない場合はfalse
   */
  private canPromote(piece: IPiece, to: Position, from: Position): boolean {
    const unpromotablePieces: PieceType[] = [
      PieceType.GOLD,
      PieceType.KING,
      PieceType.TOKIN,
      PieceType.PROMOTED_SILVER,
      PieceType.PROMOTED_KNIGHT,
      PieceType.PROMOTED_LANCE,
      PieceType.HORSE,
      PieceType.DRAGON,
    ];

    if (unpromotablePieces.includes(piece.type)) {
      return false;
    }

    const player = piece.player;
    const promotionZoneStart = player === Player.SENTE ? 0 : 6;
    const promotionZoneEnd = player === Player.SENTE ? 2 : 8;

    const isMovingToPromotionZone =
      to.row >= promotionZoneStart && to.row <= promotionZoneEnd;
    const isMovingFromPromotionZone =
      from.row >= promotionZoneStart && from.row <= promotionZoneEnd;

    return isMovingToPromotionZone || isMovingFromPromotionZone;
  }

  /**
   * 駒が強制的に成らなければならないかを判定します。
   * @param {IPiece} piece - 判定対象の駒
   * @param {Position} to - 移動先の位置
   * @returns {boolean} - 強制的に成る場合はtrue、そうでない場合はfalse
   */
  private mustPromote(piece: IPiece, to: Position): boolean {
    const player = piece.player;

    if (piece.type === PieceType.PAWN || piece.type === PieceType.LANCE) {
      const lastRank = player === Player.SENTE ? 0 : 8;
      return to.row === lastRank;
    }

    if (piece.type === PieceType.KNIGHT) {
      const lastRanks = player === Player.SENTE ? [0, 1] : [7, 8];
      return lastRanks.includes(to.row);
    }

    return false;
  }

  // Position比較用のヘルパーメソッド
  private positionsEqual(pos1: Position, pos2: Position): boolean {
    return pos1.row === pos2.row && pos1.column === pos2.column;
  }
}