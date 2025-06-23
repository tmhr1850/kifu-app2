import { IBoard, IPiece } from '../models/piece/interface';
import { Player, Position, Move, PieceType } from '../models/piece/types';

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
   * @returns 合法手の配列
   */
  public generateLegalMoves(board: IBoard, player: Player): Move[] {
    const allPossibleMoves: Move[] = [];
    const pieces = board.getPieces(player);

    for (const piece of pieces) {
      const from = piece.position;
      if (!from) continue; // 持ち駒はここでは扱わない

      const validDestinations = piece.getValidMoves(board);

      for (const to of validDestinations) {
        // 成りのロジック
        const canPromote = this.canPromote(piece, to, from);

        // 強制成りの判定
        const isPawnOrLance =
          piece.type === PieceType.PAWN || piece.type === PieceType.LANCE;
        const isKnight = piece.type === PieceType.KNIGHT;
        const lastRow = player === Player.SENTE ? 0 : 8;
        const secondToLastRow = player === Player.SENTE ? 1 : 7;

        let forcePromote = false;
        if (isPawnOrLance && to.row === lastRow) {
          forcePromote = true;
        }
        if (
          isKnight &&
          (to.row === lastRow || to.row === secondToLastRow)
        ) {
          forcePromote = true;
        }

        if (forcePromote) {
          allPossibleMoves.push({ from, to, isPromotion: true });
        } else if (canPromote) {
          allPossibleMoves.push({ from, to, isPromotion: true });
          allPossibleMoves.push({ from, to, isPromotion: false });
        } else {
          allPossibleMoves.push({ from, to, isPromotion: false });
        }
      }
    }

    // 王手になる手（反則手）を除外する
    return allPossibleMoves.filter(move => {
      const testBoard = board.applyMove(move);
      return !this.isInCheck(testBoard, player);
    });
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
    if (piece.type === PieceType.KING || piece.type === PieceType.GOLD) {
      return false;
    }

    const player = piece.player;
    const promotionZoneStart = player === Player.SENTE ? 1 : 7;
    const promotionZoneEnd = player === Player.SENTE ? 3 : 9;

    const isMovingToPromotionZone =
      to.row >= promotionZoneStart && to.row <= promotionZoneEnd;
    const isMovingFromPromotionZone =
      from.row >= promotionZoneStart && from.row <= promotionZoneEnd;

    if (isMovingToPromotionZone || isMovingFromPromotionZone) {
      // 特定の駒は特定の段で強制的に成る
      if (
        (piece.type === PieceType.PAWN || piece.type === PieceType.LANCE) &&
        to.row === (player === Player.SENTE ? 1 : 9)
      ) {
        return true;
      }
      if (
        piece.type === PieceType.KNIGHT &&
        to.row <= (player === Player.SENTE ? 2 : 8)
      ) {
        return true;
      }
      return true;
    }
    return false;
  }

  // Position比較用のヘルパーメソッド
  private positionsEqual(pos1: Position, pos2: Position): boolean {
    return pos1.row === pos2.row && pos1.column === pos2.column;
  }
}