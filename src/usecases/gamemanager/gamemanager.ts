import { Player, PieceType, Move, DropMove } from '@/domain/models/piece/types'
import { IAIEngine } from '@/domain/services/ai-engine'
import { UIPosition } from '@/types/common'
import { SimpleAI } from '@/usecases/ai/simple-ai'
import { WebWorkerAI } from '@/usecases/ai/web-worker-ai'
import { GameUseCase } from '@/usecases/game/usecase'

import { 
  GameManagerState, 
  GameManagerConfig, 
  SavedGameState, 
  IGameManager 
} from './types'

const STORAGE_KEY = 'kifu-app-game-state'
const DEFAULT_AI_THINKING_TIME = 1000 // デフォルトAI思考時間（ミリ秒）
const DEFAULT_AI_DIFFICULTY_LEVEL = 5 // デフォルト難易度レベル（1-10）
const AUTO_SAVE_DEBOUNCE_DELAY = 500 // 自動保存のdebounce遅延（ミリ秒）

// 型ガード関数
function isDropMove(move: Move): move is DropMove {
  return 'drop' in move;
}

// debounce関数
function debounce(func: () => void, delay: number): () => void {
  let timeoutId: NodeJS.Timeout | null = null;
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(func, delay);
  };
}

// シンプルなロガー
class Logger {
  static error(message: string, error?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[GameManager] ${message}`, error);
    } else {
      // プロダクションでは外部ログサービスに送信する等の処理を追加可能
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

export class GameManager implements IGameManager {
  private gameUseCase: GameUseCase
  private aiEngine: IAIEngine
  private state: GameManagerState
  private config: Required<GameManagerConfig>
  private saveGameDebounced: () => void
  private subscribers: ((state: GameManagerState) => void)[] = []

  constructor(aiEngine?: IAIEngine) {
    this.gameUseCase = new GameUseCase()
    // ブラウザ環境ではWebWorkerAI、サーバー環境ではSimpleAIを使用
    this.aiEngine = aiEngine || (typeof window !== 'undefined' ? new WebWorkerAI() : new SimpleAI())
    
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
    
    // 自動保存をdebounce（500ms）
    this.saveGameDebounced = debounce(() => {
      this.saveGame().catch((error) => Logger.error('Auto save failed', error));
    }, AUTO_SAVE_DEBOUNCE_DELAY)
  }

  // 状態変更を通知するメソッド
  private notify(): void {
    this.subscribers.forEach(callback => callback(this.state))
  }

  // 状態変更を購読するメソッド
  subscribe(callback: (state: GameManagerState) => void): () => void {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback)
    }
  }

  // 状態を更新するたびに notify() を呼ぶように変更
  private setState(newState: Partial<GameManagerState>): void {
    this.state = { ...this.state, ...newState }
    this.notify()
  }

  async startNewGame(config?: GameManagerConfig): Promise<GameManagerState> {
    this.config = {
      ...this.config,
      ...config
    }
    
    const gameState = this.gameUseCase.startNewGame()
    this.setState({
      gameState,
      isAIThinking: false,
      playerColor: this.config.playerColor,
      aiColor: this.config.playerColor === Player.SENTE ? Player.GOTE : Player.SENTE,
      error: undefined
    })
    
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
    // デバッグログ追加
    // console.log('🎲 GameManager.movePiece:', {
    //   from,
    //   to,
    //   currentPlayer: this.state.gameState.currentPlayer,
    //   playerColor: this.state.playerColor,
    //   isAIThinking: this.state.isAIThinking,
    //   isPromotion
    // });
    
    // AIが思考中の場合は操作を受け付けない
    if (this.state.isAIThinking) {
      // console.log('❌ AI思考中のため操作を受け付けません');
      return this.state
    }
    
    // プレイヤーの手番でない場合は操作を受け付けない
    if (this.state.gameState.currentPlayer !== this.state.playerColor) {
      // console.log('❌ プレイヤーの手番ではないため操作を受け付けません');
      return this.state
    }
    
    const result = this.gameUseCase.movePiece(from, to, isPromotion)
    // console.log('🎯 GameUseCase.movePiece結果:', { success: result.success, error: result.error?.message });
    
    if (result.success && result.gameState) {
      // console.log('✅ 駒移動成功！新しい手番:', result.gameState.currentPlayer);
      this.setState({
        gameState: result.gameState,
        error: undefined
      })
      
      if (this.config.enableAutoSave) {
        this.saveGameDebounced()
      }
      
      // ゲームが終了していない場合、AIの手を実行
      if (result.gameState.status === 'playing') {
        // console.log('🤖 AIの手を実行します...');
        await this.executeAIMove()
      }
    } else {
      // console.log('❌ 駒移動失敗:', result.error?.message);
      this.setState({
        error: result.error
      })
    }
    
    return this.state
  }

  // 難易度レベルに応じて思考時間を調整
  private getAdjustedThinkingTime(): number {
    const baseTime = this.config.aiThinkingTime || DEFAULT_AI_THINKING_TIME
    const level = this.config.aiDifficultyLevel || DEFAULT_AI_DIFFICULTY_LEVEL
    
    // 難易度1（簡単）: baseTime * 0.3
    // 難易度5（中級）: baseTime * 1.0
    // 難易度10（上級）: baseTime * 2.0
    const multiplier = 0.3 + (level - 1) * (1.7 / 9)
    
    return Math.round(baseTime * multiplier)
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
      this.setState({
        gameState: result.gameState,
        error: undefined
      })
      
      if (this.config.enableAutoSave) {
        this.saveGameDebounced()
      }
      
      // ゲームが終了していない場合、AIの手を実行
      if (result.gameState.status === 'playing') {
        await this.executeAIMove()
      }
    } else {
      this.setState({
        error: result.error
      })
    }
    
    return this.state
  }

  async resign(player: Player): Promise<GameManagerState> {
    this.gameUseCase.resign(player)
    this.setState({
      gameState: this.gameUseCase.getGameState(),
      error: undefined
    })
    
    if (this.config.enableAutoSave) {
      await this.saveGame()
    }
    
    return this.state
  }

  getState(): GameManagerState {
    return this.state
  }

  getUIBoardState() {
    return this.gameUseCase.getUIBoardState()
  }

  getBoardPiecesWithUIPositions() {
    return this.gameUseCase.getBoardPiecesWithUIPositions()
  }

  getBoardPieces() {
    return this.gameUseCase.getBoardPieces()
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
      this.gameUseCase.loadGameState(saved.gameState)
      
      this.setState({
        gameState: this.gameUseCase.getGameState(),
        isAIThinking: false,
        playerColor: saved.playerColor,
        aiColor: saved.playerColor === Player.SENTE ? Player.GOTE : Player.SENTE,
        error: undefined
      })
      
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
    try {
      const saveData: SavedGameState = {
        gameState: this.state.gameState,
        playerColor: this.state.playerColor,
        timestamp: new Date()
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData))
    } catch (error) {
      Logger.error('Failed to save game', error)
    }
  }

  clearSavedGame(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * GameManagerのリソースをクリーンアップ
   * WebWorkerAIのリソースも含めて適切に解放
   */
  dispose(): void {
    if (this.aiEngine && 'dispose' in this.aiEngine && typeof this.aiEngine.dispose === 'function') {
      this.aiEngine.dispose()
    }
  }

  private async executeAIMove(): Promise<void> {
    this.setState({ isAIThinking: true })
    
    try {
      // Boardインスタンスを取得
      const board = this.state.gameState.board
      
      // AIに思考させる
      const move = await this.aiEngine.selectMove(
        board,
        this.state.aiColor,
        this.getAdjustedThinkingTime()
      )
      
      // AIの手を実行
      if (isDropMove(move)) {
        // Position (0-based) を UIPosition (1-based) に変換
        const toUI: UIPosition = { 
          row: move.to.row + 1, 
          column: move.to.column + 1 
        }
        const result = this.gameUseCase.dropPiece(move.drop, toUI)
        if (result.success && result.gameState) {
          this.setState({
            gameState: result.gameState,
            isAIThinking: false,
            error: undefined
          })
        }
      } else if (move.from && move.to) {
        // Position (0-based) を UIPosition (1-based) に変換
        const fromUI: UIPosition = { 
          row: move.from.row + 1, 
          column: move.from.column + 1 
        }
        const toUI: UIPosition = { 
          row: move.to.row + 1, 
          column: move.to.column + 1 
        }
        const result = this.gameUseCase.movePiece(
          fromUI,
          toUI,
          move.isPromotion
        )
        if (result.success && result.gameState) {
          this.setState({
            gameState: result.gameState,
            isAIThinking: false,
            error: undefined
          })
        }
      }
      
      if (this.config.enableAutoSave) {
        this.saveGameDebounced()
      }
    } catch (error) {
      Logger.error('AI move failed', error)
      this.setState({
        isAIThinking: false,
        error: error instanceof Error ? error : new Error('AI思考中にエラーが発生しました')
      })
    }
  }
}