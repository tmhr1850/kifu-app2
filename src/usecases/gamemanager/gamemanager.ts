import { GameUseCase } from '@/usecases/game/usecase'
import { SimpleAI } from '@/usecases/ai/simple-ai'
import { IAIEngine } from '@/domain/services/ai-engine'
import { Board } from '@/domain/models/board/board'
import { 
  GameManagerState, 
  GameManagerConfig, 
  SavedGameState, 
  IGameManager 
} from './types'
import { UIPosition } from '@/types/common'
import { Player, PieceType } from '@/domain/models/piece/types'

const STORAGE_KEY = 'kifu-app-game-state'

export class GameManager implements IGameManager {
  private gameUseCase: GameUseCase
  private aiEngine: IAIEngine
  private state: GameManagerState
  private config: Required<GameManagerConfig>

  constructor(aiEngine?: IAIEngine) {
    this.gameUseCase = new GameUseCase()
    this.aiEngine = aiEngine || new SimpleAI()
    
    const initialGameState = this.gameUseCase.startNewGame()
    this.state = {
      gameState: initialGameState,
      isAIThinking: false,
      playerColor: Player.SENTE,
      aiColor: Player.GOTE
    }
    
    this.config = {
      playerColor: Player.SENTE,
      aiThinkingTime: 1000,
      enableAutoSave: true
    }
  }

  async startNewGame(config?: GameManagerConfig): Promise<GameManagerState> {
    this.config = {
      ...this.config,
      ...config
    }
    
    const gameState = this.gameUseCase.startNewGame()
    this.state = {
      gameState,
      isAIThinking: false,
      playerColor: this.config.playerColor,
      aiColor: this.config.playerColor === Player.SENTE ? Player.GOTE : Player.SENTE,
      error: undefined
    }
    
    if (this.config.enableAutoSave) {
      await this.saveGame()
    }
    
    // AIが先手の場合、AIの手を実行
    if (this.state.aiColor === Player.SENTE) {
      await this.executeAIMove()
    }
    
    return this.state
  }

  async movePiece(
    from: UIPosition, 
    to: UIPosition, 
    isPromotion?: boolean
  ): Promise<GameManagerState> {
    // AIが思考中の場合は操作を受け付けない
    if (this.state.isAIThinking) {
      return this.state
    }
    
    // プレイヤーの手番でない場合は操作を受け付けない
    if (this.state.gameState.currentPlayer !== this.state.playerColor) {
      return this.state
    }
    
    const result = this.gameUseCase.movePiece(from, to, isPromotion)
    
    if (result.success && result.gameState) {
      this.state = {
        ...this.state,
        gameState: result.gameState,
        error: undefined
      }
      
      if (this.config.enableAutoSave) {
        await this.saveGame()
      }
      
      // ゲームが終了していない場合、AIの手を実行
      if (result.gameState.status === 'playing') {
        await this.executeAIMove()
      }
    } else {
      this.state = {
        ...this.state,
        error: result.error
      }
    }
    
    return this.state
  }

  async dropPiece(pieceType: PieceType, to: UIPosition): Promise<GameManagerState> {
    // AIが思考中の場合は操作を受け付けない
    if (this.state.isAIThinking) {
      return this.state
    }
    
    // プレイヤーの手番でない場合は操作を受け付けない
    if (this.state.gameState.currentPlayer !== this.state.playerColor) {
      return this.state
    }
    
    const result = this.gameUseCase.dropPiece(pieceType, to)
    
    if (result.success && result.gameState) {
      this.state = {
        ...this.state,
        gameState: result.gameState,
        error: undefined
      }
      
      if (this.config.enableAutoSave) {
        await this.saveGame()
      }
      
      // ゲームが終了していない場合、AIの手を実行
      if (result.gameState.status === 'playing') {
        await this.executeAIMove()
      }
    } else {
      this.state = {
        ...this.state,
        error: result.error
      }
    }
    
    return this.state
  }

  async resign(player: Player): Promise<GameManagerState> {
    this.gameUseCase.resign(player)
    this.state = {
      ...this.state,
      gameState: this.gameUseCase.getGameState(),
      error: undefined
    }
    
    if (this.config.enableAutoSave) {
      await this.saveGame()
    }
    
    return this.state
  }

  getState(): GameManagerState {
    return this.state
  }

  getLegalMoves(from?: UIPosition): UIPosition[] {
    return this.gameUseCase.getLegalMoves(from)
  }

  getLegalDropPositions(pieceType: PieceType): UIPosition[] {
    return this.gameUseCase.getLegalDropPositions(
      pieceType,
      this.state.playerColor
    )
  }

  canPromote(from: UIPosition, to: UIPosition): boolean {
    return this.gameUseCase.canPromote(from, to)
  }

  async loadGame(): Promise<GameManagerState | null> {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (!savedData) {
        return null
      }
      
      const saved: SavedGameState = JSON.parse(savedData)
      
      // 保存されたゲーム状態を復元
      const board = new Board()
      // TODO: Boardの状態を復元する機能を実装
      
      this.state = {
        gameState: saved.gameState,
        isAIThinking: false,
        playerColor: saved.playerColor,
        aiColor: saved.playerColor === Player.SENTE ? Player.GOTE : Player.SENTE,
        error: undefined
      }
      
      // AIの手番の場合、AIの手を実行
      if (this.state.gameState.currentPlayer === this.state.aiColor &&
          this.state.gameState.status === 'playing') {
        await this.executeAIMove()
      }
      
      return this.state
    } catch (error) {
      console.error('Failed to load game:', error)
      return null
    }
  }

  async saveGame(): Promise<void> {
    try {
      const saveData: SavedGameState = {
        gameState: this.state.gameState,
        playerColor: this.state.playerColor,
        timestamp: new Date()
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData))
    } catch (error) {
      console.error('Failed to save game:', error)
    }
  }

  clearSavedGame(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  private async executeAIMove(): Promise<void> {
    this.state = {
      ...this.state,
      isAIThinking: true
    }
    
    try {
      // Boardインスタンスを取得
      const board = this.state.gameState.board
      
      // AIに思考させる
      const move = await this.aiEngine.selectMove(
        board,
        this.state.aiColor,
        this.config.aiThinkingTime
      )
      
      // AIの手を実行
      if (move.drop) {
        const result = this.gameUseCase.dropPiece(move.drop, move.to!)
        if (result.success && result.gameState) {
          this.state = {
            ...this.state,
            gameState: result.gameState,
            isAIThinking: false,
            error: undefined
          }
        }
      } else if (move.from && move.to) {
        const result = this.gameUseCase.movePiece(
          move.from,
          move.to,
          move.isPromotion
        )
        if (result.success && result.gameState) {
          this.state = {
            ...this.state,
            gameState: result.gameState,
            isAIThinking: false,
            error: undefined
          }
        }
      }
      
      if (this.config.enableAutoSave) {
        await this.saveGame()
      }
    } catch (error) {
      console.error('AI move failed:', error)
      this.state = {
        ...this.state,
        isAIThinking: false,
        error: error instanceof Error ? error : new Error('AI思考中にエラーが発生しました')
      }
    }
  }
}