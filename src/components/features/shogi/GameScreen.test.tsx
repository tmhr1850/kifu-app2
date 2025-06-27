import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameScreen } from './GameScreen';

// モックの設定
const mockGameManager = {
  getState: vi.fn(),
  startNewGame: vi.fn(),
  loadGame: vi.fn(),
  movePiece: vi.fn(),
  dropPiece: vi.fn(),
  getBoardPieces: vi.fn(),
  getLegalMoves: vi.fn(),
  canPromote: vi.fn(),
  resign: vi.fn(),
  getLegalDropPositions: vi.fn(),
  clearSavedGame: vi.fn(),
  subscribe: vi.fn(() => () => {}), // subscribeのモックを追加
};

vi.mock('@/hooks/useGameManager', () => ({
  useGameManager: () => ({
    getGameManager: () => mockGameManager,
  }),
}));

describe('GameScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // デフォルトの状態を定義
    const defaultState = {
      gameState: {
        board: {
          getPiece: vi.fn(() => null),
        },
        currentPlayer: 'SENTE',
        history: [],
        capturedPieces: {
          sente: [],
          gote: [],
        },
        status: 'playing',
        isCheck: false,
      },
      isAIThinking: false,
      playerColor: 'SENTE',
      aiColor: 'GOTE',
    };

    // デフォルトのmockGameManagerの状態を設定
    mockGameManager.getState.mockReturnValue(defaultState);
    
    // loadGameは保存されたゲームがないことをシミュレート（初期化時に新規ゲーム開始）
    mockGameManager.loadGame.mockResolvedValue(null);
    
    // startNewGameは新しいゲーム状態を返す
    mockGameManager.startNewGame.mockResolvedValue(defaultState);

    mockGameManager.getBoardPieces.mockReturnValue([
      {
        piece: {
          type: 'KING',
          player: 'SENTE',
          position: { row: 9, column: 5 },
        },
        position: { row: 9, column: 5 },
      },
      {
        piece: {
          type: 'PAWN',
          player: 'SENTE',
          position: { row: 7, column: 1 },
        },
        position: { row: 7, column: 1 },
      },
      {
        piece: {
          type: 'PAWN',
          player: 'SENTE',
          position: { row: 7, column: 2 },
        },
        position: { row: 7, column: 2 },
      },
      {
        piece: {
          type: 'KING',
          player: 'GOTE',
          position: { row: 1, column: 5 },
        },
        position: { row: 1, column: 5 },
      },
      {
        piece: {
          type: 'PAWN',
          player: 'GOTE',
          position: { row: 3, column: 1 },
        },
        position: { row: 3, column: 1 },
      },
    ]);
  });

  it('ゲーム画面の基本要素を表示する', async () => {
    render(<GameScreen />);

    // GameScreenの初期化が完了するまで待機
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // 将棋盤が表示される
    expect(screen.getByLabelText('将棋盤')).toBeInTheDocument();

    // 手番表示がある
    expect(screen.getByText(/先手番/)).toBeInTheDocument();

    // 新規対局ボタンがある
    expect(screen.getByRole('button', { name: /新規対局/ })).toBeInTheDocument();

    // 投了ボタンがある
    expect(screen.getByRole('button', { name: /投了/ })).toBeInTheDocument();
  });

  it('持ち駒エリアを表示する', async () => {
    render(<GameScreen />);

    // GameScreenの初期化が完了するまで待機
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // 先手の持ち駒エリア
    expect(screen.getByTestId('captured-pieces-sente')).toBeInTheDocument();

    // 後手の持ち駒エリア
    expect(screen.getByTestId('captured-pieces-gote')).toBeInTheDocument();
  });

  it('盤上の駒が正しく表示される', async () => {
    render(<GameScreen />);

    // GameScreenの初期化が完了するまで待機
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // モックで設定した駒が表示されているか確認
    expect(screen.getByLabelText(/先手の王/)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/先手の歩/)).toHaveLength(2);
    expect(screen.getByLabelText(/後手の王/)).toBeInTheDocument();
    expect(screen.getByLabelText(/後手の歩/)).toBeInTheDocument();
  });

  it('持ち駒が正しく表示される', async () => {
    // 持ち駒がある状態をモック
    const stateWithCapturedPieces = {
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
    };
    
    mockGameManager.getState.mockReturnValue(stateWithCapturedPieces);
    // 初期化時のモック設定も必要
    mockGameManager.loadGame.mockResolvedValue(null);
    mockGameManager.startNewGame.mockResolvedValue(stateWithCapturedPieces);

    render(<GameScreen />);

    // GameScreenの初期化が完了するまで待機（Loading状態が終わるまで）
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // 先手の持ち駒に歩があるか
    await waitFor(() => {
      const senteArea = screen.getByTestId('captured-pieces-sente');
      expect(within(senteArea).getByLabelText(/歩/)).toBeInTheDocument();
    });

    // 後手の持ち駒に飛車があるか（表示は省略形の「飛」）
    await waitFor(() => {
      const goteArea = screen.getByTestId('captured-pieces-gote');
      expect(within(goteArea).getByLabelText(/飛/)).toBeInTheDocument();
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