import { useRef, useEffect, useCallback } from 'react'

import { GameManager } from '@/usecases/gamemanager/gamemanager'
import { GameManagerConfig } from '@/usecases/gamemanager/types'

/**
 * GameManagerインスタンスを管理するカスタムフック
 * リソースの適切なライフサイクル管理を提供
 */
export function useGameManager() {
  const gameManagerRef = useRef<GameManager | null>(null)

  // GameManagerインスタンスを取得（遅延初期化）
  const getGameManager = useCallback(() => {
    if (!gameManagerRef.current) {
      gameManagerRef.current = new GameManager()
    }
    return gameManagerRef.current
  }, [])

  // GameManagerの再作成
  const resetGameManager = useCallback((config?: GameManagerConfig) => {
    // 既存のGameManagerがあればクリーンアップ
    if (gameManagerRef.current) {
      if ('dispose' in gameManagerRef.current && typeof gameManagerRef.current.dispose === 'function') {
        gameManagerRef.current.dispose()
      }
    }
    
    // 新しいGameManagerを作成
    gameManagerRef.current = new GameManager()
    
    if (config) {
      gameManagerRef.current.startNewGame(config)
    }
    
    return gameManagerRef.current
  }, [])

  // クリーンアップ
  useEffect(() => {
    return () => {
      // コンポーネントがアンマウントされる際のクリーンアップ
      if (gameManagerRef.current) {
        // WebWorkerなどのリソースを適切にクリーンアップ
        if ('dispose' in gameManagerRef.current && typeof gameManagerRef.current.dispose === 'function') {
          gameManagerRef.current.dispose()
        }
        gameManagerRef.current = null
      }
    }
  }, [])

  return {
    getGameManager,
    resetGameManager
  }
}