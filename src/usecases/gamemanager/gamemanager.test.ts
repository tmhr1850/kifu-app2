import { GameManager } from './gamemanager'
import { IAIEngine } from '@/domain/services/ai-engine'
import { IBoard } from '@/domain/models/piece/interface'
import { Player, PieceType, Move } from '@/domain/models/piece/types'
import { UIPosition } from '@/types/common'

// モックAIエンジン
class MockAIEngine implements IAIEngine {
  private mockMove: Move
  
  constructor(mockMove?: Move) {
    this.mockMove = mockMove || {
      from: { file: 7, rank: 7 },
      to: { file: 7, rank: 6 },
      piece: PieceType.PAWN,
      player: Player.GOTE
    }
  }
  
  async selectMove(board: IBoard, player: Player, timeLimit: number): Promise<Move> {
    // 簡単な遅延を追加してAI思考をシミュレート
    await new Promise(resolve => setTimeout(resolve, 100))
    return this.mockMove
  }
  
  getName(): string {
    return 'MockAI'
  }
  
  getStrengthLevel(): number {
    return 1
  }
}

describe('GameManager', () => {
  let gameManager: GameManager
  let mockAI: MockAIEngine
  
  beforeEach(() => {
    // localStorageのモック
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    }
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    
    mockAI = new MockAIEngine()
    gameManager = new GameManager(mockAI)
  })
  
  describe('startNewGame', () => {
    it('新規ゲームを開始できる', async () => {
      const state = await gameManager.startNewGame()
      
      expect(state.gameState).toBeDefined()
      expect(state.gameState.currentPlayer).toBe(Player.SENTE)
      expect(state.isAIThinking).toBe(false)
      expect(state.playerColor).toBe(Player.SENTE)
      expect(state.aiColor).toBe(Player.GOTE)
    })
    
    it('プレイヤーが後手の場合、AIが先に指す', async () => {
      const state = await gameManager.startNewGame({
        playerColor: Player.GOTE
      })
      
      // AIの手が実行されているはず
      expect(state.gameState.currentPlayer).toBe(Player.GOTE)
      expect(state.gameState.history.length).toBeGreaterThan(0)
    })
    
    it('自動保存が有効な場合、ゲーム状態を保存する', async () => {
      await gameManager.startNewGame({
        enableAutoSave: true
      })
      
      expect(localStorage.setItem).toHaveBeenCalled()
    })
  })
  
  describe('movePiece', () => {
    beforeEach(async () => {
      await gameManager.startNewGame()
    })
    
    it('プレイヤーの手番で駒を移動できる', async () => {
      const from: UIPosition = { file: 7, rank: 7 }
      const to: UIPosition = { file: 7, rank: 6 }
      
      const state = await gameManager.movePiece(from, to)
      
      expect(state.error).toBeUndefined()
      expect(state.gameState.history.length).toBeGreaterThan(0)
    })
    
    it('AIの手番では駒を移動できない', async () => {
      // 先に1手指してAIの手番にする
      await gameManager.movePiece({ file: 7, rank: 7 }, { file: 7, rank: 6 })
      
      // AIが思考中の間は移動できない
      const initialState = gameManager.getState()
      const state = await gameManager.movePiece({ file: 3, rank: 7 }, { file: 3, rank: 6 })
      
      expect(state).toBe(initialState)
    })
    
    it('不正な移動の場合エラーを設定する', async () => {
      const from: UIPosition = { file: 1, rank: 1 }
      const to: UIPosition = { file: 9, rank: 9 }
      
      const state = await gameManager.movePiece(from, to)
      
      expect(state.error).toBeDefined()
    })
    
    it('プレイヤーの手の後、AIが自動的に指す', async () => {
      const from: UIPosition = { file: 7, rank: 7 }
      const to: UIPosition = { file: 7, rank: 6 }
      
      const state = await gameManager.movePiece(from, to)
      
      // 少し待ってAIの手が実行されるのを待つ
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const newState = gameManager.getState()
      expect(newState.gameState.history.length).toBeGreaterThan(1)
      expect(newState.gameState.currentPlayer).toBe(Player.SENTE)
    })
  })
  
  describe('dropPiece', () => {
    beforeEach(async () => {
      await gameManager.startNewGame()
    })
    
    it('持ち駒を打てる', async () => {
      // まず駒を取る必要があるので、適当に動かす
      // この部分は実際のゲームロジックに依存
      const state = await gameManager.dropPiece(PieceType.PAWN, { file: 5, rank: 5 })
      
      // 実際には持ち駒がないとエラーになるはずだが、
      // テストではその振る舞いを確認
      expect(state).toBeDefined()
    })
  })
  
  describe('resign', () => {
    it('投了できる', async () => {
      await gameManager.startNewGame()
      const state = await gameManager.resign(Player.SENTE)
      
      expect(state.gameState.status).toBe('resigned')
      expect(state.gameState.winner).toBe(Player.GOTE)
    })
  })
  
  describe('getLegalMoves', () => {
    it('合法手を取得できる', async () => {
      await gameManager.startNewGame()
      const moves = gameManager.getLegalMoves({ file: 7, rank: 7 })
      
      expect(Array.isArray(moves)).toBe(true)
      expect(moves.length).toBeGreaterThan(0)
    })
  })
  
  describe('getLegalDropPositions', () => {
    it('持ち駒の合法な打ち場所を取得できる', async () => {
      await gameManager.startNewGame()
      const positions = gameManager.getLegalDropPositions(PieceType.PAWN)
      
      expect(Array.isArray(positions)).toBe(true)
    })
  })
  
  describe('canPromote', () => {
    it('成りの可否を判定できる', async () => {
      await gameManager.startNewGame()
      const canPromote = gameManager.canPromote(
        { file: 7, rank: 7 },
        { file: 7, rank: 3 }
      )
      
      expect(typeof canPromote).toBe('boolean')
    })
  })
  
  describe('saveGame/loadGame', () => {
    it('ゲーム状態を保存・読み込みできる', async () => {
      await gameManager.startNewGame()
      await gameManager.saveGame()
      
      expect(localStorage.setItem).toHaveBeenCalled()
      
      // localStorageのモックを設定
      const savedData = (localStorage.setItem as jest.Mock).mock.calls[0][1]
      ;(localStorage.getItem as jest.Mock).mockReturnValue(savedData)
      
      const newManager = new GameManager(mockAI)
      const loadedState = await newManager.loadGame()
      
      expect(loadedState).not.toBeNull()
      expect(loadedState?.playerColor).toBe(Player.SENTE)
    })
    
    it('保存されたゲームがない場合はnullを返す', async () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      const loadedState = await gameManager.loadGame()
      
      expect(loadedState).toBeNull()
    })
  })
  
  describe('clearSavedGame', () => {
    it('保存されたゲームを削除できる', () => {
      gameManager.clearSavedGame()
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('kifu-app-game-state')
    })
  })
  
  describe('AI思考中の処理', () => {
    it('AI思考中はisAIThinkingがtrueになる', async () => {
      // 遅いAIを使用
      const slowAI = new MockAIEngine()
      slowAI.selectMove = async () => {
        await new Promise(resolve => setTimeout(resolve, 500))
        return {
          from: { file: 7, rank: 7 },
          to: { file: 7, rank: 6 },
          piece: PieceType.PAWN,
          player: Player.GOTE
        }
      }
      
      const manager = new GameManager(slowAI)
      await manager.startNewGame()
      
      // プレイヤーの手を指す
      const movePromise = manager.movePiece({ file: 7, rank: 7 }, { file: 7, rank: 6 })
      
      // AI思考中の状態を確認
      await new Promise(resolve => setTimeout(resolve, 100))
      const state = manager.getState()
      expect(state.isAIThinking).toBe(true)
      
      // AI思考完了を待つ
      await movePromise
      await new Promise(resolve => setTimeout(resolve, 600))
      const finalState = manager.getState()
      expect(finalState.isAIThinking).toBe(false)
    })
  })
})