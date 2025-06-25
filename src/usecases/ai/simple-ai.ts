import { IBoard } from '@/domain/models/piece/interface';
import { Player, Move, PieceMove, PieceType } from '@/domain/models/piece/types';
import { IAIEngine } from '@/domain/services/ai-engine';
import { GameRules } from '@/domain/services/game-rules';

/**
 * 基本的なAIエンジンの実装
 * MVPレベルの簡単なアルゴリズムを使用
 */
export class SimpleAI implements IAIEngine {
  private gameRules: GameRules;
  private readonly pieceValues: Record<PieceType, number> = {
    [PieceType.KING]: 10000,
    [PieceType.ROOK]: 900,
    [PieceType.BISHOP]: 800,
    [PieceType.GOLD]: 600,
    [PieceType.SILVER]: 500,
    [PieceType.KNIGHT]: 400,
    [PieceType.LANCE]: 300,
    [PieceType.PAWN]: 100,
    [PieceType.DRAGON]: 1000,
    [PieceType.HORSE]: 950,
    [PieceType.PROMOTED_SILVER]: 600,
    [PieceType.PROMOTED_KNIGHT]: 600,
    [PieceType.PROMOTED_LANCE]: 600,
    [PieceType.TOKIN]: 600,
  };

  constructor() {
    this.gameRules = new GameRules();
  }

  async selectMove(board: IBoard, player: Player, timeLimit: number = 1000): Promise<Move> {
    const startTime = Date.now();
    const legalMoves = this.gameRules.generateLegalMoves(board, player);

    if (legalMoves.length === 0) {
      throw new Error('No legal moves available');
    }

    // 時間制限を考慮して深さを決定
    const remainingTime = timeLimit - (Date.now() - startTime);
    const depth = remainingTime > 500 ? 2 : 1;

    // 各手を評価
    let bestMove = legalMoves[0];
    let bestScore = -Infinity;

    for (const move of legalMoves) {
      // 時間制限チェック
      if (Date.now() - startTime > timeLimit * 0.9) {
        break;
      }

      const score = await this.evaluateMove(board, move, player, depth);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  getName(): string {
    return 'SimpleAI';
  }

  getStrengthLevel(): number {
    return 1;
  }

  // 型ガード関数
  private isPieceMove(move: Move): move is PieceMove {
    return 'from' in move;
  }

  /**
   * 手を評価する（通常の駒移動のみ）
   * @param board - 現在の盤面
   * @param move - 評価する手
   * @param player - プレイヤー
   * @param depth - 探索深度
   * @returns 評価値
   */
  private async evaluateMove(board: IBoard, move: PieceMove, player: Player, depth: number): Promise<number> {
    const newBoard = board.applyMove(move);
    
    // 詰みの判定
    const opponent = player === Player.SENTE ? Player.GOTE : Player.SENTE;
    if (this.gameRules.isCheckmate(newBoard, opponent)) {
      return 100000; // 詰みは最高評価
    }

    // 深さ0なら静的評価
    if (depth <= 0) {
      return this.evaluatePosition(newBoard, player);
    }

    // ミニマックス法で探索
    return this.minimax(newBoard, depth - 1, opponent, -Infinity, Infinity, false);
  }

  /**
   * ミニマックス法による探索
   * @param board - 盤面
   * @param depth - 残り探索深度
   * @param currentPlayer - 現在のプレイヤー
   * @param alpha - アルファ値（プルーニング用）
   * @param beta - ベータ値（プルーニング用）
   * @param maximizing - 最大化プレイヤーかどうか
   * @returns 評価値
   */
  private minimax(
    board: IBoard,
    depth: number,
    currentPlayer: Player,
    alpha: number,
    beta: number,
    maximizing: boolean
  ): number {
    // 終端条件
    if (depth === 0) {
      return this.evaluatePosition(board, currentPlayer);
    }

    const moves = this.gameRules.generateLegalMoves(board, currentPlayer);
    if (moves.length === 0) {
      // 詰みの場合
      return maximizing ? -100000 : 100000;
    }

    if (maximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const newBoard = board.applyMove(move);
        const opponent = currentPlayer === Player.SENTE ? Player.GOTE : Player.SENTE;
        const evaluation = this.minimax(newBoard, depth - 1, opponent, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) {
          break; // ベータカット
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const newBoard = board.applyMove(move);
        const opponent = currentPlayer === Player.SENTE ? Player.GOTE : Player.SENTE;
        const evaluation = this.minimax(newBoard, depth - 1, opponent, alpha, beta, true);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) {
          break; // アルファカット
        }
      }
      return minEval;
    }
  }

  /**
   * 盤面の静的評価
   * @param board - 評価する盤面
   * @param player - 評価するプレイヤー
   * @returns 評価値
   */
  private evaluatePosition(board: IBoard, player: Player): number {
    let score = 0;
    const opponent = player === Player.SENTE ? Player.GOTE : Player.SENTE;

    // 自分の駒の価値を加算
    const myPieces = board.getPieces(player);
    for (const piece of myPieces) {
      score += this.pieceValues[piece.type];
    }

    // 相手の駒の価値を減算
    const opponentPieces = board.getPieces(opponent);
    for (const piece of opponentPieces) {
      score -= this.pieceValues[piece.type];
    }

    // 王手の評価
    if (this.gameRules.isInCheck(board, opponent)) {
      score += 500; // 王手をかけている場合はボーナス
    }
    if (this.gameRules.isInCheck(board, player)) {
      score -= 1000; // 自分が王手されている場合はペナルティ
    }

    return score;
  }
}