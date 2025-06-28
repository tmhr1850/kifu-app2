import { IPiece } from '@/domain/models/piece/interface'
import { Player, PieceType } from '@/domain/models/piece/types'
import { UIPosition } from '@/types/common'
import { GameState } from '@/usecases/game/types'

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
  aiDifficultyLevel?: number // 1-10の難易度レベル
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
  getUIBoardState(): { piece: IPiece; position: UIPosition }[]
  getBoardPiecesWithUIPositions(): { piece: IPiece; position: UIPosition }[] // 後方互換性のため
  getBoardPieces(): { piece: IPiece; position: UIPosition }[] // 後方互換性のため
  getLegalMoves(from?: UIPosition): UIPosition[]
  getLegalDropPositions(pieceType: PieceType): UIPosition[]
  canPromote(from: UIPosition, to: UIPosition): boolean
  loadGame(): Promise<GameManagerState | null>
  saveGame(): Promise<void>
  clearSavedGame(): void
}