/**
 * ゲーム設定ファイル
 * アプリケーション全体で使用される定数を管理
 */

// GameManager設定
export const GAME_MANAGER_CONFIG = {
  // AI思考時間（ミリ秒）
  DEFAULT_AI_THINKING_TIME: 1000,
  // AI難易度レベル（1-10）
  DEFAULT_AI_DIFFICULTY_LEVEL: 5,
  // 自動保存のデバウンス遅延（ミリ秒）
  AUTO_SAVE_DEBOUNCE_DELAY: 500,
  // ローカルストレージキー
  STORAGE_KEY: 'kifu-app-game-state',
} as const;

// UI設定
export const UI_CONFIG = {
  // エラーメッセージ表示時間（ミリ秒）
  DEFAULT_ERROR_DISPLAY_TIME: 3000 as number,
  CRITICAL_ERROR_DISPLAY_TIME: 10000 as number, // チェックメイト、投了等
  WARNING_DISPLAY_TIME: 5000 as number, // チェック等
  QUICK_ERROR_DISPLAY_TIME: 2000 as number, // 移動エラー等
  
  // AI処理タイマー
  AI_MOVE_DELAY: 500 as number,
  AI_CALCULATION_TIMEOUT: 300 as number,
} as const;

// パフォーマンス設定
export const PERFORMANCE_CONFIG = {
  // キーボードナビゲーション
  KEYBOARD_REPEAT_DELAY: 150,
  // レンダリング最適化
  BOARD_UPDATE_DEBOUNCE: 16, // ~60fps
} as const;

// アクセシビリティ設定
export const A11Y_CONFIG = {
  // フォーカス管理
  FOCUS_RING_SIZE: 2,
  // スクリーンリーダー
  LIVE_REGION_DELAY: 100,
} as const;