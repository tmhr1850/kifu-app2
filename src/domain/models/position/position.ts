/**
 * 将棋盤上の位置を表す Value Object
 * 座標の妥当性を保証し、不正な座標の生成を防ぐ
 */
export class Position {
  private static readonly MIN_COORDINATE = 0;
  private static readonly MAX_COORDINATE = 8;

  /**
   * @param row 行番号 (0-8)
   * @param column 列番号 (0-8)
   * @throws {Error} 座標が盤面外の場合
   */
  constructor(
    public readonly row: number,
    public readonly column: number
  ) {
    this.validate();
  }

  /**
   * 座標の妥当性を検証
   * @private
   * @throws {Error} 座標が無効な場合
   */
  private validate(): void {
    if (this.row < Position.MIN_COORDINATE || this.row > Position.MAX_COORDINATE) {
      throw new Error(`Invalid position: row must be between ${Position.MIN_COORDINATE} and ${Position.MAX_COORDINATE}`);
    }
    if (this.column < Position.MIN_COORDINATE || this.column > Position.MAX_COORDINATE) {
      throw new Error(`Invalid position: column must be between ${Position.MIN_COORDINATE} and ${Position.MAX_COORDINATE}`);
    }
  }

  /**
   * 二つの Position が同じ座標を指しているか判定
   * @param other 比較対象の Position
   * @returns 同じ座標なら true
   */
  equals(other: Position): boolean {
    return this.row === other.row && this.column === other.column;
  }

  /**
   * Position を文字列表現に変換
   * @returns "(row, column)" 形式の文字列
   */
  toString(): string {
    return `(${this.row}, ${this.column})`;
  }

  /**
   * プレーンオブジェクトから Position インスタンスを作成
   * @param obj { row: number, column: number } 形式のオブジェクト
   * @returns Position インスタンス
   * @throws {Error} 座標が無効な場合
   */
  static fromObject(obj: { row: number; column: number }): Position {
    return new Position(obj.row, obj.column);
  }

  /**
   * Position をプレーンオブジェクトに変換
   * @returns { row: number, column: number } 形式のオブジェクト
   */
  toObject(): { row: number; column: number } {
    return { row: this.row, column: this.column };
  }
}