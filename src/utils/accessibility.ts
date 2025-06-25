/**
 * アクセシビリティ関連のユーティリティ
 */

/**
 * スクリーンリーダー用のライブリージョンにメッセージを送信
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // メッセージを読み上げた後、要素を削除
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * キーボードナビゲーション用のフォーカストラップ
 */
export function createFocusTrap(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }
  
  container.addEventListener('keydown', handleKeyDown);
  
  // クリーンアップ関数を返す
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * 高コントラストモードの検出
 */
export function isHighContrastMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-contrast: high)');
  return mediaQuery.matches;
}

/**
 * モーション設定の検出
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * キーボード操作のヘルプテキスト生成
 */
export function getKeyboardHelpText(): string {
  return `
    キーボード操作:
    - 矢印キー: 盤面を移動
    - Enter/Space: 駒を選択・移動
    - Tab: 次の要素へ移動
    - Shift+Tab: 前の要素へ移動
    - Escape: 選択をキャンセル
  `.trim();
}

/**
 * ARIA属性の動的更新
 */
export function updateAriaAttributes(element: HTMLElement, attributes: Record<string, string>) {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(`aria-${key}`, value);
  });
}

/**
 * フォーカス可能要素のスタイル改善
 */
export function enhanceFocusStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* フォーカスリングの改善 */
    *:focus-visible {
      outline: 3px solid #2563eb !important;
      outline-offset: 2px !important;
    }
    
    /* 高コントラストモード対応 */
    @media (prefers-contrast: high) {
      .board-cell {
        border-width: 2px !important;
      }
      
      .piece {
        filter: contrast(1.2);
      }
    }
    
    /* モーション軽減モード対応 */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
  
  document.head.appendChild(style);
}