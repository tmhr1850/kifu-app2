'use client';

import React, { useState, useCallback, useMemo } from 'react';

import { CapturedPiecesUI } from '@/components/ui/CapturedPiecesUI';
import { CapturedPiece } from '@/components/ui/types';
import { IPiece } from '@/domain/models/piece/interface';
import { Player, PieceType } from '@/domain/models/piece/types';
import { UIPosition } from '@/usecases/game/types';
import { GameUseCase } from '@/usecases/game/usecase';

import { BoardUI } from './BoardUI';
import { PromotionDialog } from './PromotionDialog';
import { ResignConfirmDialog } from './ResignConfirmDialog';

interface PendingMove {
  from: UIPosition;
  to: UIPosition;
}

export const GameScreen: React.FC = () => {
  const [gameUseCase] = useState(() => new GameUseCase());
  const [gameState, setGameState] = useState(gameUseCase.getGameState());
  const [selectedCell, setSelectedCell] = useState<UIPosition | null>(null);
  const [selectedCapturedPiece, setSelectedCapturedPiece] = useState<PieceType | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<UIPosition[]>([]);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [showResignDialog, setShowResignDialog] = useState(false);

  // ゲームの初期化は useState の遅延初期化で行うため、useEffectは不要
  // useEffect(() => {
  //   setGameState(gameUseCase.startNewGame());
  // }, [gameUseCase]);

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

  // 盤面の駒を配列に変換
  const boardPieces = useMemo(
    () => gameUseCase.getBoardPieces(),
    [gameUseCase]
  );

  // セルがクリックされた時の処理
  const handleCellClick = useCallback((position: UIPosition) => {
    // 持ち駒が選択されている場合
    if (selectedCapturedPiece) {
      const result = gameUseCase.dropPiece(selectedCapturedPiece, position);
      if (result.success && result.gameState) {
        setGameState(result.gameState);
        setSelectedCapturedPiece(null);
        setHighlightedCells([]);
      }
      return;
    }

    // 駒が選択されている場合、移動処理
    if (selectedCell) {
      const from = selectedCell;
      const to = position;

      // 成りが可能かチェック
      if (gameUseCase.canPromote(from, to)) {
        setPendingMove({ from, to });
      } else {
        // 通常の移動
        const result = gameUseCase.movePiece(from, to);
        if (result.success && result.gameState) {
          setGameState(result.gameState);
        }
      }

      setSelectedCell(null);
      setHighlightedCells([]);
    }
  }, [selectedCell, selectedCapturedPiece, gameUseCase]);

  // 駒がクリックされた時の処理
  const handlePieceClick = useCallback((piece: IPiece) => {
    if (!gameState) return;
    // 自分の駒のみ選択可能
    if (piece.player !== gameState.currentPlayer) {
      return;
    }

    const clickedPiece = boardPieces.find(p => p.piece === piece);
    if (clickedPiece && clickedPiece.position) {
      const uiPos = clickedPiece.position;
      setSelectedCell(uiPos);
      setSelectedCapturedPiece(null);
      const validMoves = gameUseCase.getLegalMoves(uiPos);
      setHighlightedCells(validMoves);
    }
  }, [gameUseCase, gameState, boardPieces]);

  // 持ち駒がクリックされた時の処理
  const handleCapturedPieceClick = useCallback((pieceType: PieceType) => {
    if (!gameState) return;
    
    setSelectedCapturedPiece(pieceType);
    setSelectedCell(null);

    const validDropPositions = gameUseCase.getLegalDropPositions(
      pieceType,
      gameState.currentPlayer
    );
    setHighlightedCells(validDropPositions);
  }, [gameUseCase, gameState]);

  // 成り選択の処理
  const handlePromotionChoice = useCallback((promote: boolean) => {
    if (pendingMove) {
      const result = gameUseCase.movePiece(pendingMove.from, pendingMove.to, promote);
      if (result.success && result.gameState) {
        setGameState(result.gameState);
      }
      setPendingMove(null);
    }
  }, [pendingMove, gameUseCase]);

  // 新規対局
  const handleNewGame = useCallback(() => {
    setGameState(gameUseCase.startNewGame());
    setSelectedCell(null);
    setSelectedCapturedPiece(null);
    setHighlightedCells([]);
  }, [gameUseCase]);

  // 投了
  const handleResign = useCallback(() => {
    if (gameState) {
      gameUseCase.resign(gameState.currentPlayer);
      setGameState(gameUseCase.getGameState());
      setShowResignDialog(false);
    }
  }, [gameUseCase, gameState]);

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
                isMyTurn={gameState.currentPlayer === Player.GOTE}
                onPieceClick={handleCapturedPieceClick}
                selectedPiece={
                  gameState.currentPlayer === Player.GOTE ? selectedCapturedPiece : null
                }
              />
            </div>

            {/* 将棋盤 */}
            <div className="order-1 lg:order-2" role="grid">
              <BoardUI
                pieces={boardPieces}
                onCellClick={handleCellClick}
                onPieceClick={handlePieceClick}
                highlightedCells={highlightedCells}
                selectedCell={selectedCell}
              />
            </div>

            {/* 先手の持ち駒 */}
            <div data-testid="captured-pieces-sente" className="order-3">
              <h2 className="text-lg font-semibold mb-2">先手の持ち駒</h2>
              <CapturedPiecesUI
                capturedPieces={capturedSente}
                player={Player.SENTE}
                isMyTurn={gameState.currentPlayer === Player.SENTE}
                onPieceClick={handleCapturedPieceClick}
                selectedPiece={
                  gameState.currentPlayer === Player.SENTE ? selectedCapturedPiece : null
                }
              />
            </div>
          </div>

          {/* コントロールボタン */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleNewGame}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              新規対局
            </button>
            <button
              onClick={() => setShowResignDialog(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              disabled={gameState.status === 'checkmate'}
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
    </div>
  );
};