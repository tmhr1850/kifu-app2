import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameScreen } from './GameScreen';

// モックの設定
vi.mock('@/usecases/game/usecase', () => ({
  GameUseCase: vi.fn().mockImplementation(() => ({
    initializeGame: vi.fn(),
    getCurrentState: vi.fn(() => ({
      board: {
        getPiece: vi.fn(),
        pieces: [],
      },
      capturedPieces: {
        SENTE: [],
        GOTE: [],
      },
      currentPlayer: 'SENTE',
      isCheck: false,
      isCheckmate: false,
    })),
    getValidMoves: vi.fn(() => []),
    move: vi.fn(),
    dropPiece: vi.fn(),
    resign: vi.fn(),
  })),
}));

describe('GameScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ゲーム画面の基本要素を表示する', () => {
    render(<GameScreen />);

    // 将棋盤が表示される
    expect(screen.getByRole('grid')).toBeInTheDocument();

    // 手番表示がある
    expect(screen.getByText(/先手番/)).toBeInTheDocument();

    // 新規対局ボタンがある
    expect(screen.getByRole('button', { name: /新規対局/ })).toBeInTheDocument();

    // 投了ボタンがある
    expect(screen.getByRole('button', { name: /投了/ })).toBeInTheDocument();
  });

  it('持ち駒エリアを表示する', () => {
    render(<GameScreen />);

    // 先手の持ち駒エリア
    expect(screen.getByTestId('captured-pieces-sente')).toBeInTheDocument();

    // 後手の持ち駒エリア
    expect(screen.getByTestId('captured-pieces-gote')).toBeInTheDocument();
  });

  it('駒をクリックすると移動可能なマスがハイライトされる', async () => {
    const mockGameUseCase = {
      initializeGame: vi.fn(),
      getCurrentState: vi.fn(() => ({
        board: {
          getPiece: vi.fn((pos) => {
            if (pos.row === 6 && pos.col === 4) {
              return {
                type: 'PAWN',
                player: 'SENTE',
                position: { row: 6, col: 4 },
              };
            }
            return null;
          }),
          pieces: [
            {
              type: 'PAWN',
              player: 'SENTE',
              position: { row: 6, col: 4 },
            },
          ],
        },
        capturedPieces: {
          SENTE: [],
          GOTE: [],
        },
        currentPlayer: 'SENTE',
        isCheck: false,
        isCheckmate: false,
      })),
      getValidMoves: vi.fn(() => [{ row: 5, col: 4 }]),
      move: vi.fn(),
      dropPiece: vi.fn(),
      resign: vi.fn(),
    };

    vi.mocked(await import('@/usecases/game/usecase')).GameUseCase.mockImplementation(
      () => mockGameUseCase
    );

    render(<GameScreen />);

    // 駒をクリック
    const pawn = screen.getByLabelText('先手の歩');
    fireEvent.click(pawn);

    // getValidMovesが呼ばれる
    await waitFor(() => {
      expect(mockGameUseCase.getValidMoves).toHaveBeenCalledWith({ row: 6, col: 4 });
    });
  });

  it('王手の時に警告を表示する', async () => {
    const mockGameUseCase = {
      initializeGame: vi.fn(),
      getCurrentState: vi.fn(() => ({
        board: {
          getPiece: vi.fn(),
          pieces: [],
        },
        capturedPieces: {
          SENTE: [],
          GOTE: [],
        },
        currentPlayer: 'SENTE',
        isCheck: true,
        isCheckmate: false,
      })),
      getValidMoves: vi.fn(() => []),
      move: vi.fn(),
      dropPiece: vi.fn(),
      resign: vi.fn(),
    };

    vi.mocked(await import('@/usecases/game/usecase')).GameUseCase.mockImplementation(
      () => mockGameUseCase
    );

    render(<GameScreen />);

    // 王手警告が表示される
    expect(screen.getByText(/王手/)).toBeInTheDocument();
  });

  it('詰みの時にゲーム終了メッセージを表示する', async () => {
    const mockGameUseCase = {
      initializeGame: vi.fn(),
      getCurrentState: vi.fn(() => ({
        board: {
          getPiece: vi.fn(),
          pieces: [],
        },
        capturedPieces: {
          SENTE: [],
          GOTE: [],
        },
        currentPlayer: 'SENTE',
        isCheck: false,
        isCheckmate: true,
      })),
      getValidMoves: vi.fn(() => []),
      move: vi.fn(),
      dropPiece: vi.fn(),
      resign: vi.fn(),
    };

    vi.mocked(await import('@/usecases/game/usecase')).GameUseCase.mockImplementation(
      () => mockGameUseCase
    );

    render(<GameScreen />);

    // 詰みメッセージが表示される
    expect(screen.getByText(/詰み/)).toBeInTheDocument();
    expect(screen.getByText(/後手の勝ち/)).toBeInTheDocument();
  });

  it('新規対局ボタンで新しいゲームを開始する', async () => {
    const mockInitializeGame = vi.fn();
    const mockGameUseCase = {
      initializeGame: mockInitializeGame,
      getCurrentState: vi.fn(() => ({
        board: {
          getPiece: vi.fn(),
          pieces: [],
        },
        capturedPieces: {
          SENTE: [],
          GOTE: [],
        },
        currentPlayer: 'SENTE',
        isCheck: false,
        isCheckmate: false,
      })),
      getValidMoves: vi.fn(() => []),
      move: vi.fn(),
      dropPiece: vi.fn(),
      resign: vi.fn(),
    };

    vi.mocked(await import('@/usecases/game/usecase')).GameUseCase.mockImplementation(
      () => mockGameUseCase
    );

    render(<GameScreen />);

    const newGameButton = screen.getByRole('button', { name: /新規対局/ });
    fireEvent.click(newGameButton);

    await waitFor(() => {
      expect(mockInitializeGame).toHaveBeenCalled();
    });
  });

  it('投了ボタンで確認ダイアログを表示する', () => {
    render(<GameScreen />);

    const resignButton = screen.getByRole('button', { name: /投了/ });
    fireEvent.click(resignButton);

    // 確認ダイアログが表示される
    expect(screen.getByText(/本当に投了しますか/)).toBeInTheDocument();
  });
});