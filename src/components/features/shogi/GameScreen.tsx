'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';

import { CapturedPiecesUI } from '@/components/ui/CapturedPiecesUI';
import { CapturedPiece } from '@/components/ui/types';
import { IPiece } from '@/domain/models/piece/interface';
import { Player, PieceType } from '@/domain/models/piece/types';
import { useGameManager } from '@/hooks/useGameManager';
import { UIPosition } from '@/types/common';

import { BoardUI } from './BoardUI';
import { PromotionDialog } from './PromotionDialog';
import { ResignConfirmDialog } from './ResignConfirmDialog';

interface PendingMove {
  from: UIPosition;
  to: UIPosition;
}

export const GameScreen: React.FC = React.memo(function GameScreen() {
  const { getGameManager } = useGameManager();
  const gameManager = getGameManager();
  const [managerState, setManagerState] = useState(() => gameManager.getState());

  useEffect(() => {
    const unsubscribe = gameManager.subscribe(setManagerState);
    return () => unsubscribe();
  }, [gameManager]);

  const gameState = managerState?.gameState;
  const [selectedCell, setSelectedCell] = useState<UIPosition | null>(null);
  const [selectedCapturedPiece, setSelectedCapturedPiece] = useState<PieceType | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<UIPosition[]>([]);
  
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [showResignDialog, setShowResignDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 初期化時に保存されたゲームを読み込む
  useEffect(() => {
    const loadSavedGame = async () => {
      const savedState = await gameManager.loadGame();
      if (savedState) {
        setManagerState(savedState);
      } else {
        // 保存されたゲームがない場合は新規ゲームを開始
        const newState = await gameManager.startNewGame();
        setManagerState(newState);
      }
    };
    loadSavedGame();
  }, [gameManager]);

  // エラーメッセージの表示時間をエラーの種類によって調整
  useEffect(() => {
    if (errorMessage) {
      // エラーの種類によって表示時間を決定
      let displayTime = 3000; // デフォルト3秒
      
      // 重要なエラーは長く表示
      if (errorMessage.includes('チェックメイト') || 
          errorMessage.includes('投了') ||
          errorMessage.includes('ステイルメイト')) {
        displayTime = 10000; // 10秒
      } else if (errorMessage.includes('チェック')) {
        displayTime = 5000; // 5秒
      }
      // 軽微なエラー（移動できない等）は短く
      else if (errorMessage.includes('移動できません') || 
               errorMessage.includes('その手は指せません')) {
        displayTime = 2000; // 2秒
      }
      
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, displayTime);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // GameManagerのエラーを監視
  useEffect(() => {
    if (managerState?.error) {
      setErrorMessage(managerState.error.message);
    }
  }, [managerState?.error]);

  // AIが思考を開始したら選択状態をクリア
  useEffect(() => {
    if (managerState?.isAIThinking) {
      setSelectedCell(null);
      setHighlightedCells([]);
      setSelectedCapturedPiece(null);
    }
  }, [managerState?.isAIThinking]);

  const capturedSente = useMemo((): CapturedPiece[] => {
    if (!gameState) return [];
    const pieceCount = new Map<PieceType, number>();
    for (const piece of gameState.capturedPieces.sente) {
      pieceCount.set(piece.type, (pieceCount.get(piece.type) || 0) + 1);
    }
    return Array.from(pieceCount.entries()).map(([type, count]) => ({ type, count }));
  }, [gameState]);

  const capturedGote = useMemo((): CapturedPiece[] => {
    if (!gameState) return [];
    const pieceCount = new Map<PieceType, number>();
    for (const piece of gameState.capturedPieces.gote) {
      pieceCount.set(piece.type, (pieceCount.get(piece.type) || 0) + 1);
    }
    return Array.from(pieceCount.entries()).map(([type, count]) => ({ type, count }));
  }, [gameState]);

  // 盤面の駒を配列に変換（GameUseCaseと同じ座標変換を使用）
  const boardPieces = useMemo(() => {
    if (!gameState) return [];
    return gameManager.getBoardPieces();
  }, [gameState, gameManager]);

  // セルがクリックされた時の処理
  const handleCellClick = useCallback(async (position: UIPosition) => {
    // AIが思考中の場合は操作を受け付けない
    if (managerState?.isAIThinking) {
      return;
    }


    // 持ち駒が選択されている場合
    if (selectedCapturedPiece) {
      const newState = await gameManager.dropPiece(selectedCapturedPiece, position);
      setManagerState(newState);
      if (!newState.error) {
        setSelectedCapturedPiece(null);
        setHighlightedCells([]);
        setErrorMessage(null); // 成功時はエラーメッセージをクリア
      }
      return;
    }

    // 駒が選択されている場合、移動処理
    if (selectedCell) {
      const from = selectedCell;
      const to = position;
      
      // 成りが可能かチェック
      if (gameManager.canPromote(from, to)) {
        setPendingMove({ from, to });
      } else {
        // 通常の移動
        const newState = await gameManager.movePiece(from, to);
        setManagerState(newState);
        if (!newState.error) {
          setErrorMessage(null); // 成功時はエラーメッセージをクリア
        }
      }

      setSelectedCell(null);
      setHighlightedCells([]);
    }
  }, [selectedCell, selectedCapturedPiece, gameManager, managerState?.isAIThinking]);

  // 駒がクリックされた時の処理
  const handlePieceClick = useCallback((piece: IPiece, position?: UIPosition) => {
    if (!gameState || managerState?.isAIThinking) return;
    
    // プレイヤーの駒のみ選択可能
    if (piece.player !== managerState?.playerColor) {
      return;
    }
    // 現在の手番でない場合は選択不可
    if (gameState.currentPlayer !== managerState?.playerColor) {
      return;
    }

    // 位置情報が渡されていれば直接使用、なければ駒から検索
    let uiPos: UIPosition | undefined = position;
    if (!uiPos) {
      const clickedPiece = boardPieces.find(p => p.piece === piece);
      uiPos = clickedPiece?.position;
    }
    
    if (uiPos) {
      setSelectedCell(uiPos);
      setSelectedCapturedPiece(null);
      const validMoves = gameManager.getLegalMoves(uiPos);
      setHighlightedCells(validMoves);
    }
  }, [gameManager, gameState, boardPieces, managerState?.playerColor, managerState?.isAIThinking]);

  // 持ち駒がクリックされた時の処理
  const handleCapturedPieceClick = useCallback((pieceType: PieceType) => {
    if (!gameState || managerState?.isAIThinking) return;
    // 現在の手番でない場合は選択不可
    if (gameState.currentPlayer !== managerState?.playerColor) {
      return;
    }
    
    setSelectedCapturedPiece(pieceType);
    setSelectedCell(null);

    const validDropPositions = gameManager.getLegalDropPositions(pieceType);
    setHighlightedCells(validDropPositions);
  }, [gameManager, gameState, managerState?.playerColor, managerState?.isAIThinking]);

  // 成り選択の処理
  const handlePromotionChoice = useCallback(async (promote: boolean) => {
    if (pendingMove) {
      const newState = await gameManager.movePiece(pendingMove.from, pendingMove.to, promote);
      setManagerState(newState);
      if (!newState.error) {
        setErrorMessage(null); // 成功時はエラーメッセージをクリア
      }
      setPendingMove(null);
    }
  }, [pendingMove, gameManager]);

  // 新規対局
  const handleNewGame = useCallback(async () => {
    // 保存されたゲームをクリア
    gameManager.clearSavedGame();
    
    const newState = await gameManager.startNewGame();
    setManagerState(newState);
    setSelectedCell(null);
    setSelectedCapturedPiece(null);
    setHighlightedCells([]);
    setErrorMessage(null);
  }, [gameManager]);

  // 投了
  const handleResign = useCallback(async () => {
    if (gameState) {
      const newState = await gameManager.resign(managerState?.playerColor);
      setManagerState(newState);
      setShowResignDialog(false);
    }
  }, [gameManager, gameState, managerState?.playerColor]);

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
              {managerState?.isAIThinking && (
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
                isMyTurn={managerState?.playerColor === Player.GOTE && gameState.currentPlayer === Player.GOTE && !managerState?.isAIThinking}
                onPieceClick={handleCapturedPieceClick}
                selectedPiece={
                  managerState?.playerColor === Player.GOTE && gameState.currentPlayer === Player.GOTE ? selectedCapturedPiece : null
                }
              />
            </div>

            {/* 将棋盤 */}
            <div className="order-1 lg:order-2 relative" role="grid">
              <BoardUI
                pieces={boardPieces}
                onCellClick={handleCellClick}
                onPieceClick={handlePieceClick}
                highlightedCells={highlightedCells}
                selectedCell={selectedCell}
              />
              {/* AI思考中のオーバーレイ */}
              {managerState?.isAIThinking && (
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
                isMyTurn={managerState?.playerColor === Player.SENTE && gameState.currentPlayer === Player.SENTE && !managerState?.isAIThinking}
                onPieceClick={handleCapturedPieceClick}
                selectedPiece={
                  managerState?.playerColor === Player.SENTE && gameState.currentPlayer === Player.SENTE ? selectedCapturedPiece : null
                }
              />
            </div>
          </div>

          {/* コントロールボタン */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleNewGame}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={managerState?.isAIThinking}
            >
              新規対局
            </button>
            <button
              onClick={() => setShowResignDialog(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={gameState.status === 'checkmate' || gameState.status === 'resigned' || managerState?.isAIThinking}
            >
              投了
            </button>
          </div>
        </div>
      </div>

      {/* 成り選択ダイアログ */}
      {pendingMove && (
        <PromotionDialog
          onChoice={handlePromotionChoice}
          onCancel={() => setPendingMove(null)}
        />
      )}

      {/* 投了確認ダイアログ */}
      {showResignDialog && (
        <ResignConfirmDialog
          onConfirm={handleResign}
          onCancel={() => setShowResignDialog(false)}
        />
      )}

      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                aria-label="エラーメッセージを閉じる"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});