// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Worker mock for testing environment
class WorkerMock {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = null;
    this.onerror = null;
  }

  postMessage(message) {
    // Simulate async AI calculation
    setTimeout(() => {
      if (this.onmessage) {
        // Return a simple mock move
        this.onmessage({
          data: {
            type: 'MOVE_RESULT',
            move: {
              from: { row: 6, column: 4 },
              to: { row: 5, column: 4 },
              isPromotion: false
            }
          }
        });
      }
    }, 100);
  }

  terminate() {
    // Mock terminate
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