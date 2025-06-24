import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { PieceType, Player } from '@/domain/models/piece/types';

import { BoardUI } from './BoardUI';
import { KANJI_NUMBERS } from './BoardCell';

const getCellIndex = (row: number, col: number) => (row - 1) * 9 + (9 - col);

describe('BoardUI', () => {
  it('将棋盤を9×9のグリッドで描画する', () => {
    render(<BoardUI />);
    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(81); // 9×9 = 81マス
  });

  it('横座標（1-9）を表示する', () => {
    render(<BoardUI />);
    for (let i = 1; i <= 9; i++) {
      const coords = screen.getAllByText(i.toString());
      expect(coords.length).toBeGreaterThan(0);
    }
  });

  it('縦座標（一-九）を表示する', () => {
    render(<BoardUI />);
    KANJI_NUMBERS.forEach(kanji => {
      const coords = screen.getAllByText(kanji);
      expect(coords.length).toBeGreaterThan(0);
    });
  });

  it('マスをクリックするとonCellClickが呼ばれる', () => {
    const handleCellClick = vi.fn();
    render(<BoardUI onCellClick={handleCellClick} />);
    
    const cells = screen.getAllByRole('button');
    
    // 左上のマス（9一）をクリック
    fireEvent.click(cells[0]);
    expect(handleCellClick).toHaveBeenCalledWith({ row: 1, column: 9 });
    
    // 右下のマス（1九）をクリック
    fireEvent.click(cells[80]);
    expect(handleCellClick).toHaveBeenCalledWith({ row: 9, column: 1 });
  });

  it('選択されたマスがハイライトされる', () => {
    render(<BoardUI selectedCell={{ row: 4, column: 4 }} />);
    
    const cells = screen.getAllByRole('button');
    const selectedCellIndex = getCellIndex(4, 4); // 5行5列目
    const selectedCellButton = cells[selectedCellIndex];
    const selectedCellDiv = selectedCellButton.parentElement;
    
    expect(selectedCellDiv).toHaveClass('bg-blue-500');
  });

  it('移動可能なマスがハイライトされる', () => {
    const highlightedCells = [
      { row: 3, column: 4 },
      { row: 5, column: 4 }
    ];
    render(<BoardUI highlightedCells={highlightedCells} />);
    
    const cells = screen.getAllByRole('button');
    const firstHighlightedIndex = getCellIndex(
      highlightedCells[0].row,
      highlightedCells[0].column
    );
    const secondHighlightedIndex = getCellIndex(
      highlightedCells[1].row,
      highlightedCells[1].column
    );
    const firstHighlightedButton = cells[firstHighlightedIndex];
    const secondHighlightedButton = cells[secondHighlightedIndex];
    const firstHighlightedDiv = firstHighlightedButton.parentElement;
    const secondHighlightedDiv = secondHighlightedButton.parentElement;
    
    expect(firstHighlightedDiv).toHaveClass('bg-green-500');
    expect(secondHighlightedDiv).toHaveClass('bg-green-500');
  });

  it('レスポンシブで正方形を保つ', () => {
    const { container } = render(<BoardUI />);
    const board = container.querySelector('.aspect-square');
    expect(board).toBeInTheDocument();
  });

  it('駒を正しい位置に表示する', () => {
    const pieces = [
      {
        piece: {
          type: PieceType.PAWN,
          player: Player.SENTE,
          position: { row: 6, column: 4 },
          getValidMoves: vi.fn(),
          promote: vi.fn(),
          clone: vi.fn(),
          equals: vi.fn(),
          isPromoted: vi.fn(() => false),
        },
        position: { row: 6, column: 4 },
      },
      {
        piece: {
          type: PieceType.KING,
          player: Player.GOTE,
          position: { row: 1, column: 5 },
          getValidMoves: vi.fn(),
          promote: vi.fn(),
          clone: vi.fn(),
          equals: vi.fn(),
          isPromoted: vi.fn(() => false),
        },
        position: { row: 1, column: 5 },
      },
    ];

    render(<BoardUI pieces={pieces} />);

    // 先手の歩があることを確認
    expect(screen.getByLabelText('先手の歩')).toBeInTheDocument();
    
    // 後手の王があることを確認
    expect(screen.getByLabelText('後手の王')).toBeInTheDocument();
  });

  it('駒をクリックするとonPieceClickが呼ばれる', () => {
    const handlePieceClick = vi.fn();
    const piece = {
      type: PieceType.PAWN,
      player: Player.SENTE,
      position: { row: 6, column: 4 },
      getValidMoves: vi.fn(),
      promote: vi.fn(),
      clone: vi.fn(),
      equals: vi.fn(),
      isPromoted: vi.fn(() => false),
    };
    const pieces = [{ piece, position: { row: 6, column: 4 } }];

    render(<BoardUI pieces={pieces} onPieceClick={handlePieceClick} />);

    const pawnElement = screen.getByLabelText('先手の歩');
    fireEvent.click(pawnElement);

    expect(handlePieceClick).toHaveBeenCalledWith(piece);
  });
});