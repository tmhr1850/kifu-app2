import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// テスト用のDOMマッチャーを追加
expect.extend(matchers)

// 各テスト後にDOMをクリーンアップ
afterEach(() => {
  cleanup()
})