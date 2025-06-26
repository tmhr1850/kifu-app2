import { Board } from '@/domain/models/board/board'
import { Player, Move } from '@/domain/models/piece/types'
import { IAIEngine } from '@/domain/services/ai-engine'
import { CapturedPieces } from '@/usecases/game/types'

/**
 * Web Workerベースの高性能AIエンジン
 * メインスレッドをブロックしないでAI思考を実行
 */
export class WebWorkerAI implements IAIEngine {
  private worker: Worker | null = null
  private isCalculating = false

  constructor() {
    // ブラウザ環境でのみWorkerを初期化
    if (typeof window !== 'undefined') {
      this.initializeWorker()
    }
  }

  private initializeWorker(): void {
    try {
      this.worker = new Worker(
        new URL('../../workers/ai.worker.ts', import.meta.url),
        { type: 'module' }
      )
    } catch (error) {
      console.error('Failed to initialize AI Worker:', error)
      this.worker = null
    }
  }

  async selectMove(
    board: Board,
    player: Player,
    thinkingTime: number = 1000,
    capturedPieces?: CapturedPieces,
    difficultyLevel: number = 5
  ): Promise<Move> {
    // Server-side renderingやWorkerが利用できない場合はフォールバック
    if (!this.worker || typeof window === 'undefined') {
      return this.fallbackMove(board, player)
    }

    if (this.isCalculating) {
      throw new Error('AI is already calculating')
    }

    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not available'))
        return
      }

      this.isCalculating = true

      const timeout = setTimeout(() => {
        this.isCalculating = false
        reject(new Error('AI calculation timeout'))
      }, Math.max(thinkingTime, 10000)) // 最大10秒でタイムアウト

      this.worker.onmessage = (event) => {
        clearTimeout(timeout)
        this.isCalculating = false

        const message = event.data
        if (message.type === 'MOVE_RESULT') {
          resolve(message.move)
        } else if (message.type === 'ERROR') {
          reject(new Error(message.error))
        } else {
          reject(new Error('Unknown response from worker'))
        }
      }

      this.worker.onerror = (error) => {
        clearTimeout(timeout)
        this.isCalculating = false
        reject(new Error(`Worker error: ${error.message}`))
      }

      try {
        this.worker.postMessage({
          type: 'CALCULATE_MOVE',
          board: board.serialize(),
          currentPlayer: player,
          capturedPieces: capturedPieces || { sente: [], gote: [] },
          thinkingTime,
          difficultyLevel
        })
      } catch (error) {
        clearTimeout(timeout)
        this.isCalculating = false
        reject(error)
      }
    })
  }

  /**
   * Workerが使用できない場合のフォールバック実装
   * 簡単なランダム選択
   */
  private fallbackMove(board: Board, player: Player): Move {
    const pieces = board.getPieces(player)
    
    if (pieces.length === 0) {
      // 適当な手を返す（エラー回避）
      return {
        from: { row: 0, column: 0 },
        to: { row: 0, column: 1 },
        isPromotion: false
      }
    }

    // ランダムな駒を選択
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)]
    if (!randomPiece.position) {
      return {
        from: { row: 0, column: 0 },
        to: { row: 0, column: 1 },
        isPromotion: false
      }
    }

    const possibleMoves = randomPiece.getValidMoves(board)
    if (possibleMoves.length === 0) {
      return {
        from: { row: 0, column: 0 },
        to: { row: 0, column: 1 },
        isPromotion: false
      }
    }

    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
    
    return {
      from: randomPiece.position,
      to: randomMove,
      isPromotion: false
    }
  }

  /**
   * AI思考をキャンセル
   */
  cancel(): void {
    if (this.worker && this.isCalculating) {
      this.worker.terminate()
      this.isCalculating = false
      this.initializeWorker()
    }
  }

  /**
   * AIエンジンの名前を取得
   */
  getName(): string {
    return 'Web Worker AI'
  }

  /**
   * AIエンジンの強さレベルを取得（1-10）
   */
  getStrengthLevel(): number {
    return 7 // Web Workerで並列処理するので強め
  }

  /**
   * リソースのクリーンアップ
   */
  dispose(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.isCalculating = false
  }
}