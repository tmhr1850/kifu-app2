import { Board } from '@/domain/models/board/board';
import { IPiece } from '@/domain/models/piece/interface';
import { Player } from '@/domain/models/piece/types';
import { Position } from '@/domain/models/position/position';
import { GameRules } from '@/domain/services/game-rules';

interface WorkerMessage {
  type: 'CALCULATE_MOVE';
  board: unknown; // Serialized board state
  currentPlayer: Player;
  capturedPieces: { piece: IPiece; position: Position }[];
}

interface WorkerResponse {
  type: 'MOVE_CALCULATED';
  move: { from: Position; to: Position } | null;
  evaluationScore?: number;
  nodesEvaluated?: number;
}

// 評価関数のキャッシュ
const evaluationCache = new Map<string, number>();

// 盤面を文字列化してキャッシュキーを生成
function generateBoardKey(board: Board): string {
  const sentePieces = board.getPieces(Player.SENTE);
  const gotePieces = board.getPieces(Player.GOTE);
  const allPieces = [...sentePieces, ...gotePieces];
  
  return allPieces
    .map((piece) => {
      const pos = piece.position;
      return pos ? `${pos.row},${pos.column}:${piece.type}:${piece.player}` : '';
    })
    .filter(key => key !== '')
    .sort()
    .join('|');
}

// 駒の価値マップ（キャッシュ化）
const PIECE_VALUES: Record<string, number> = {
  'PAWN': 1,
  'LANCE': 3,
  'KNIGHT': 4,
  'SILVER': 5,
  'GOLD': 6,
  'BISHOP': 8,
  'ROOK': 10,
  'PROMOTED_PAWN': 7,
  'PROMOTED_LANCE': 6,
  'PROMOTED_KNIGHT': 6,
  'PROMOTED_SILVER': 6,
  'PROMOTED_BISHOP': 12,
  'PROMOTED_ROOK': 15,
  'KING': 1000
};

// 最適化された評価関数
function evaluatePosition(board: Board, player: Player): number {
  const boardKey = generateBoardKey(board);
  
  // キャッシュチェック
  const cached = evaluationCache.get(boardKey);
  if (cached !== undefined) {
    return player === Player.SENTE ? cached : -cached;
  }

  let score = 0;
  const sentePieces = board.getPieces(Player.SENTE);
  const gotePieces = board.getPieces(Player.GOTE);

  for (const piece of sentePieces) {
    const value = PIECE_VALUES[piece.type] || 0;
    score += value;
  }
  
  for (const piece of gotePieces) {
    const value = PIECE_VALUES[piece.type] || 0;
    score -= value;
  }

  // キャッシュに保存（サイズ制限付き）
  if (evaluationCache.size > 10000) {
    evaluationCache.clear();
  }
  evaluationCache.set(boardKey, score);

  return player === Player.SENTE ? score : -score;
}

// Alpha-Beta枝刈り付きミニマックス
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  currentPlayer: Player,
  capturedPieces: { piece: IPiece; position: Position }[],
  nodesEvaluated: { count: number }
): number {
  nodesEvaluated.count++;

  if (depth === 0) {
    return evaluatePosition(board, currentPlayer);
  }

  const gameRules = new GameRules();
  const allMoves = gameRules.generateLegalMoves(board, currentPlayer);

  if (allMoves.length === 0) {
    return maximizingPlayer ? -Infinity : Infinity;
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of allMoves) {
      try {
        const newBoard = board.applyMove(move) as Board;
        const evaluation = minimax(
          newBoard,
          depth - 1,
          alpha,
          beta,
          false,
          currentPlayer === Player.SENTE ? Player.GOTE : Player.SENTE,
          capturedPieces,
          nodesEvaluated
        );
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Beta枝刈り
      } catch {
        continue;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of allMoves) {
      try {
        const newBoard = board.applyMove(move) as Board;
        const evaluation = minimax(
          newBoard,
          depth - 1,
          alpha,
          beta,
          true,
          currentPlayer === Player.SENTE ? Player.GOTE : Player.SENTE,
          capturedPieces,
          nodesEvaluated
        );
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Alpha枝刈り
      } catch {
        continue;
      }
    }
    return minEval;
  }
}

// ワーカーのメッセージハンドラ
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, board: serializedBoard, currentPlayer, capturedPieces } = event.data;

  if (type === 'CALCULATE_MOVE') {
    try {
      const board = Board.deserialize(serializedBoard);
      const gameRules = new GameRules();
      const allMoves = gameRules.generateLegalMoves(board, currentPlayer);

      if (allMoves.length === 0) {
        const response: WorkerResponse = {
          type: 'MOVE_CALCULATED',
          move: null
        };
        self.postMessage(response);
        return;
      }

      let bestMove = allMoves[0];
      let bestScore = -Infinity;
      const nodesEvaluated = { count: 0 };

      // 各手を評価（深さ2で探索）
      for (const move of allMoves) {
        try {
          const newBoard = board.applyMove(move) as Board;
          const score = minimax(
            newBoard,
            2, // 探索深さ
            -Infinity,
            Infinity,
            false,
            currentPlayer === Player.SENTE ? Player.GOTE : Player.SENTE,
            capturedPieces,
            nodesEvaluated
          );

          if (score > bestScore) {
            bestScore = score;
            bestMove = move;
          }
        } catch {
          continue;
        }
      }

      const response: WorkerResponse = {
        type: 'MOVE_CALCULATED',
        move: {
          from: new Position(bestMove.from.row, bestMove.from.column),
          to: new Position(bestMove.to.row, bestMove.to.column)
        },
        evaluationScore: bestScore,
        nodesEvaluated: nodesEvaluated.count
      };
      
      self.postMessage(response);
    } catch (error) {
      // デシリアライズエラーの場合はnullを返す
      const response: WorkerResponse = {
        type: 'MOVE_CALCULATED',
        move: null
      };
      self.postMessage(response);
    }
  }
});