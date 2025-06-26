// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Web Worker APIのモック
class WorkerMock {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = null;
  }

  postMessage(msg) {
    // テスト環境では何もしない
    // 必要に応じて、setTimeout で非同期的に onmessage を呼び出すことも可能
    if (this.onmessage) {
      setTimeout(() => {
        this.onmessage({
          data: {
            type: 'MOVE_CALCULATED',
            move: null
          }
        });
      }, 0);
    }
  }

  terminate() {
    // クリーンアップ処理
  }

  addEventListener() {
    // イベントリスナーのモック
  }

  removeEventListener() {
    // イベントリスナーのモック
  }
}

// グローバルにWorkerを定義
global.Worker = WorkerMock;