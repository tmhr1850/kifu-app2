import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameScreen } from './GameScreen';

// モックの設定
vi.mock('@/usecases/gamemanager', () => {
  const mockGameManager = {
    getState: vi.fn(() => ({
      gameState: {
        board: {
          getPiece: vi.fn(() => null),
        },
        currentPlayer: 'SENTE',
        history: [],
        capturedPieces: { sente: [], gote: [] },
        status: 'playing',
        isCheck: false,
      },
      isAIThinking: false,
      playerColor: 'SENTE',
      aiColor: 'GOTE',
    })),
    startNewGame: vi.fn().mockResolvedValue({
      gameState: {
        board: {
          getPiece: vi.fn(() => null),
        },
        currentPlayer: 'SENTE',
        history: [],
        capturedPieces: { sente: [], gote: [] },
        status: 'playing',
        isCheck: false,
      },
      isAIThinking: false,
      playerColor: 'SENTE',
      aiColor: 'GOTE',
    }),
    loadGame: vi.fn().mockResolvedValue(null),
    movePiece: vi.fn().mockResolvedValue({ gameState: {}, isAIThinking: false, playerColor: 'SENTE', aiColor: 'GOTE' }),
    dropPiece: vi.fn().mockResolvedValue({ gameState: {}, isAIThinking: false, playerColor: 'SENTE', aiColor: 'GOTE' }),
    getBoardPiecesWithUIPositions: vi.fn(() => [
      // テスト用の駒データ（初期配置の一部）
      { piece: { type: 'KING', player: 'SENTE', isPromoted: () => false }, position: { row: 9, column: 5 } },
      { piece: { type: 'PAWN', player: 'SENTE', isPromoted: () => false }, position: { row: 7, column: 1 } },
      { piece: { type: 'PAWN', player: 'SENTE', isPromoted: () => false }, position: { row: 7, column: 2 } },
      { piece: { type: 'KING', player: 'GOTE', isPromoted: () => false }, position: { row: 1, column: 5 } },
      { piece: { type: 'PAWN', player: 'GOTE', isPromoted: () => false }, position: { row: 3, column: 1 } },
    ]),
    getBoardPieces: vi.fn(() => [
      // テスト用の駒データ（初期配置の一部）
      { piece: { type: 'KING', player: 'SENTE', isPromoted: () => false }, position: { row: 9, column: 5 } },
      { piece: { type: 'PAWN', player: 'SENTE', isPromoted: () => false }, position: { row: 7, column: 1 } },
      { piece: { type: 'PAWN', player: 'SENTE', isPromoted: () => false }, position: { row: 7, column: 2 } },
      { piece: { type: 'KING', player: 'GOTE', isPromoted: () => false }, position: { row: 1, column: 5 } },
      { piece: { type: 'PAWN', player: 'GOTE', isPromoted: () => false }, position: { row: 3, column: 1 } },
    ]),
    getUIBoardState: vi.fn(() => [
      // テスト用の駒データ（初期配置の一部）
      { piece: { type: 'KING', player: 'SENTE', isPromoted: () => false }, position: { row: 9, column: 5 } },
      { piece: { type: 'PAWN', player: 'SENTE', isPromoted: () => false }, position: { row: 7, column: 1 } },
      { piece: { type: 'PAWN', player: 'SENTE', isPromoted: () => false }, position: { row: 7, column: 2 } },
      { piece: { type: 'KING', player: 'GOTE', isPromoted: () => false }, position: { row: 1, column: 5 } },
      { piece: { type: 'PAWN', player: 'GOTE', isPromoted: () => false }, position: { row: 3, column: 1 } },
    ]),
    getLegalMoves: vi.fn(() => []),
    canPromote: vi.fn(() => false),
    resign: vi.fn().mockResolvedValue({ gameState: {}, isAIThinking: false, playerColor: 'SENTE', aiColor: 'GOTE' }),
    getLegalDropPositions: vi.fn(() => []),
    clearSavedGame: vi.fn(),
  };

  return {
    GameManager: vi.fn().mockImplementation(() => mockGameManager),
  };
});

describe('GameScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ゲーム画面の基本要素を表示する', () => {
    render(<GameScreen />);

    // 将棋盤が表示される
    expect(screen.getByLabelText('将棋盤')).toBeInTheDocument();

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

  it('盤上の駒が正しく表示される', () => {
    render(<GameScreen />);
    // モックで設定した駒が表示されているか確認
    expect(screen.getByLabelText(/先手の王/)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/先手の歩/)).toHaveLength(2);
    expect(screen.getByLabelText(/後手の王/)).toBeInTheDocument();
    expect(screen.getByLabelText(/後手の歩/)).toBeInTheDocument();
  });

  it('持ち駒が正しく表示される', async () => {
    const { GameManager } = await import('@/usecases/gamemanager');
    const mockGameManager = new GameManager();
    // 持ち駒がある状態をモック
    mockGameManager.getState.mockReturnValue({
      gameState: {
        board: {
          getPiece: vi.fn(() => null),
        },
        currentPlayer: 'SENTE',
        history: [],
        capturedPieces: {
          sente: [{ type: 'PAWN', player: 'SENTE' }],
          gote: [{ type: 'ROOK', player: 'GOTE' }],
        },
        status: 'playing',
        isCheck: false,
      },
      isAIThinking: false,
      playerColor: 'SENTE',
      aiColor: 'GOTE',
    });

    render(<GameScreen />);

    // 先手の持ち駒に歩があるか
    await waitFor(() => {
      const senteArea = screen.getByTestId('captured-pieces-sente');
      expect(within(senteArea).getByLabelText(/歩/)).toBeInTheDocument();
    });

    // 後手の持ち駒に飛車があるか
    await waitFor(() => {
      const goteArea = screen.getByTestId('captured-pieces-gote');
      expect(within(goteArea).getByLabelText(/飛車/)).toBeInTheDocument();
    });
  });

  it.skip('駒をクリックすると移動可能なマスがハイライトされる', async () => {
    // ...
  });

  it.skip('王手の時に警告を表示する', async () => {
    // ...
  });

  it.skip('詰みの時にゲーム終了メッセージを表示する', async () => {
    // ...
  });

  it.skip('新規対局ボタンで新しいゲームを開始する', async () => {
    const { GameManager } = await import('@/usecases/gamemanager');
    const mockGameManager = new GameManager();

    render(<GameScreen />);

    const newGameButton = screen.getByRole('button', { name: /新規対局/ });
    fireEvent.click(newGameButton);

    await waitFor(() => {
      expect(mockGameManager.startNewGame).toHaveBeenCalled();
    });
  });

  it.skip('投了ボタンでダイアログを表示し、確認すると投了する', async () => {
    const { GameManager } = await import('@/usecases/gamemanager');
    const mockGameManager = new GameManager();

    render(<GameScreen />);

    // 投了ボタンをクリック
    const resignButton = screen.getByRole('button', { name: /投了/ });
    fireEvent.click(resignButton);

    // ダイアログが表示される
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('本当に投了しますか？')).toBeInTheDocument();

    // 「はい」ボタンをクリック
    const confirmButton = screen.getByRole('button', { name: 'はい' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockGameManager.resign).toHaveBeenCalled();
    });
  });
});