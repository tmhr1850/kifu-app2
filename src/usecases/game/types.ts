import { IBoard } from '@/domain/models/board/board'
import { IPiece } from '@/domain/models/piece/interface'
import { Player, PieceType } from '@/domain/models/piece/types'
import { Position } from '@/domain/models/position/types'

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate'

export interface GameMove {
  from?: Position
  to: Position
  drop?: PieceType
  player: Player
  piece?: IPiece
  captured?: IPiece
  isPromotion?: boolean
  timestamp: Date
}

export interface CapturedPieces {
  sente: IPiece[]
  gote: IPiece[]
}

export interface GameState {
  board: IBoard
  currentPlayer: Player
  history: GameMove[]
  capturedPieces: CapturedPieces
  status: GameStatus
  isCheck: boolean
  winner?: Player
}

export interface MoveResult {
  success: boolean
  error?: Error
  gameState?: GameState
}

export interface IGameUseCase {
  startNewGame(): GameState
  movePiece(from: Position, to: Position, isPromotion?: boolean): MoveResult
  dropPiece(pieceType: PieceType, to: Position): MoveResult
  getGameState(): GameState
  getLegalMoves(from?: Position): Position[]
  canPromote(from: Position, to: Position): boolean
  resign(player: Player): void
}