import { useEffect, useRef, useCallback } from 'react';
import { Board } from '@/domain/models/board/board';
import { IPiece } from '@/domain/models/piece/interface';
import { Position } from '@/domain/models/position';
import { Player } from '@/domain/models/position/types';

interface AIWorkerOptions {
  onMoveCalculated: (move: { from: Position; to: Position } | null) => void;
  onError?: (error: Error) => void;
}

export function useAIWorker({ onMoveCalculated, onError }: AIWorkerOptions) {
  const workerRef = useRef<Worker | null>(null);
  const isCalculatingRef = useRef(false);

  useEffect(() => {
    // Web Worker を作成
    workerRef.current = new Worker(
      new URL('../workers/ai.worker.ts', import.meta.url),
      { type: 'module' }
    );

    // メッセージハンドラを設定
    workerRef.current.onmessage = (event) => {
      if (event.data.type === 'MOVE_CALCULATED') {
        isCalculatingRef.current = false;
        onMoveCalculated(event.data.move);
        
        if (event.data.nodesEvaluated) {
          console.log(`AI evaluated ${event.data.nodesEvaluated} nodes`);
        }
      }
    };

    workerRef.current.onerror = (error) => {
      isCalculatingRef.current = false;
      onError?.(new Error(`Worker error: ${error.message}`));
    };

    // クリーンアップ
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [onMoveCalculated, onError]);

  const calculateMove = useCallback((
    board: Board,
    currentPlayer: Player,
    capturedPieces: { piece: IPiece; position: Position }[]
  ) => {
    if (!workerRef.current || isCalculatingRef.current) {
      return;
    }

    isCalculatingRef.current = true;

    // Boardをシリアライズして送信
    workerRef.current.postMessage({
      type: 'CALCULATE_MOVE',
      board: board.serialize(),
      currentPlayer,
      capturedPieces
    });
  }, []);

  const isCalculating = useCallback(() => isCalculatingRef.current, []);

  return {
    calculateMove,
    isCalculating
  };
}