import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Piece, PieceType, PieceOwner } from '@/domain/models/Piece';

import { PieceUI } from './PieceUI';

describe('PieceUI', () => {
  describe('駒の表示', () => {
    it('歩兵（先手）を正しく表示する', () => {
      const piece = new Piece(PieceType.PAWN, PieceOwner.SENTE);
      render(<PieceUI piece={piece} />);
      
      const pieceElement = screen.getByText('歩');
      expect(pieceElement).toBeInTheDocument();
    });

    it('飛車（後手）を正しく表示する', () => {
      const piece = new Piece(PieceType.ROOK, PieceOwner.GOTE);
      render(<PieceUI piece={piece} />);
      
      const pieceElement = screen.getByText('飛');
      expect(pieceElement).toBeInTheDocument();
    });

    it('成銀を赤文字で表示する', () => {
      const piece = new Piece(PieceType.SILVER, PieceOwner.SENTE, true);
      render(<PieceUI piece={piece} />);
      
      const pieceElement = screen.getByText('成銀');
      expect(pieceElement).toHaveClass('text-red-600');
    });

    it('龍（成り飛車）を赤文字で表示する', () => {
      const piece = new Piece(PieceType.ROOK, PieceOwner.GOTE, true);
      render(<PieceUI piece={piece} />);
      
      const pieceElement = screen.getByText('龍');
      expect(pieceElement).toHaveClass('text-red-600');
    });
  });

  describe('先手/後手の向き', () => {
    it('先手の駒は上向きで表示される', () => {
      const piece = new Piece(PieceType.KING, PieceOwner.SENTE);
      const { container } = render(<PieceUI piece={piece} />);
      
      const pieceContainer = container.firstChild;
      expect(pieceContainer).not.toHaveClass('rotate-180');
    });

    it('後手の駒は180度回転して表示される', () => {
      const piece = new Piece(PieceType.KING, PieceOwner.GOTE);
      const { container } = render(<PieceUI piece={piece} />);
      
      const pieceContainer = container.firstChild;
      expect(pieceContainer).toHaveClass('rotate-180');
    });
  });

  describe('インタラクション', () => {
    it('ホバー時にスケールアップする', () => {
      const piece = new Piece(PieceType.GOLD, PieceOwner.SENTE);
      const { container } = render(<PieceUI piece={piece} />);
      
      const pieceContainer = container.firstChild;
      expect(pieceContainer).toHaveClass('hover:scale-110');
    });

    it('ドラッグ可能な属性を持つ', () => {
      const piece = new Piece(PieceType.BISHOP, PieceOwner.SENTE);
      const { container } = render(<PieceUI piece={piece} />);
      
      const pieceContainer = container.firstChild as HTMLElement;
      expect(pieceContainer.dataset.pieceType).toBe(PieceType.BISHOP);
      expect(pieceContainer.dataset.pieceOwner).toBe(PieceOwner.SENTE);
      expect(pieceContainer.dataset.isPromoted).toBe('false');
    });
  });

  describe('レスポンシブサイズ', () => {
    it('size propに応じてサイズが変わる', () => {
      const piece = new Piece(PieceType.LANCE, PieceOwner.GOTE);
      
      const { rerender, container } = render(<PieceUI piece={piece} size="sm" />);
      expect(container.firstChild).toHaveClass('w-8', 'h-8', 'text-base');
      
      rerender(<PieceUI piece={piece} size="md" />);
      expect(container.firstChild).toHaveClass('w-10', 'h-10', 'text-lg');
      
      rerender(<PieceUI piece={piece} size="lg" />);
      expect(container.firstChild).toHaveClass('w-12', 'h-12', 'text-xl');
    });

    it('デフォルトサイズはmdである', () => {
      const piece = new Piece(PieceType.KNIGHT, PieceOwner.SENTE);
      const { container } = render(<PieceUI piece={piece} />);
      
      expect(container.firstChild).toHaveClass('w-10', 'h-10', 'text-lg');
    });
  });
});