import { test, expect } from '@playwright/test';

test('駒クリック動作確認', async ({ page }) => {
  // コンソールログを監視
  page.on('console', msg => {
    console.log('Browser Console:', msg.text());
  });

  await page.goto('/');
  
  // 将棋盤が表示されるまで待機
  await page.waitForSelector('[aria-label="将棋盤"]');
  
  // スクリーンショット（初期状態）
  await page.screenshot({ path: 'initial-state.png', fullPage: true });
  
  // 先手の歩をクリック（手動でゆっくり）
  await page.waitForTimeout(2000);
  
  const pawnCell = page.locator('[aria-label="七5 - 先手のPAWN"]');
  await expect(pawnCell).toBeVisible();
  
  const pawnButton = pawnCell.locator('button[aria-label="先手の歩"]');
  await expect(pawnButton).toBeVisible();
  
  console.log('駒ボタンをクリック中...');
  await pawnButton.click();
  
  // クリック後に少し待機
  await page.waitForTimeout(3000);
  
  // スクリーンショット（クリック後）
  await page.screenshot({ path: 'after-click.png', fullPage: true });
  
  // 最低限、駒が選択状態になっているかチェック
  const selectedCell = page.locator('[aria-label="七5 - 先手のPAWN"]');
  const hasBlueBackground = await selectedCell.evaluate(el => 
    el.classList.contains('bg-blue-500')
  );
  
  console.log('駒が選択されているか:', hasBlueBackground);
});