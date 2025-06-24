'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GameUseCase } from '@/usecases/game/usecase';
import { BoardUI } from './BoardUI';
import { CapturedPiecesUI } from '@/components/ui/CapturedPiecesUI';
import { IPiece } from '@/domain/models/piece/interface';
import { CellPosition } from '@/domain/models/position/types';
import { Player, PieceType } from '@/domain/models/piece/types';
import { PromotionDialog } from './PromotionDialog';
import { ResignConfirmDialog } from './ResignConfirmDialog';

interface PendingMove {
  from: CellPosition;
  to: CellPosition;
}

// 持ち駒を打てる位置かチェックするヘルパー関数
const isValidDropPosition = (
  pieceType: PieceType,
  position: CellPosition,
  player: Player,
  state: any
): boolean => {
  const { row } = position;
  
  // 先手と後手で制限される段が違う
  if (player === Player.SENTE) {
    // 歩と香車は最後の段（0段目）に打てない
    if ((pieceType === 'PAWN' || pieceType === 'LANCE') && row === 0) {
      return false;
    }
    // 桂馬は最後の2段（0,1段目）に打てない
    if (pieceType === 'KNIGHT' && row <= 1) {
      return false;
    }
  } else {
    // 後手の場合
    // 歩と香車は最後の段（8段目）に打てない
    if ((pieceType === 'PAWN' || pieceType === 'LANCE') && row === 8) {
      return false;
    }
    // 桂馬は最後の2段（7,8段目）に打てない
    if (pieceType === 'KNIGHT' && row >= 7) {
      return false;
    }
  }
  
  // 歩の場合、二歩チェック
  if (pieceType === 'PAWN') {
    for (let r = 0; r < 9; r++) {
      const piece = state.board.getPiece({ row: r, col: position.col });
      if (piece && piece.type === 'PAWN' && piece.player === player && !piece.isPromoted()) {
        return false;
      }
    }
  }
  
  return true;
};

export const GameScreen: React.FC = () => {
  const [gameUseCase] = useState(() => new GameUseCase());
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [selectedCapturedPiece, setSelectedCapturedPiece] = useState<PieceType | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<CellPosition[]>([]);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [showResignDialog, setShowResignDialog] = useState(false);
  const [gameState, setGameState] = useState(gameUseCase.getCurrentState());

  // ゲームの初期化
  useEffect(() => {
    gameUseCase.initializeGame();
    setGameState(gameUseCase.getCurrentState());
  }, [gameUseCase]);

  // 盤面の駒を配列に変換
  const boardPieces = useMemo(() => {
    const pieces: { piece: IPiece; position: CellPosition }[] = [];
    const state = gameState;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = state.board.getPiece({ row, col });
        if (piece) {
          pieces.push({ piece, position: { row, col } });
        }
      }
    }

    return pieces;
  }, [gameState]);

  // セルがクリックされた時の処理
  const handleCellClick = useCallback((position: CellPosition) => {
    const state = gameUseCase.getCurrentState();

    // 持ち駒が選択されている場合
    if (selectedCapturedPiece) {
      if (gameUseCase.dropPiece(selectedCapturedPiece, position)) {
        setSelectedCapturedPiece(null);
        setHighlightedCells([]);
        setGameState(gameUseCase.getCurrentState());
      }
      return;
    }

    // 駒が選択されている場合、移動処理
    if (selectedCell) {
      const from = selectedCell;
      const to = position;

      // 成りが可能かチェック
      const piece = state.board.getPiece(from);
      if (piece && gameUseCase.canPromote(piece, from, to)) {
        setPendingMove({ from, to });
      } else {
        // 通常の移動
        if (gameUseCase.move(from, to)) {
          setGameState(gameUseCase.getCurrentState());
        }
      }

      setSelectedCell(null);
      setHighlightedCells([]);
    }
  }, [selectedCell, selectedCapturedPiece, gameUseCase]);

  // 駒がクリックされた時の処理
  const handlePieceClick = useCallback((piece: IPiece) => {
    const state = gameUseCase.getCurrentState();

    // 自分の駒のみ選択可能
    if (piece.player !== state.currentPlayer) {
      return;
    }

    if (piece.position) {
      setSelectedCell(piece.position);
      setSelectedCapturedPiece(null);
      const validMoves = gameUseCase.getValidMoves(piece.position);
      setHighlightedCells(validMoves);
    }
  }, [gameUseCase]);

  // 持ち駒がクリックされた時の処理
  const handleCapturedPieceClick = useCallback((pieceType: PieceType, player: Player) => {
    const state = gameUseCase.getCurrentState();

    // 自分の持ち駒のみ選択可能
    if (player !== state.currentPlayer) {
      return;
    }

    setSelectedCapturedPiece(pieceType);
    setSelectedCell(null);
    
    // 打てる場所を計算（空いているマスで、打てる条件を満たす場所）
    const validDropPositions: CellPosition[] = [];
    const state = gameUseCase.getCurrentState();
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const position = { row, col };
        // 空いているマスかチェック
        if (!state.board.getPiece(position)) {
          // その場所に打てるかチェック（dropPieceの内部ロジックと同じ）
          if (isValidDropPosition(pieceType, position, player, state)) {
            validDropPositions.push(position);
          }
        }
      }
    }
    
    setHighlightedCells(validDropPositions);
  }, [gameUseCase]);

  // 成り選択の処理
  const handlePromotionChoice = useCallback((promote: boolean) => {
    if (pendingMove) {
      gameUseCase.move(pendingMove.from, pendingMove.to, promote);
      setGameState(gameUseCase.getCurrentState());
      setPendingMove(null);
    }
  }, [pendingMove, gameUseCase]);

  // 新規対局
  const handleNewGame = useCallback(() => {
    gameUseCase.initializeGame();
    setGameState(gameUseCase.getCurrentState());
    setSelectedCell(null);
    setSelectedCapturedPiece(null);
    setHighlightedCells([]);
  }, [gameUseCase]);

  // 投了
  const handleResign = useCallback(() => {
    gameUseCase.resign();
    setGameState(gameUseCase.getCurrentState());
    setShowResignDialog(false);
  }, [gameUseCase]);

  const currentPlayerText = gameState.currentPlayer === Player.SENTE ? '先手番' : '後手番';
  const winnerText = gameState.isCheckmate
    ? gameState.currentPlayer === Player.SENTE
      ? '後手の勝ち'
      : '先手の勝ち'
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
              {gameState.isCheck && !gameState.isCheckmate && (
                <span className="text-red-600 font-bold">王手！</span>
              )}
              {gameState.isCheckmate && (
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
                pieces={gameState.capturedPieces.GOTE}
                player={Player.GOTE}
                currentPlayer={gameState.currentPlayer}
                onPieceClick={handleCapturedPieceClick}
                selectedPieceType={
                  gameState.currentPlayer === Player.GOTE ? selectedCapturedPiece : null
                }
              />
            </div>

            {/* 将棋盤 */}
            <div className="order-1 lg:order-2" role="grid">
              <BoardUI
                pieces={boardPieces}
                selectedCell={selectedCell}
                highlightedCells={highlightedCells}
                onCellClick={handleCellClick}
                onPieceClick={handlePieceClick}
              />
            </div>

            {/* 先手の持ち駒 */}
            <div data-testid="captured-pieces-sente" className="order-3">
              <h2 className="text-lg font-semibold mb-2">先手の持ち駒</h2>
              <CapturedPiecesUI
                pieces={gameState.capturedPieces.SENTE}
                player={Player.SENTE}
                currentPlayer={gameState.currentPlayer}
                onPieceClick={handleCapturedPieceClick}
                selectedPieceType={
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
              disabled={gameState.isCheckmate}
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