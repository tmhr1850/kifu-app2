/**
 * UI層で使用される共通型定義
 */

/**
 * UI層で扱う座標 (1-9)
 * 将棋盤の座標系で使用される
 */
export interface UIPosition {
  row: number;    // 縦座標 (1-9)
  column: number; // 横座標 (1-9)
}

/**
 * 駒の移動を表す型
 */
export interface UIMove {
  from: UIPosition;
  to: UIPosition;
  isPromotion?: boolean;
}

/**
 * ゲームの状態を表す型
 */
export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'resigned';

/**
 * エラー結果を表す型
 */
export interface ErrorResult {
  success: false;
  error: Error;
}

/**
 * 成功結果を表す型
 */
export interface SuccessResult<T = void> {
  success: true;
  data?: T;
}

/**
 * 操作の結果を表すユニオン型
 */
export type Result<T = void> = SuccessResult<T> | ErrorResult;