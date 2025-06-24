import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameScreen } from './GameScreen';

// モックの設定
vi.mock('@/usecases/game/usecase', () => ({
  GameUseCase: vi.fn().mockImplementation(() => ({
    startNewGame: vi.fn(() => ({
      board: {},
      currentPlayer: 'SENTE',
      history: [],
      capturedPieces: { sente: [], gote: [] },
      status: 'playing',
      isCheck: false,
    })),
    getGameState: vi.fn(() => ({
      board: {},
      currentPlayer: 'SENTE',
      history: [],
      capturedPieces: { sente: [], gote: [] },
      status: 'playing',
      isCheck: false,
    })),
    movePiece: vi.fn(() => ({ success: true })),
    dropPiece: vi.fn(() => ({ success: true })),
    getLegalMoves: vi.fn(() => []),
    canPromote: vi.fn(() => false),
    resign: vi.fn(),
    getLegalDropPositions: vi.fn(() => []),
    getBoardPieces: vi.fn(() => []),
  })),
}));

describe('GameScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ゲーム画面の基本要素を表示する', () => {
    render(<GameScreen />);

    // 将棋盤が表示される
    expect(screen.getByLabelText('将棋盤 - 矢印キーで移動、EnterまたはSpaceで選択')).toBeInTheDocument();

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
      startNewGame: vi.fn(() => ({
        board: {},
        currentPlayer: 'SENTE',
        history: [],
        capturedPieces: { sente: [], gote: [] },
        status: 'playing',
        isCheck: false,
      })),
      getGameState: vi.fn(() => ({
        board: {},
        currentPlayer: 'SENTE',
        history: [],
        capturedPieces: { sente: [], gote: [] },
        status: 'playing',
        isCheck: false,
      })),
      getBoardPieces: vi.fn(() => [
        {
          piece: {
            type: 'PAWN',
            player: 'SENTE',
            position: { row: 6, column: 4 },
          },
          position: { row: 6, column: 4 },
        },
      ]),
      getLegalMoves: vi.fn(() => [{ row: 5, column: 4 }]),
      movePiece: vi.fn(() => ({ success: true })),
      dropPiece: vi.fn(() => ({ success: true })),
      canPromote: vi.fn(() => false),
      resign: vi.fn(),
      getLegalDropPositions: vi.fn(() => []),
    };

    vi.mocked(await import('@/usecases/game/usecase')).GameUseCase.mockImplementation(
      () => mockGameUseCase
    );

    render(<GameScreen />);

    // 駒をクリック
    const pawn = screen.getByLabelText('先手の歩');
    fireEvent.click(pawn);

    // getLegalMovesが呼ばれる
    await waitFor(() => {
      expect(mockGameUseCase.getLegalMoves).toHaveBeenCalledWith({ row: 6, column: 4 });
    });
  });

  it('王手の時に警告を表示する', async () => {
    const mockGameUseCase = {
      startNewGame: vi.fn(() => ({
        board: {},
        currentPlayer: 'SENTE',
        history: [],
        capturedPieces: { sente: [], gote: [] },
        status: 'playing',
        isCheck: true,
      })),
      getGameState: vi.fn(() => ({
        board: {},
        currentPlayer: 'SENTE',
        history: [],
        capturedPieces: { sente: [], gote: [] },
        status: 'playing',
        isCheck: true,
      })),
      getBoardPieces: vi.fn(() => []),
      getLegalMoves: vi.fn(() => []),
      movePiece: vi.fn(() => ({ success: true })),
      dropPiece: vi.fn(() => ({ success: true })),
      canPromote: vi.fn(() => false),
      resign: vi.fn(),
      getLegalDropPositions: vi.fn(() => []),
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
      startNewGame: vi.fn(() => ({
        board: {},
        currentPlayer: 'SENTE',
        history: [],
        capturedPieces: { sente: [], gote: [] },
        status: 'checkmate',
        isCheck: false,
        winner: 'GOTE',
      })),
      getGameState: vi.fn(() => ({
        board: {},
        currentPlayer: 'SENTE',
        history: [],
        capturedPieces: { sente: [], gote: [] },
        status: 'checkmate',
        isCheck: false,
        winner: 'GOTE',
      })),
      getBoardPieces: vi.fn(() => []),
      getLegalMoves: vi.fn(() => []),
      movePiece: vi.fn(() => ({ success: true })),
      dropPiece: vi.fn(() => ({ success: true })),
      canPromote: vi.fn(() => false),
      resign: vi.fn(),
      getLegalDropPositions: vi.fn(() => []),
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
    const mockStartNewGame = vi.fn(() => ({
      board: {},
      currentPlayer: 'SENTE',
      history: [],
      capturedPieces: { sente: [], gote: [] },
      status: 'playing',
      isCheck: false,
    }));
    const mockGameUseCase = {
      startNewGame: mockStartNewGame,
      getGameState: vi.fn(() => ({
        board: {},
        currentPlayer: 'SENTE',
        history: [],
        capturedPieces: { sente: [], gote: [] },
        status: 'playing',
        isCheck: false,
      })),
      getBoardPieces: vi.fn(() => []),
      getLegalMoves: vi.fn(() => []),
      movePiece: vi.fn(() => ({ success: true })),
      dropPiece: vi.fn(() => ({ success: true })),
      canPromote: vi.fn(() => false),
      resign: vi.fn(),
      getLegalDropPositions: vi.fn(() => []),
    };

    vi.mocked(await import('@/usecases/game/usecase')).GameUseCase.mockImplementation(
      () => mockGameUseCase
    );

    render(<GameScreen />);

    const newGameButton = screen.getByRole('button', { name: /新規対局/ });
    fireEvent.click(newGameButton);

    await waitFor(() => {
      expect(mockStartNewGame).toHaveBeenCalled();
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