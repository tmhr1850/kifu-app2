import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import { createPiece } from '@/domain/models/piece/factory';
import { PieceType, Player } from '@/domain/models/piece/types';

import { PieceUI } from './PieceUI';

describe('PieceUI', () => {
  describe('駒の表示', () => {
    it('王将を正しく表示する', () => {
      const king = createPiece(PieceType.KING, Player.SENTE, null);
      render(<PieceUI piece={king} />);
      
      expect(screen.getByText('王')).toBeInTheDocument();
    });

    it('飛車を正しく表示する', () => {
      const rook = createPiece(PieceType.ROOK, Player.SENTE, null);
      render(<PieceUI piece={rook} />);
      
      expect(screen.getByText('飛')).toBeInTheDocument();
    });

    it('角を正しく表示する', () => {
      const bishop = createPiece(PieceType.BISHOP, Player.SENTE, null);
      render(<PieceUI piece={bishop} />);
      
      expect(screen.getByText('角')).toBeInTheDocument();
    });

    it('金を正しく表示する', () => {
      const gold = createPiece(PieceType.GOLD, Player.SENTE, null);
      render(<PieceUI piece={gold} />);
      
      expect(screen.getByText('金')).toBeInTheDocument();
    });

    it('銀を正しく表示する', () => {
      const silver = createPiece(PieceType.SILVER, Player.SENTE, null);
      render(<PieceUI piece={silver} />);
      
      expect(screen.getByText('銀')).toBeInTheDocument();
    });

    it('桂馬を正しく表示する', () => {
      const knight = createPiece(PieceType.KNIGHT, Player.SENTE, null);
      render(<PieceUI piece={knight} />);
      
      expect(screen.getByText('桂')).toBeInTheDocument();
    });

    it('香車を正しく表示する', () => {
      const lance = createPiece(PieceType.LANCE, Player.SENTE, null);
      render(<PieceUI piece={lance} />);
      
      expect(screen.getByText('香')).toBeInTheDocument();
    });

    it('歩を正しく表示する', () => {
      const pawn = createPiece(PieceType.PAWN, Player.SENTE, null);
      render(<PieceUI piece={pawn} />);
      
      expect(screen.getByText('歩')).toBeInTheDocument();
    });
  });

  describe('成り駒の表示', () => {
    it('竜（成り飛車）を赤文字で表示する', () => {
      const dragon = createPiece(PieceType.DRAGON, Player.SENTE, null);
      render(<PieceUI piece={dragon} />);
      
      const piece = screen.getByText('竜');
      expect(piece).toHaveClass('text-red-600');
    });

    it('馬（成り角）を赤文字で表示する', () => {
      const horse = createPiece(PieceType.HORSE, Player.SENTE, null);
      render(<PieceUI piece={horse} />);
      
      const piece = screen.getByText('馬');
      expect(piece).toHaveClass('text-red-600');
    });

    it('成銀を赤文字で表示する', () => {
      const promotedSilver = createPiece(PieceType.PROMOTED_SILVER, Player.SENTE, null);
      render(<PieceUI piece={promotedSilver} />);
      
      const piece = screen.getByText('全');
      expect(piece).toHaveClass('text-red-600');
    });

    it('成桂を赤文字で表示する', () => {
      const promotedKnight = createPiece(PieceType.PROMOTED_KNIGHT, Player.SENTE, null);
      render(<PieceUI piece={promotedKnight} />);
      
      const piece = screen.getByText('圭');
      expect(piece).toHaveClass('text-red-600');
    });

    it('成香を赤文字で表示する', () => {
      const promotedLance = createPiece(PieceType.PROMOTED_LANCE, Player.SENTE, null);
      render(<PieceUI piece={promotedLance} />);
      
      const piece = screen.getByText('杏');
      expect(piece).toHaveClass('text-red-600');
    });

    it('と金を赤文字で表示する', () => {
      const tokin = createPiece(PieceType.TOKIN, Player.SENTE, null);
      render(<PieceUI piece={tokin} />);
      
      const piece = screen.getByText('と');
      expect(piece).toHaveClass('text-red-600');
    });
  });

  describe('先手/後手の向き', () => {
    it('先手の駒は上向きに表示される', () => {
      const piece = createPiece(PieceType.KING, Player.SENTE, null);
      render(<PieceUI piece={piece} />);
      
      const pieceElement = screen.getByRole('button');
      expect(pieceElement).not.toHaveClass('rotate-180');
    });

    it('後手の駒は180度回転して表示される', () => {
      const piece = createPiece(PieceType.KING, Player.GOTE, null);
      render(<PieceUI piece={piece} />);
      
      const pieceElement = screen.getByRole('button');
      expect(pieceElement).toHaveClass('rotate-180');
    });
  });

  describe('サイズバリエーション', () => {
    it('小サイズで表示できる', () => {
      const piece = createPiece(PieceType.KING, Player.SENTE, null);
      render(<PieceUI piece={piece} size="sm" />);
      
      const pieceElement = screen.getByRole('button');
      expect(pieceElement).toHaveClass('w-8', 'h-8', 'text-sm');
    });

    it('中サイズで表示できる（デフォルト）', () => {
      const piece = createPiece(PieceType.KING, Player.SENTE, null);
      render(<PieceUI piece={piece} />);
      
      const pieceElement = screen.getByRole('button');
      expect(pieceElement).toHaveClass('w-12', 'h-12', 'text-base');
    });

    it('大サイズで表示できる', () => {
      const piece = createPiece(PieceType.KING, Player.SENTE, null);
      render(<PieceUI piece={piece} size="lg" />);
      
      const pieceElement = screen.getByRole('button');
      expect(pieceElement).toHaveClass('w-16', 'h-16', 'text-lg');
    });
  });

  describe('インタラクション', () => {
    it('ホバー時にスケールアップする', async () => {
      const piece = createPiece(PieceType.KING, Player.SENTE, null);
      render(<PieceUI piece={piece} />);
      
      const pieceElement = screen.getByRole('button');
      expect(pieceElement).toHaveClass('hover:scale-110');
    });

    it('クリックイベントが発火する', async () => {
      const piece = createPiece(PieceType.KING, Player.SENTE, null);
      const handleClick = vi.fn();
      render(<PieceUI piece={piece} onClick={handleClick} />);
      
      const pieceElement = screen.getByRole('button');
      await userEvent.click(pieceElement);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(piece);
    });

    it('ドラッグ可能な属性を持つ', () => {
      const piece = createPiece(PieceType.KING, Player.SENTE, null);
      render(<PieceUI piece={piece} />);
      
      const pieceElement = screen.getByRole('button');
      expect(pieceElement).toHaveAttribute('draggable', 'true');
      expect(pieceElement).toHaveAttribute('data-piece-type', PieceType.KING);
      expect(pieceElement).toHaveAttribute('data-player', Player.SENTE);
    });
  });

  describe('カスタムクラス', () => {
    it('カスタムクラスを追加できる', () => {
      const piece = createPiece(PieceType.KING, Player.SENTE, null);
      render(<PieceUI piece={piece} className="custom-class" />);
      
      const pieceElement = screen.getByRole('button');
      expect(pieceElement).toHaveClass('custom-class');
    });
  });
});