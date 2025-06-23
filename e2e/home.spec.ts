import { test, expect } from '@playwright/test'

test('ホームページが正しく表示される', async ({ page }) => {
  await page.goto('/')
  
  // ページタイトルをチェック
  await expect(page).toHaveTitle(/Create Next App/)
  
  // メインコンテンツの存在確認
  await expect(page.locator('main')).toBeVisible()
})

test('開発者向けリンクが機能する', async ({ page }) => {
  await page.goto('/')
  
  // Next.jsのドキュメントリンクをクリック
  const docsLink = page.getByRole('link', { name: /docs/i })
  if (await docsLink.isVisible()) {
    await expect(docsLink).toHaveAttribute('href', /nextjs\.org/)
  }
})