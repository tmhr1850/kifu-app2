import { GameState, GameMove } from '@/usecases/game/types'
import { UIPosition, GameStatus } from '@/types/common'
import { Player, PieceType } from '@/domain/models/piece/types'

export interface GameManagerState {
  gameState: GameState
  isAIThinking: boolean
  playerColor: Player
  aiColor: Player
  error?: Error
}

export interface GameManagerConfig {
  playerColor?: Player
  aiThinkingTime?: number
  enableAutoSave?: boolean
}

export interface SavedGameState {
  gameState: GameState
  playerColor: Player
  timestamp: Date
}

export interface IGameManager {
  startNewGame(config?: GameManagerConfig): Promise<GameManagerState>
  movePiece(from: UIPosition, to: UIPosition, isPromotion?: boolean): Promise<GameManagerState>
  dropPiece(pieceType: PieceType, to: UIPosition): Promise<GameManagerState>
  resign(player: Player): Promise<GameManagerState>
  getState(): GameManagerState
  getLegalMoves(from?: UIPosition): UIPosition[]
  getLegalDropPositions(pieceType: PieceType): UIPosition[]
  canPromote(from: UIPosition, to: UIPosition): boolean
  loadGame(): Promise<GameManagerState | null>
  saveGame(): Promise<void>
  clearSavedGame(): void
}