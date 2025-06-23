import { Board } from './Board';
import { Piece, PieceType, Player } from './Piece';

describe('Board', () => {
  describe('constructor', () => {
    it('should create an empty 9x9 board', () => {
      const board = new Board();
      
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          expect(board.getPiece(row, col)).toBeNull();
        }
      }
    });
  });

  describe('setInitialPosition', () => {
    it('should set up the initial shogi board position', () => {
      const board = new Board();
      board.setInitialPosition();

      // 後手（上手）の駒配置確認
      // 1段目
      expect(board.getPiece(0, 0)?.type).toBe(PieceType.KYOSHA);
      expect(board.getPiece(0, 0)?.player).toBe(Player.GOTE);
      expect(board.getPiece(0, 1)?.type).toBe(PieceType.KEIMA);
      expect(board.getPiece(0, 2)?.type).toBe(PieceType.GIN);
      expect(board.getPiece(0, 3)?.type).toBe(PieceType.KIN);
      expect(board.getPiece(0, 4)?.type).toBe(PieceType.GYOKU);
      expect(board.getPiece(0, 5)?.type).toBe(PieceType.KIN);
      expect(board.getPiece(0, 6)?.type).toBe(PieceType.GIN);
      expect(board.getPiece(0, 7)?.type).toBe(PieceType.KEIMA);
      expect(board.getPiece(0, 8)?.type).toBe(PieceType.KYOSHA);
      
      // 2段目
      expect(board.getPiece(1, 1)?.type).toBe(PieceType.HISHA);
      expect(board.getPiece(1, 7)?.type).toBe(PieceType.KAKU);
      
      // 3段目（歩）
      for (let col = 0; col < 9; col++) {
        expect(board.getPiece(2, col)?.type).toBe(PieceType.FU);
        expect(board.getPiece(2, col)?.player).toBe(Player.GOTE);
      }
      
      // 中央（4-6段目）は空
      for (let row = 3; row < 6; row++) {
        for (let col = 0; col < 9; col++) {
          expect(board.getPiece(row, col)).toBeNull();
        }
      }
      
      // 先手（下手）の駒配置確認
      // 7段目（歩）
      for (let col = 0; col < 9; col++) {
        expect(board.getPiece(6, col)?.type).toBe(PieceType.FU);
        expect(board.getPiece(6, col)?.player).toBe(Player.SENTE);
      }
      
      // 8段目
      expect(board.getPiece(7, 1)?.type).toBe(PieceType.KAKU);
      expect(board.getPiece(7, 7)?.type).toBe(PieceType.HISHA);
      
      // 9段目
      expect(board.getPiece(8, 0)?.type).toBe(PieceType.KYOSHA);
      expect(board.getPiece(8, 0)?.player).toBe(Player.SENTE);
      expect(board.getPiece(8, 1)?.type).toBe(PieceType.KEIMA);
      expect(board.getPiece(8, 2)?.type).toBe(PieceType.GIN);
      expect(board.getPiece(8, 3)?.type).toBe(PieceType.KIN);
      expect(board.getPiece(8, 4)?.type).toBe(PieceType.OU);
      expect(board.getPiece(8, 5)?.type).toBe(PieceType.KIN);
      expect(board.getPiece(8, 6)?.type).toBe(PieceType.GIN);
      expect(board.getPiece(8, 7)?.type).toBe(PieceType.KEIMA);
      expect(board.getPiece(8, 8)?.type).toBe(PieceType.KYOSHA);
    });
  });

  describe('placePiece', () => {
    it('should place a piece on the board', () => {
      const board = new Board();
      const piece = new Piece(PieceType.FU, Player.SENTE);
      
      board.placePiece(4, 4, piece);
      
      expect(board.getPiece(4, 4)).toBe(piece);
    });
    
    it('should throw error for invalid coordinates', () => {
      const board = new Board();
      const piece = new Piece(PieceType.FU, Player.SENTE);
      
      expect(() => board.placePiece(-1, 0, piece)).toThrow();
      expect(() => board.placePiece(0, 9, piece)).toThrow();
      expect(() => board.placePiece(9, 0, piece)).toThrow();
    });
  });

  describe('removePiece', () => {
    it('should remove a piece from the board', () => {
      const board = new Board();
      const piece = new Piece(PieceType.FU, Player.SENTE);
      
      board.placePiece(4, 4, piece);
      const removed = board.removePiece(4, 4);
      
      expect(removed).toBe(piece);
      expect(board.getPiece(4, 4)).toBeNull();
    });
    
    it('should return null when removing from empty square', () => {
      const board = new Board();
      
      const removed = board.removePiece(4, 4);
      
      expect(removed).toBeNull();
    });
  });

  describe('movePiece', () => {
    it('should move a piece from one position to another', () => {
      const board = new Board();
      const piece = new Piece(PieceType.FU, Player.SENTE);
      
      board.placePiece(6, 4, piece);
      board.movePiece(6, 4, 5, 4);
      
      expect(board.getPiece(6, 4)).toBeNull();
      expect(board.getPiece(5, 4)).toBe(piece);
    });
    
    it('should capture opponent piece when moving', () => {
      const board = new Board();
      const sentePiece = new Piece(PieceType.FU, Player.SENTE);
      const gotePiece = new Piece(PieceType.FU, Player.GOTE);
      
      board.placePiece(6, 4, sentePiece);
      board.placePiece(5, 4, gotePiece);
      
      const captured = board.movePiece(6, 4, 5, 4);
      
      expect(captured).toBe(gotePiece);
      expect(board.getPiece(5, 4)).toBe(sentePiece);
    });
    
    it('should throw error when no piece at source position', () => {
      const board = new Board();
      
      expect(() => board.movePiece(4, 4, 5, 4)).toThrow();
    });
  });

  describe('capturedPieces', () => {
    it('should manage captured pieces for both players', () => {
      const board = new Board();
      
      expect(board.getCapturedPieces(Player.SENTE)).toEqual({});
      expect(board.getCapturedPieces(Player.GOTE)).toEqual({});
      
      board.addCapturedPiece(Player.SENTE, PieceType.FU);
      board.addCapturedPiece(Player.SENTE, PieceType.FU);
      board.addCapturedPiece(Player.SENTE, PieceType.KAKU);
      board.addCapturedPiece(Player.GOTE, PieceType.GIN);
      
      expect(board.getCapturedPieces(Player.SENTE)).toEqual({
        [PieceType.FU]: 2,
        [PieceType.KAKU]: 1
      });
      expect(board.getCapturedPieces(Player.GOTE)).toEqual({
        [PieceType.GIN]: 1
      });
    });
    
    it('should remove captured piece when used', () => {
      const board = new Board();
      
      board.addCapturedPiece(Player.SENTE, PieceType.FU);
      board.addCapturedPiece(Player.SENTE, PieceType.FU);
      
      expect(board.useCapturedPiece(Player.SENTE, PieceType.FU)).toBe(true);
      expect(board.getCapturedPieces(Player.SENTE)).toEqual({
        [PieceType.FU]: 1
      });
      
      expect(board.useCapturedPiece(Player.SENTE, PieceType.FU)).toBe(true);
      expect(board.getCapturedPieces(Player.SENTE)).toEqual({});
      
      expect(board.useCapturedPiece(Player.SENTE, PieceType.FU)).toBe(false);
    });
  });

  describe('copy', () => {
    it('should create an immutable copy of the board', () => {
      const board = new Board();
      board.setInitialPosition();
      board.addCapturedPiece(Player.SENTE, PieceType.FU);
      
      const copy = board.copy();
      
      // 元の盤面と同じ状態であることを確認
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const original = board.getPiece(row, col);
          const copied = copy.getPiece(row, col);
          
          if (original) {
            expect(copied?.type).toBe(original.type);
            expect(copied?.player).toBe(original.player);
          } else {
            expect(copied).toBeNull();
          }
        }
      }
      
      expect(copy.getCapturedPieces(Player.SENTE)).toEqual({
        [PieceType.FU]: 1
      });
      
      // コピーを変更しても元の盤面に影響しないことを確認
      copy.movePiece(6, 4, 5, 4);
      expect(board.getPiece(6, 4)).not.toBeNull();
      expect(board.getPiece(5, 4)).toBeNull();
    });
  });

  describe('coordinate conversion', () => {
    it('should convert between array index and shogi notation', () => {
      expect(Board.toShogiNotation(0, 0)).toBe('9一');
      expect(Board.toShogiNotation(0, 8)).toBe('1一');
      expect(Board.toShogiNotation(8, 0)).toBe('9九');
      expect(Board.toShogiNotation(8, 8)).toBe('1九');
      expect(Board.toShogiNotation(4, 4)).toBe('5五');
    });
    
    it('should convert from shogi notation to array index', () => {
      expect(Board.fromShogiNotation('9一')).toEqual({ row: 0, col: 0 });
      expect(Board.fromShogiNotation('1一')).toEqual({ row: 0, col: 8 });
      expect(Board.fromShogiNotation('9九')).toEqual({ row: 8, col: 0 });
      expect(Board.fromShogiNotation('1九')).toEqual({ row: 8, col: 8 });
      expect(Board.fromShogiNotation('5五')).toEqual({ row: 4, col: 4 });
    });
    
    it('should handle full-width numbers in shogi notation', () => {
      expect(Board.fromShogiNotation('５五')).toEqual({ row: 4, col: 4 });
      expect(Board.fromShogiNotation('１一')).toEqual({ row: 0, col: 8 });
    });
    
    it('should throw error for invalid shogi notation', () => {
      expect(() => Board.fromShogiNotation('0一')).toThrow();
      expect(() => Board.fromShogiNotation('10一')).toThrow();
      expect(() => Board.fromShogiNotation('5十')).toThrow();
      expect(() => Board.fromShogiNotation('5')).toThrow();
      expect(() => Board.fromShogiNotation('')).toThrow();
    });
  });
});