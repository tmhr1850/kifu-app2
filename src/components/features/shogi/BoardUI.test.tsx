import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { PieceType, Player } from '@/domain/models/piece/types';

import { KANJI_NUMBERS } from './BoardCell';
import { BoardUI } from './BoardUI';

const getCellIndex = (row: number, col: number, size: number) => (row - 1) * size + (size - col);

describe('BoardUI', () => {
  it('将棋盤を9×9のグリッドで描画する', () => {
    render(<BoardUI size={9} />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(81); // 9×9 = 81マス
  });

  it('3x3の盤を描画できる', () => {
    render(<BoardUI size={3} />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(9); // 3x3 = 9マス
  });

  it('横座標（1-9）を表示する', () => {
    render(<BoardUI size={9} />);
    for (let i = 1; i <= 9; i++) {
      const coords = screen.getAllByText(i.toString());
      expect(coords.length).toBeGreaterThan(0);
    }
  });

  it('縦座標（一-九）を表示する', () => {
    render(<BoardUI size={9} />);
    KANJI_NUMBERS.forEach(kanji => {
      const coords = screen.getAllByText(kanji);
      expect(coords.length).toBeGreaterThan(0);
    });
  });

  it('マスをクリックするとonCellClickが呼ばれる', () => {
    const handleCellClick = vi.fn();
    render(<BoardUI onCellClick={handleCellClick} size={9} />);
    
    const cells = screen.getAllByRole('gridcell');
    
    // 左上のマス（9一）をクリック
    fireEvent.click(cells[0]);
    expect(handleCellClick).toHaveBeenCalledWith({ row: 1, column: 9 });
    
    // 右下のマス（1九）をクリック
    fireEvent.click(cells[80]);
    expect(handleCellClick).toHaveBeenCalledWith({ row: 9, column: 1 });
  });

  it('選択されたマスがハイライトされる', () => {
    render(<BoardUI selectedCell={{ row: 4, column: 4 }} size={9} />);
    
    const cells = screen.getAllByRole('gridcell');
    const selectedCellIndex = getCellIndex(4, 4, 9); // 5行5列目
    const selectedCellDiv = cells[selectedCellIndex];
    
    expect(selectedCellDiv).toHaveClass('bg-blue-500');
  });

  it('移動可能なマスがハイライトされる', () => {
    const highlightedCells = [
      { row: 3, column: 4 },
      { row: 5, column: 4 }
    ];
    render(<BoardUI highlightedCells={highlightedCells} size={9} />);
    
    const cells = screen.getAllByRole('gridcell');
    const firstHighlightedIndex = getCellIndex(
      highlightedCells[0].row,
      highlightedCells[0].column,
      9
    );
    const secondHighlightedIndex = getCellIndex(
      highlightedCells[1].row,
      highlightedCells[1].column,
      9
    );
    const firstHighlightedDiv = cells[firstHighlightedIndex];
    const secondHighlightedDiv = cells[secondHighlightedIndex];
    
    expect(firstHighlightedDiv).toHaveClass('bg-green-500');
    expect(secondHighlightedDiv).toHaveClass('bg-green-500');
  });

  it('デフォルトの盤のサイズが9x9である', () => {
    render(<BoardUI />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(81);
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

    render(<BoardUI pieces={pieces} size={9} />);

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

    render(<BoardUI pieces={pieces} onPieceClick={handlePieceClick} size={9} />);

    const pawnElement = screen.getByLabelText('先手の歩');
    fireEvent.click(pawnElement);

    expect(handlePieceClick).toHaveBeenCalledWith(piece);
  });
});