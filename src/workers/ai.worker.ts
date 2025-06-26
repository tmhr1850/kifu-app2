import { Board } from '@/domain/models/board/board'
import { Player, PieceType, Move } from '@/domain/models/piece/types'
import { Position } from '@/domain/models/position/position'
import { CapturedPieces } from '@/usecases/game/types'

// Web Worker用のメッセージ型定義
interface CalculateMoveMessage {
  type: 'CALCULATE_MOVE'
  board: unknown // Board.serialize()の結果
  currentPlayer: Player
  capturedPieces: CapturedPieces
  thinkingTime?: number
  difficultyLevel?: number
}

interface MoveResultMessage {
  type: 'MOVE_RESULT'
  move: Move
}

interface ErrorMessage {
  type: 'ERROR'
  error: string
}

type WorkerMessage = CalculateMoveMessage

// 簡単なミニマックス評価関数
function evaluateBoard(board: Board, player: Player): number {
  const pieceValues = {
    [PieceType.PAWN]: 1,
    [PieceType.LANCE]: 3,
    [PieceType.KNIGHT]: 3,
    [PieceType.SILVER]: 5,
    [PieceType.GOLD]: 5,
    [PieceType.BISHOP]: 8,
    [PieceType.ROOK]: 8,
    [PieceType.KING]: 10000,
    [PieceType.TOKIN]: 6,
    [PieceType.PROMOTED_LANCE]: 6,
    [PieceType.PROMOTED_KNIGHT]: 6,
    [PieceType.PROMOTED_SILVER]: 6,
    [PieceType.HORSE]: 10,
    [PieceType.DRAGON]: 12,
  }

  let evaluation = 0
  
  // 盤面上の駒を評価
  const sentePieces = board.getPieces(Player.SENTE)
  const gotePieces = board.getPieces(Player.GOTE)
  
  for (const piece of sentePieces) {
    evaluation += pieceValues[piece.type] || 0
  }
  
  for (const piece of gotePieces) {
    evaluation -= pieceValues[piece.type] || 0
  }
  
  return player === Player.SENTE ? evaluation : -evaluation
}

// 将来の拡張のための関数（現在は使用していない）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function minimax(
  board: Board, 
  depth: number, 
  maximizingPlayer: boolean, 
  alpha: number, 
  beta: number,
  currentPlayer: Player
): number {
  if (depth === 0) {
    return evaluateBoard(board, currentPlayer)
  }
  
  // 簡単な実装のため、深度1で評価を返す
  return evaluateBoard(board, currentPlayer)
}

// AI思考エンジン
function selectBestMove(
  board: Board, 
  player: Player, 
  thinkingTime: number = 1000,
  _difficultyLevel: number = 5 // 将来の拡張用（現在は未使用）
): Move {
  const startTime = Date.now()
  const timeLimit = Math.min(thinkingTime, 5000) // 最大5秒制限
  
  // すべての合法手を取得
  const legalMoves: Move[] = []
  
  // 盤面上の駒の移動を生成
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const pos = new Position(row, col)
      const piece = board.getPiece(pos)
      
      if (piece && piece.player === player) {
        const moves = piece.getValidMoves(board)
        for (const to of moves) {
          legalMoves.push({
            from: pos,
            to,
            isPromotion: false
          })
          
          // 成り処理のチェック（簡易版）
          if (canPromote(piece.type, pos, to, player)) {
            legalMoves.push({
              from: pos,
              to,
              isPromotion: true
            })
          }
        }
      }
    }
  }
  
  if (legalMoves.length === 0) {
    // 適当な手を返す（エラー回避）
    return {
      from: new Position(0, 0),
      to: new Position(0, 1),
      isPromotion: false
    }
  }
  
  // 時間制限内でランダムに選択（簡易AI）
  let bestMove = legalMoves[0]
  let bestScore = -Infinity
  
  for (const move of legalMoves.slice(0, Math.min(10, legalMoves.length))) {
    if (Date.now() - startTime > timeLimit) break
    
    try {
      // PieceMoveの場合のみBoard.applyMoveでテストできる
      if ('from' in move && 'to' in move) {
        const testBoard = board.applyMove(move) as Board
        const score = evaluateBoard(testBoard, player)
        
        if (score > bestScore) {
          bestScore = score
          bestMove = move
        }
      }
    } catch (error) {
      // エラーが発生した手はスキップ
      continue
    }
  }
  
  return bestMove
}

function canPromote(pieceType: PieceType, from: { row: number; column: number }, to: { row: number; column: number }, player: Player): boolean {
  // 金、王、すでに成ってる駒は成れない
  const unpromotablePieces = [PieceType.GOLD, PieceType.KING]
  if (unpromotablePieces.includes(pieceType)) return false
  
  // 成り駒の判定（簡易版）
  const promotedPieces = [
    PieceType.TOKIN, PieceType.PROMOTED_LANCE, PieceType.PROMOTED_KNIGHT,
    PieceType.PROMOTED_SILVER, PieceType.HORSE, PieceType.DRAGON
  ]
  if (promotedPieces.includes(pieceType)) return false
  
  // 敵陣への移動かチェック
  const promotionZoneStart = player === Player.SENTE ? 0 : 6
  const promotionZoneEnd = player === Player.SENTE ? 2 : 8
  
  return (
    (to.row >= promotionZoneStart && to.row <= promotionZoneEnd) ||
    (from.row >= promotionZoneStart && from.row <= promotionZoneEnd)
  )
}

// Web Worker メッセージハンドラ
self.onmessage = function(event: MessageEvent<WorkerMessage>) {
  try {
    const message = event.data
    
    if (message.type === 'CALCULATE_MOVE') {
      // Board インスタンスを復元
      const board = Board.deserialize(message.board)
      
      // AI思考実行
      const move = selectBestMove(
        board,
        message.currentPlayer,
        message.thinkingTime,
        message.difficultyLevel
      )
      
      const response: MoveResultMessage = {
        type: 'MOVE_RESULT',
        move
      }
      
      self.postMessage(response)
    }
  } catch (error) {
    const errorResponse: ErrorMessage = {
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
    
    self.postMessage(errorResponse)
  }
}

// TypeScript用のエクスポート（実際には使用されない）
export {}