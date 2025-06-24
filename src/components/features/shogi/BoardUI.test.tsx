import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { CellPosition } from '@/domain/models/position/types';

import { BoardUI, KANJI_NUMBERS } from './BoardUI';

const getCellIndex = (row: number, col: number) => row * 9 + (8 - col);

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
    expect(handleCellClick).toHaveBeenCalledWith({ row: 0, col: 8 });
    
    // 右下のマス（1九）をクリック
    fireEvent.click(cells[80]);
    expect(handleCellClick).toHaveBeenCalledWith({ row: 8, col: 0 });
  });

  it('選択されたマスがハイライトされる', () => {
    render(<BoardUI selectedCell={{ row: 4, col: 4 }} />);
    
    const cells = screen.getAllByRole('button');
    const selectedCellIndex = getCellIndex(4, 4); // 5行5列目
    const selectedCell = cells[selectedCellIndex];
    
    expect(selectedCell).toHaveClass('bg-blue-500');
  });

  it('移動可能なマスがハイライトされる', () => {
    const highlightedCells: CellPosition[] = [
      { row: 3, col: 4 },
      { row: 5, col: 4 }
    ];
    render(<BoardUI highlightedCells={highlightedCells} />);
    
    const cells = screen.getAllByRole('button');
    const firstHighlightedIndex = getCellIndex(
      highlightedCells[0].row,
      highlightedCells[0].col
    );
    const secondHighlightedIndex = getCellIndex(
      highlightedCells[1].row,
      highlightedCells[1].col
    );
    const firstHighlighted = cells[firstHighlightedIndex];
    const secondHighlighted = cells[secondHighlightedIndex];
    
    expect(firstHighlighted).toHaveClass('bg-green-500');
    expect(secondHighlighted).toHaveClass('bg-green-500');
  });

  it('レスポンシブで正方形を保つ', () => {
    const { container } = render(<BoardUI />);
    const board = container.querySelector('.aspect-square');
    expect(board).toBeInTheDocument();
  });
});