import { Player, PieceType, Move, DropMove } from '@/domain/models/piece/types'
import { IAIEngine } from '@/domain/services/ai-engine'
import { UIPosition } from '@/types/common'
import { SimpleAI } from '@/usecases/ai/simple-ai'
import { GameUseCase } from '@/usecases/game/usecase'

import { 
  GameManagerState, 
  GameManagerConfig, 
  SavedGameState, 
  IGameManager 
} from './types'

const STORAGE_KEY = 'kifu-app-game-state'
const DEFAULT_AI_THINKING_TIME = 1000
const DEFAULT_AI_DIFFICULTY_LEVEL = 5
const AUTO_SAVE_DEBOUNCE_DELAY = 500

// 型ガード関数
function isDropMove(move: Move): move is DropMove {
  return 'drop' in move;
}

// メモリリークを防ぐ改良版debounce関数
class DebouncedFunction {
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly func: () => void;
  private readonly delay: number;

  constructor(func: () => void, delay: number) {
    this.func = func;
    this.delay = delay;
  }

  call(): void {
    this.cancel();
    this.timeoutId = setTimeout(() => {
      this.func();
      this.timeoutId = null;
    }, this.delay);
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  dispose(): void {
    this.cancel();
  }
}

// シンプルなロガー
class Logger {
  static error(message: string, error?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[GameManager] ${message}`, error);
    } else {
      console.error(`[GameManager] ${message}`);
    }
  }
  
  static warn(message: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[GameManager] ${message}`);
    }
  }
  
  static info(message: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[GameManager] ${message}`);
    }
  }
}

// LocalStorage操作を非同期化
class AsyncStorage {
  static async getItem(key: string): Promise<string | null> {
    return new Promise((resolve) => {
      // 次のイベントループで実行
      setTimeout(() => {
        try {
          resolve(localStorage.getItem(key));
        } catch {
          resolve(null);
        }
      }, 0);
    });
  }

  static async setItem(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          localStorage.setItem(key, value);
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 0);
    });
  }

  static async removeItem(key: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          localStorage.removeItem(key);
        } catch {
          // エラーを無視
        }
        resolve();
      }, 0);
    });
  }
}

export class GameManager implements IGameManager {
  private gameUseCase: GameUseCase
  private aiEngine: IAIEngine
  private state: GameManagerState
  private config: Required<GameManagerConfig>
  private saveGameDebounced: DebouncedFunction
  private disposed = false

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
      aiThinkingTime: DEFAULT_AI_THINKING_TIME,
      aiDifficultyLevel: DEFAULT_AI_DIFFICULTY_LEVEL,
      enableAutoSave: true
    }
    
    // 自動保存をdebounce（メモリリーク対策版）
    this.saveGameDebounced = new DebouncedFunction(
      () => this.saveGame().catch((error) => Logger.error('Auto save failed', error)),
      AUTO_SAVE_DEBOUNCE_DELAY
    );
  }

  // リソースのクリーンアップメソッド
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.saveGameDebounced.dispose();
  }

  async startNewGame(config?: GameManagerConfig): Promise<GameManagerState> {
    if (this.disposed) {
      throw new Error('GameManager has been disposed');
    }

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
    if (this.disposed) {
      throw new Error('GameManager has been disposed');
    }

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
        this.saveGameDebounced.call()
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

  async dropPiece(
    pieceType: PieceType,
    to: UIPosition
  ): Promise<GameManagerState> {
    if (this.disposed) {
      throw new Error('GameManager has been disposed');
    }

    // AIが思考中の場合は操作を受け付けない
    if (this.state.isAIThinking) {
      return this.state
    }
    
    // プレイヤーの手番でない場合は操作を受け付けない
    if (this.state.gameState.currentPlayer !== this.state.playerColor) {
      return this.state
    }
    
    const result = this.gameUseCase.dropPiece(
      pieceType,
      to
    )
    
    if (result.success && result.gameState) {
      this.state = {
        ...this.state,
        gameState: result.gameState,
        error: undefined
      }
      
      if (this.config.enableAutoSave) {
        this.saveGameDebounced.call()
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
    if (this.disposed) {
      throw new Error('GameManager has been disposed');
    }

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
    if (this.disposed) {
      throw new Error('GameManager has been disposed');
    }

    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY)
      if (!savedData) {
        return null
      }
      
      const saved: SavedGameState = JSON.parse(savedData)
      
      // 保存されたゲーム状態を復元
      this.gameUseCase.loadGameState(saved.gameState)
      
      this.state = {
        gameState: this.gameUseCase.getGameState(),
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
      Logger.error('Failed to load game', error)
      return null
    }
  }

  async saveGame(): Promise<void> {
    if (this.disposed) return;

    try {
      const saveData: SavedGameState = {
        gameState: this.state.gameState,
        playerColor: this.state.playerColor,
        timestamp: new Date()
      }
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saveData))
    } catch (error) {
      Logger.error('Failed to save game', error)
    }
  }

  clearSavedGame(): void {
    AsyncStorage.removeItem(STORAGE_KEY).catch(error => 
      Logger.error('Failed to clear saved game', error)
    );
  }

  private async executeAIMove(): Promise<void> {
    if (this.disposed) return;

    this.state = {
      ...this.state,
      isAIThinking: true
    }
    
    try {
      // AI思考時間のシミュレーション
      await new Promise(resolve => setTimeout(resolve, this.config.aiThinkingTime))
      
      const move = await this.aiEngine.selectMove(
        this.state.gameState.board,
        this.state.aiColor,
        this.config.aiThinkingTime
      )
      
      if (!move || this.disposed) {
        this.state = {
          ...this.state,
          isAIThinking: false
        }
        return
      }
      
      let result
      if (isDropMove(move)) {
        // Position (0-based) を UIPosition (1-based) に変換
        const toUI: UIPosition = { 
          row: move.to.row + 1, 
          column: move.to.column + 1 
        }
        result = this.gameUseCase.dropPiece(
          move.drop,
          toUI
        )
      } else {
        // Position (0-based) を UIPosition (1-based) に変換
        const fromUI: UIPosition = { 
          row: move.from.row + 1, 
          column: move.from.column + 1 
        }
        const toUI: UIPosition = { 
          row: move.to.row + 1, 
          column: move.to.column + 1 
        }
        result = this.gameUseCase.movePiece(
          fromUI,
          toUI,
          move.isPromotion
        )
      }
      
      if (result.success && result.gameState) {
        this.state = {
          ...this.state,
          gameState: result.gameState,
          isAIThinking: false,
          error: undefined
        }
        
        if (this.config.enableAutoSave) {
          this.saveGameDebounced.call()
        }
      } else {
        this.state = {
          ...this.state,
          isAIThinking: false,
          error: result.error
        }
      }
    } catch (error) {
      Logger.error('AI move failed', error)
      this.state = {
        ...this.state,
        isAIThinking: false,
        error: new Error('AI思考中にエラーが発生しました')
      }
    }
  }
}