import { useRef, useCallback, useEffect } from 'react'

import { Board } from '@/domain/models/board/board'
import { Player, Move } from '@/domain/models/piece/types'
import { CapturedPieces } from '@/usecases/game/types'

interface UseAIWorkerOptions {
  onMoveCalculated: (move: Move) => void
  onError: (error: string) => void
}

// Web Worker レスポンス型
interface MoveResultMessage {
  type: 'MOVE_RESULT'
  move: Move
}

interface ErrorMessage {
  type: 'ERROR'
  error: string
}

type WorkerResponse = MoveResultMessage | ErrorMessage

export function useAIWorker({ onMoveCalculated, onError }: UseAIWorkerOptions) {
  const workerRef = useRef<Worker | null>(null)
  const isCalculatingRef = useRef(false)

  // Worker初期化
  useEffect(() => {
    // ブラウザ環境でのみWorkerを初期化
    if (typeof window !== 'undefined') {
      try {
        workerRef.current = new Worker(
          new URL('../workers/ai.worker.ts', import.meta.url),
          { type: 'module' }
        )

        workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
          isCalculatingRef.current = false
          
          const message = event.data
          if (message.type === 'MOVE_RESULT') {
            onMoveCalculated(message.move)
          } else if (message.type === 'ERROR') {
            onError(message.error)
          }
        }

        workerRef.current.onerror = (error) => {
          isCalculatingRef.current = false
          onError(`Worker error: ${error.message}`)
        }
      } catch (error) {
        onError(`Failed to initialize AI Worker: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [onMoveCalculated, onError])

  // AI思考開始
  const calculateMove = useCallback((
    board: Board,
    currentPlayer: Player,
    capturedPieces: CapturedPieces,
    thinkingTime: number = 1000,
    difficultyLevel: number = 5
  ) => {
    if (!workerRef.current) {
      onError('AI Worker is not initialized')
      return
    }

    if (isCalculatingRef.current) {
      onError('AI is already calculating')
      return
    }

    isCalculatingRef.current = true

    try {
      workerRef.current.postMessage({
        type: 'CALCULATE_MOVE',
        board: board.serialize(),
        currentPlayer,
        capturedPieces,
        thinkingTime,
        difficultyLevel
      })
    } catch (error) {
      isCalculatingRef.current = false
      onError(`Failed to send message to worker: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [onError])

  // AI思考キャンセル
  const cancelCalculation = useCallback(() => {
    if (workerRef.current && isCalculatingRef.current) {
      workerRef.current.terminate()
      isCalculatingRef.current = false
      
      // Workerを再作成
      if (typeof window !== 'undefined') {
        try {
          workerRef.current = new Worker(
            new URL('../workers/ai.worker.ts', import.meta.url),
            { type: 'module' }
          )

          workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
            isCalculatingRef.current = false
            
            const message = event.data
            if (message.type === 'MOVE_RESULT') {
              onMoveCalculated(message.move)
            } else if (message.type === 'ERROR') {
              onError(message.error)
            }
          }

          workerRef.current.onerror = (error) => {
            isCalculatingRef.current = false
            onError(`Worker error: ${error.message}`)
          }
        } catch (error) {
          onError(`Failed to recreate AI Worker: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }
  }, [onMoveCalculated, onError])

  return {
    calculateMove,
    cancelCalculation,
    isCalculating: isCalculatingRef.current
  }
}