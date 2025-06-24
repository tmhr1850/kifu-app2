import { Board } from '@/domain/models/board/board'
import { IPiece } from '@/domain/models/piece/interface'
import { Player, PieceType } from '@/domain/models/piece/types'

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'resigned'

/**
 * UI層で扱う座標 (1-9)
 */
export interface UIPosition {
  row: number
  column: number
}

export interface GameMove {
  drop?: PieceType
  from?: UIPosition
  to?: UIPosition
  player: Player
  piece?: {
    type: PieceType
    owner: Player
  }
  captured?: {
    type: PieceType
    owner: Player
  }
  isPromotion?: boolean
  timestamp: Date
}

export interface CapturedPieces {
  sente: IPiece[]
  gote: IPiece[]
}

export interface GameState {
  board: Board
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
  movePiece(from: UIPosition, to: UIPosition, isPromotion?: boolean): MoveResult
  dropPiece(pieceType: PieceType, to: UIPosition): MoveResult
  getGameState(): GameState
  getLegalMoves(from?: UIPosition): UIPosition[]
  canPromote(from: UIPosition, to: UIPosition): boolean
  resign(player: Player): void
  getLegalDropPositions(
    pieceType: PieceType,
    player: Player,
  ): UIPosition[]
  getBoardPieces: () => { piece: IPiece; position: UIPosition }[]
}