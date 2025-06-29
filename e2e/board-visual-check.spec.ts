import { test, expect } from '@playwright/test';

test('将棋盤が正しく表示される', async ({ page }) => {
  await page.goto('/');
  
  // 将棋盤が表示されるまで待機
  await page.waitForSelector('[aria-label="将棋盤"]');
  
  // スクリーンショットを撮影
  await page.screenshot({ 
    path: 'board-screenshot.png',
    fullPage: true 
  });
  
  // 9x9のグリッドが存在することを確認
  const board = await page.locator('[aria-label="将棋盤"]');
  await expect(board).toBeVisible();
  
  // マス目の数を確認（9x9 = 81マス）
  const cells = await page.locator('[role="gridcell"]').count();
  expect(cells).toBe(81);
});