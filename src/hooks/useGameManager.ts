import { useEffect, useRef } from 'react';

import { IAIEngine } from '@/domain/services/ai-engine';
import { GameManager } from '@/usecases/gamemanager/gamemanager';

/**
 * GameManagerのライフサイクルを管理するカスタムフック
 * メモリリークを防ぐため、コンポーネントのアンマウント時に
 * 適切にクリーンアップを行う
 */
export function useGameManager(aiEngine?: IAIEngine): GameManager {
  const managerRef = useRef<GameManager | null>(null);

  // GameManagerのインスタンスを作成（初回のみ）
  if (!managerRef.current) {
    managerRef.current = new GameManager(aiEngine);
  }

  // クリーンアップ処理
  useEffect(() => {
    const manager = managerRef.current;

    return () => {
      // コンポーネントのアンマウント時にGameManagerをdispose
      if (manager) {
        manager.dispose();
        managerRef.current = null;
      }
    };
  }, []);

  return managerRef.current;
}