'use client';

import React, { useState, useCallback, useMemo, useEffect, useReducer } from 'react';

import { CapturedPiecesUI } from '@/components/ui/CapturedPiecesUI';
import { CapturedPiece } from '@/components/ui/types';
import { UI_CONFIG } from '@/config/gameConfig';
import { IPiece } from '@/domain/models/piece/interface';
import { Player, PieceType, Move } from '@/domain/models/piece/types';
import { useAIWorker } from '@/hooks/useAIWorker';
import { useGameManager } from '@/hooks/useGameManager';
import { UIPosition } from '@/types/common';

import { BoardUI } from './BoardUI';
import { PromotionDialog } from './PromotionDialog';
import { ResignConfirmDialog } from './ResignConfirmDialog';

// State分割のための型定義
interface GameScreenState {
  selectedCell: UIPosition | null;
  selectedCapturedPiece: PieceType | null;
  highlightedCells: UIPosition[];
  pendingMove: { from: UIPosition; to: UIPosition } | null;
  showResignDialog: boolean;
  errorMessage: string | null;
  errorTimeoutId: NodeJS.Timeout | null;
}

type GameScreenAction =
  | { type: 'SELECT_CELL'; cell: UIPosition | null }
  | { type: 'SELECT_CAPTURED_PIECE'; piece: PieceType | null }
  | { type: 'SET_HIGHLIGHTED_CELLS'; cells: UIPosition[] }
  | { type: 'SET_PENDING_MOVE'; move: { from: UIPosition; to: UIPosition } | null }
  | { type: 'SHOW_RESIGN_DIALOG'; show: boolean }
  | { type: 'SET_ERROR'; message: string | null; timeoutId?: NodeJS.Timeout | null }
  | { type: 'CLEAR_ERROR' };

// State管理のReducer
function gameScreenReducer(state: GameScreenState, action: GameScreenAction): GameScreenState {
  switch (action.type) {
    case 'SELECT_CELL':
      return { ...state, selectedCell: action.cell };
    case 'SELECT_CAPTURED_PIECE':
      return { ...state, selectedCapturedPiece: action.piece };
    case 'SET_HIGHLIGHTED_CELLS':
      return { ...state, highlightedCells: action.cells };
    case 'SET_PENDING_MOVE':
      return { ...state, pendingMove: action.move };
    case 'SHOW_RESIGN_DIALOG':
      return { ...state, showResignDialog: action.show };
    case 'SET_ERROR':
      // 既存のタイマーをクリア
      if (state.errorTimeoutId) {
        clearTimeout(state.errorTimeoutId);
      }
      return { 
        ...state, 
        errorMessage: action.message,
        errorTimeoutId: action.timeoutId || null
      };
    case 'CLEAR_ERROR':
      if (state.errorTimeoutId) {
        clearTimeout(state.errorTimeoutId);
      }
      return { ...state, errorMessage: null, errorTimeoutId: null };
    default:
      return state;
  }
}

// 持ち駒の集計を行うユーティリティ関数
const aggregateCapturedPieces = (pieces: IPiece[]): CapturedPiece[] => {
  const pieceCount = new Map<PieceType, number>();
  for (const piece of pieces) {
    pieceCount.set(piece.type, (pieceCount.get(piece.type) || 0) + 1);
  }
  return Array.from(pieceCount.entries()).map(([type, count]) => ({ type, count }));
};

export const GameScreen: React.FC = () => {
  // メモリリーク対策されたGameManagerを使用
  const { getGameManager } = useGameManager();
  const gameManager = getGameManager();
  const [managerState, setManagerState] = useState(gameManager.getState());
  const gameState = managerState.gameState;

  // UI状態をReducerで管理
  const [uiState, dispatch] = useReducer(gameScreenReducer, {
    selectedCell: null,
    selectedCapturedPiece: null,
    highlightedCells: [],
    pendingMove: null,
    showResignDialog: false,
    errorMessage: null,
    errorTimeoutId: null
  });

  // エラー表示関数（設定ファイルから時間取得）
  const showError = useCallback((message: string) => {
    let displayTime = UI_CONFIG.DEFAULT_ERROR_DISPLAY_TIME;
    
    if (message.includes('チェックメイト') || 
        message.includes('投了') ||
        message.includes('ステイルメイト')) {
      displayTime = UI_CONFIG.CRITICAL_ERROR_DISPLAY_TIME;
    } else if (message.includes('チェック')) {
      displayTime = UI_CONFIG.WARNING_DISPLAY_TIME;
    } else if (message.includes('移動できません') || 
               message.includes('その手は指せません')) {
      displayTime = UI_CONFIG.QUICK_ERROR_DISPLAY_TIME;
    }
    
    const timeoutId = setTimeout(() => {
      dispatch({ type: 'CLEAR_ERROR' });
    }, displayTime);
    
    dispatch({ type: 'SET_ERROR', message, timeoutId });
  }, []);

  // AIの手を処理
  const handleAIMove = useCallback(async (move: Move) => {
    if (!move) {
      showError('AIが手を見つけられませんでした');
      return;
    }

    try {
      let result;
      if ('from' in move && move.from && move.to) {
        // PieceMove (駒移動)
        const fromUI: UIPosition = { 
          row: move.from.row + 1, 
          column: move.from.column + 1 
        };
        const toUI: UIPosition = { 
          row: move.to.row + 1, 
          column: move.to.column + 1 
        };
        result = await gameManager.movePiece(fromUI, toUI, move.isPromotion);
      } else if ('drop' in move && move.drop && move.to) {
        // DropMove (駒打ち)
        const toUI: UIPosition = { 
          row: move.to.row + 1, 
          column: move.to.column + 1 
        };
        result = await gameManager.dropPiece(move.drop, toUI);
      } else {
        showError('無効な手です');
        return;
      }
      setManagerState(result);
    } catch (error) {
      if (error instanceof Error) {
        showError(error.message);
      }
    }
  }, [gameManager, showError]);

  // AI Web Workerフック
  const { calculateMove: calculateAIMove, isCalculating } = useAIWorker({
    onMoveCalculated: handleAIMove,
    onError: (error) => showError(typeof error === 'string' ? error : (error as Error).message)
  });

  // 初期化とゲーム読み込み
  useEffect(() => {
    let isCancelled = false;
    
    const loadSavedGame = async () => {
      try {
        const savedState = await gameManager.loadGame();
        if (isCancelled) return;
        
        if (savedState) {
          setManagerState(savedState);
        } else {
          const newState = await gameManager.startNewGame();
          if (!isCancelled) {
            setManagerState(newState);
          }
        }
      } catch (error) {
        // GameManagerがdisposeされている場合はエラーを無視
        if (!isCancelled && error instanceof Error && !error.message.includes('disposed')) {
          console.error('Failed to load saved game:', error);
        }
      }
    };
    
    loadSavedGame();
    
    return () => {
      isCancelled = true;
    };
  }, [gameManager]);

  // AIのターンを処理（Web Worker使用）
  useEffect(() => {
    if (!gameState || gameState.status !== 'playing' || isCalculating) {
      return;
    }

    if (gameState.currentPlayer === managerState.aiColor && !managerState.isAIThinking) {
      const timer = setTimeout(() => {
        const board = gameState.board;
        calculateAIMove(board, managerState.aiColor, gameState.capturedPieces);
      }, UI_CONFIG.AI_MOVE_DELAY);

      return () => clearTimeout(timer);
    }
  }, [gameState, managerState.aiColor, managerState.isAIThinking, calculateAIMove, isCalculating]);

  // エラー監視
  useEffect(() => {
    if (managerState.error) {
      showError(managerState.error.message);
    }
  }, [managerState.error, showError]);

  // コンポーネントアンマウント時のクリーンアップ（メモリリーク対策）
  useEffect(() => {
    return () => {
      // エラータイマーをクリア
      dispatch({ type: 'CLEAR_ERROR' });
    };
  }, []);

  // 持ち駒の集計（最適化版）
  const capturedSente: CapturedPiece[] = useMemo(
    () => gameState ? aggregateCapturedPieces(gameState.capturedPieces.sente) : [],
    [gameState]
  );

  const capturedGote: CapturedPiece[] = useMemo(
    () => gameState ? aggregateCapturedPieces(gameState.capturedPieces.gote) : [],
    [gameState]
  );

  // 盤面の駒配列（最適化版）
  const boardPieces = useMemo(() => {
    if (!gameState) return [];
    
    // GameManagerのgetBoardPieces()を使用して統一性を保つ
    return gameManager.getBoardPieces();
  }, [gameState, gameManager]);

  // ハンドラー関数（メモ化）
  const handleCellClick = useCallback(async (position: UIPosition) => {
    if (!gameState || gameState.status !== 'playing' || managerState.isAIThinking) return;

    const board = gameState.board;
    const clickedPiece = board.getPiece({ row: position.row - 1, column: position.column - 1 });

    if (uiState.selectedCell) {
      if (uiState.selectedCell.row === position.row && uiState.selectedCell.column === position.column) {
        dispatch({ type: 'SELECT_CELL', cell: null });
        dispatch({ type: 'SET_HIGHLIGHTED_CELLS', cells: [] });
        return;
      }

      // 成り判定
      if (gameManager.canPromote(uiState.selectedCell, position)) {
        dispatch({ type: 'SET_PENDING_MOVE', move: { from: uiState.selectedCell, to: position } });
        return;
      }

      try {
        const result = await gameManager.movePiece(uiState.selectedCell, position);
        setManagerState(result);
        dispatch({ type: 'SELECT_CELL', cell: null });
        dispatch({ type: 'SET_HIGHLIGHTED_CELLS', cells: [] });
      } catch (error) {
        if (error instanceof Error) {
          showError(error.message);
        }
      }
    } else if (clickedPiece && clickedPiece.player === gameState.currentPlayer) {
      dispatch({ type: 'SELECT_CELL', cell: position });
      const validMoves = gameManager.getLegalMoves(position);
      dispatch({ type: 'SET_HIGHLIGHTED_CELLS', cells: validMoves });
    }
  }, [gameState, gameManager, managerState.isAIThinking, uiState.selectedCell, showError]);

  const handlePieceClick = useCallback((piece: IPiece) => {
    if (!piece.position) return;
    const position = { row: piece.position.row + 1, column: piece.position.column + 1 };
    handleCellClick(position);
  }, [handleCellClick]);

  const handleCapturedPieceClick = useCallback((pieceType: PieceType) => {
    if (!gameState || gameState.status !== 'playing' || managerState.isAIThinking) return;

    if (uiState.selectedCapturedPiece === pieceType) {
      dispatch({ type: 'SELECT_CAPTURED_PIECE', piece: null });
      dispatch({ type: 'SET_HIGHLIGHTED_CELLS', cells: [] });
      return;
    }

    dispatch({ type: 'SELECT_CAPTURED_PIECE', piece: pieceType });
    const validDropPositions = gameManager.getLegalDropPositions(pieceType);
    dispatch({ type: 'SET_HIGHLIGHTED_CELLS', cells: validDropPositions });
  }, [gameState, gameManager, managerState.isAIThinking, uiState.selectedCapturedPiece]);

  const handleNewGame = useCallback(async () => {
    gameManager.clearSavedGame();
    const newState = await gameManager.startNewGame();
    setManagerState(newState);
    dispatch({ type: 'SELECT_CELL', cell: null });
    dispatch({ type: 'SELECT_CAPTURED_PIECE', piece: null });
    dispatch({ type: 'SET_HIGHLIGHTED_CELLS', cells: [] });
    dispatch({ type: 'CLEAR_ERROR' });
  }, [gameManager]);

  const handleResign = useCallback(async () => {
    if (gameState) {
      const newState = await gameManager.resign(managerState.playerColor);
      setManagerState(newState);
      dispatch({ type: 'SHOW_RESIGN_DIALOG', show: false });
    }
  }, [gameManager, gameState, managerState.playerColor]);

  const handlePromotionDecision = useCallback(async (promote: boolean) => {
    if (!uiState.pendingMove) return;

    try {
      const result = await gameManager.movePiece(
        uiState.pendingMove.from,
        uiState.pendingMove.to,
        promote
      );
      setManagerState(result);
    } catch (error) {
      if (error instanceof Error) {
        showError(error.message);
      }
    } finally {
      dispatch({ type: 'SET_PENDING_MOVE', move: null });
      dispatch({ type: 'SELECT_CELL', cell: null });
      dispatch({ type: 'SET_HIGHLIGHTED_CELLS', cells: [] });
    }
  }, [gameManager, uiState.pendingMove, showError]);

  if (!gameState) {
    return <div>Loading...</div>;
  }

  const currentPlayerText = gameState.currentPlayer === Player.SENTE ? '先手番' : '後手番';
  const winnerText = gameState.status === 'checkmate'
    ? gameState.winner === Player.SENTE
      ? '先手の勝ち'
      : '後手の勝ち'
    : '';

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* ヘッダー */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2">将棋ゲーム</h1>
            <div className="flex justify-center items-center gap-4">
              <span className="text-xl font-semibold">{currentPlayerText}</span>
              {(managerState.isAIThinking || isCalculating) && (
                <span className="text-blue-600 font-semibold">AIが考え中...</span>
              )}
              {gameState.isCheck && gameState.status === 'playing' && (
                <span className="text-red-600 font-bold">王手！</span>
              )}
              {gameState.status === 'checkmate' && (
                <div className="text-red-600 font-bold">
                  <span>詰み！</span>
                  <span className="ml-2">{winnerText}</span>
                </div>
              )}
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-6">
            {/* 後手の持ち駒 */}
            <div data-testid="captured-pieces-gote" className="order-2 lg:order-1">
              <h2 className="text-lg font-semibold mb-2">後手の持ち駒</h2>
              <CapturedPiecesUI
                capturedPieces={capturedGote}
                player={Player.GOTE}
                isMyTurn={managerState.playerColor === Player.GOTE && gameState.currentPlayer === Player.GOTE && !managerState.isAIThinking}
                onPieceClick={handleCapturedPieceClick}
                selectedPiece={
                  managerState.playerColor === Player.GOTE && gameState.currentPlayer === Player.GOTE ? uiState.selectedCapturedPiece : null
                }
              />
            </div>

            {/* 将棋盤 */}
            <div className="order-1 lg:order-2 relative" role="grid">
              <BoardUI
                pieces={boardPieces}
                onCellClick={handleCellClick}
                onPieceClick={handlePieceClick}
                highlightedCells={uiState.highlightedCells}
                selectedCell={uiState.selectedCell}
              />
              {/* AI思考中のオーバーレイ */}
              {(managerState.isAIThinking || isCalculating) && (
                <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center rounded-lg">
                  <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                    <span className="text-lg font-semibold text-blue-600">AIが考え中...</span>
                  </div>
                </div>
              )}
            </div>

            {/* 先手の持ち駒 */}
            <div data-testid="captured-pieces-sente" className="order-3">
              <h2 className="text-lg font-semibold mb-2">先手の持ち駒</h2>
              <CapturedPiecesUI
                capturedPieces={capturedSente}
                player={Player.SENTE}
                isMyTurn={managerState.playerColor === Player.SENTE && gameState.currentPlayer === Player.SENTE && !managerState.isAIThinking}
                onPieceClick={handleCapturedPieceClick}
                selectedPiece={
                  managerState.playerColor === Player.SENTE && gameState.currentPlayer === Player.SENTE ? uiState.selectedCapturedPiece : null
                }
              />
            </div>
          </div>

          {/* コントロールボタン */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleNewGame}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              新規対局
            </button>
            {gameState.status === 'playing' && (
              <button
                onClick={() => dispatch({ type: 'SHOW_RESIGN_DIALOG', show: true })}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                投了
              </button>
            )}
          </div>
        </div>

        {/* エラーメッセージ */}
        {uiState.errorMessage && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
            {uiState.errorMessage}
          </div>
        )}
      </div>

      {/* 成り確認ダイアログ */}
      {uiState.pendingMove && (
        <PromotionDialog
          onChoice={handlePromotionDecision}
          onCancel={() => {
            dispatch({ type: 'SET_PENDING_MOVE', move: null });
            dispatch({ type: 'SELECT_CELL', cell: null });
            dispatch({ type: 'SET_HIGHLIGHTED_CELLS', cells: [] });
          }}
        />
      )}

      {/* 投了確認ダイアログ */}
      {uiState.showResignDialog && (
        <ResignConfirmDialog
          onConfirm={handleResign}
          onCancel={() => dispatch({ type: 'SHOW_RESIGN_DIALOG', show: false })}
        />
      )}
    </div>
  );
};