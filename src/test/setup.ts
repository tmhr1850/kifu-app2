import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { expect, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// テスト用のDOMマッチャーを追加
expect.extend(matchers)

// 各テスト後にDOMをクリーンアップ
afterEach(() => {
  cleanup()
})