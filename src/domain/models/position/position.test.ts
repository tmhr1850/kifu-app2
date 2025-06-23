import { describe, it, expect } from 'vitest';
import { Position } from './position';

describe('Position', () => {
  describe('コンストラクタ', () => {
    it('有効な座標で Position が作成できること', () => {
      const position = new Position(0, 0);
      expect(position.row).toBe(0);
      expect(position.column).toBe(0);
    });

    it('各境界値で Position が作成できること', () => {
      expect(() => new Position(0, 0)).not.toThrow();
      expect(() => new Position(0, 8)).not.toThrow();
      expect(() => new Position(8, 0)).not.toThrow();
      expect(() => new Position(8, 8)).not.toThrow();
      expect(() => new Position(4, 4)).not.toThrow();
    });

    it('row が負の値の場合エラーをスローすること', () => {
      expect(() => new Position(-1, 0)).toThrow('Invalid position: row must be between 0 and 8');
    });

    it('row が 9 以上の場合エラーをスローすること', () => {
      expect(() => new Position(9, 0)).toThrow('Invalid position: row must be between 0 and 8');
      expect(() => new Position(10, 0)).toThrow('Invalid position: row must be between 0 and 8');
    });

    it('column が負の値の場合エラーをスローすること', () => {
      expect(() => new Position(0, -1)).toThrow('Invalid position: column must be between 0 and 8');
    });

    it('column が 9 以上の場合エラーをスローすること', () => {
      expect(() => new Position(0, 9)).toThrow('Invalid position: column must be between 0 and 8');
      expect(() => new Position(0, 10)).toThrow('Invalid position: column must be between 0 and 8');
    });

    it('両方の座標が無効な場合もエラーをスローすること', () => {
      expect(() => new Position(-1, -1)).toThrow('Invalid position');
      expect(() => new Position(9, 9)).toThrow('Invalid position');
      expect(() => new Position(-1, 9)).toThrow('Invalid position');
    });
  });

  describe('equals', () => {
    it('同じ座標の Position は等しいと判定されること', () => {
      const position1 = new Position(3, 4);
      const position2 = new Position(3, 4);
      expect(position1.equals(position2)).toBe(true);
    });

    it('異なる座標の Position は等しくないと判定されること', () => {
      const position1 = new Position(3, 4);
      const position2 = new Position(3, 5);
      const position3 = new Position(4, 4);
      expect(position1.equals(position2)).toBe(false);
      expect(position1.equals(position3)).toBe(false);
    });
  });

  describe('toString', () => {
    it('Position を文字列で表現できること', () => {
      const position = new Position(2, 3);
      expect(position.toString()).toBe('(2, 3)');
    });
  });

  describe('fromObject', () => {
    it('オブジェクトから Position を作成できること', () => {
      const position = Position.fromObject({ row: 2, column: 3 });
      expect(position.row).toBe(2);
      expect(position.column).toBe(3);
    });

    it('無効なオブジェクトからの作成時にエラーをスローすること', () => {
      expect(() => Position.fromObject({ row: -1, column: 0 })).toThrow();
      expect(() => Position.fromObject({ row: 0, column: 9 })).toThrow();
    });
  });

  describe('toObject', () => {
    it('Position をプレーンオブジェクトに変換できること', () => {
      const position = new Position(2, 3);
      const obj = position.toObject();
      expect(obj).toEqual({ row: 2, column: 3 });
    });
  });
});