import { describe, it, expect } from 'vitest';

import { Position } from './position';

describe('Position', () => {
  describe('constructor', () => {
    it('should create a position with valid row and column', () => {
      const position = new Position(0, 0);
      expect(position.row).toBe(0);
      expect(position.column).toBe(0);
    });

    it('should create a position with valid boundary values', () => {
      expect(() => new Position(0, 0)).not.toThrow();
      expect(() => new Position(0, 8)).not.toThrow();
      expect(() => new Position(8, 0)).not.toThrow();
      expect(() => new Position(8, 8)).not.toThrow();
      expect(() => new Position(4, 4)).not.toThrow();
    });

    it('should throw an error if row is a negative value', () => {
      expect(() => new Position(-1, 0)).toThrow('Invalid position: row must be between 0 and 8');
    });

    it('should throw an error if row is 9 or more', () => {
      expect(() => new Position(9, 0)).toThrow('Invalid position: row must be between 0 and 8');
      expect(() => new Position(10, 0)).toThrow('Invalid position: row must be between 0 and 8');
    });

    it('should throw an error if column is a negative value', () => {
      expect(() => new Position(0, -1)).toThrow('Invalid position: column must be between 0 and 8');
    });

    it('should throw an error if column is 9 or more', () => {
      expect(() => new Position(0, 9)).toThrow('Invalid position: column must be between 0 and 8');
      expect(() => new Position(0, 10)).toThrow('Invalid position: column must be between 0 and 8');
    });

    it('should throw an error if both coordinates are invalid', () => {
      expect(() => new Position(-1, -1)).toThrow('Invalid position');
      expect(() => new Position(9, 9)).toThrow('Invalid position');
      expect(() => new Position(-1, 9)).toThrow('Invalid position');
    });
  });

  describe('equals', () => {
    it('should consider positions with the same coordinates equal', () => {
      const position1 = new Position(3, 4);
      const position2 = new Position(3, 4);
      expect(position1.equals(position2)).toBe(true);
    });

    it('should consider positions with different coordinates not equal', () => {
      const position1 = new Position(3, 4);
      const position2 = new Position(3, 5);
      const position3 = new Position(4, 4);
      expect(position1.equals(position2)).toBe(false);
      expect(position1.equals(position3)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should represent a position as a string', () => {
      const position = new Position(2, 3);
      expect(position.toString()).toBe('(2, 3)');
    });
  });

  describe('fromObject', () => {
    it('should create a position from an object', () => {
      const position = Position.fromObject({ row: 2, column: 3 });
      expect(position.row).toBe(2);
      expect(position.column).toBe(3);
    });

    it('should throw an error when creating a position from an invalid object', () => {
      expect(() => Position.fromObject({ row: -1, column: 0 })).toThrow();
      expect(() => Position.fromObject({ row: 0, column: 9 })).toThrow();
    });
  });

  describe('toObject', () => {
    it('should convert a position to a plain object', () => {
      const position = new Position(2, 3);
      const obj = position.toObject();
      expect(obj).toEqual({ row: 2, column: 3 });
    });
  });
});