import { IBoard } from '../models/piece/interface';
import { Player, Position, Move } from '../models/piece/types';

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
    const allMoves: Move[] = [];
    const pieces = board.getPieces(player);

    for (const piece of pieces) {
      const moves = piece.getValidMoves(board);
      allMoves.push(...moves);
    }

    // 王手になる手（反則手）を除外する
    return allMoves.filter(move => {
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
      if (moves.some(move => this.positionsEqual(move.to, kingPosition))) {
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
        piece.type === 'PAWN'
      ) {
        return true;
      }
    }
    return false;
  }

  // Position比較用のヘルパーメソッド
  private positionsEqual(pos1: Position, pos2: Position): boolean {
    return pos1.row === pos2.row && pos1.column === pos2.column;
  }
}