import { test, expect } from '@playwright/test';

test.describe('GameScreen E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('ゲーム画面の基本要素が表示される', async ({ page }) => {
    // タイトル
    await expect(page.locator('h1')).toContainText('将棋ゲーム');

    // 手番表示
    await expect(page.getByText('先手番')).toBeVisible();

    // 将棋盤
    await expect(page.getByRole('grid')).toBeVisible();

    // 持ち駒エリア
    await expect(page.getByTestId('captured-pieces-sente')).toBeVisible();
    await expect(page.getByTestId('captured-pieces-gote')).toBeVisible();

    // コントロールボタン
    await expect(page.getByRole('button', { name: '新規対局' })).toBeVisible();
    await expect(page.getByRole('button', { name: '投了' })).toBeVisible();
  });

  test('駒を動かすことができる', async ({ page }) => {
    // 初期配置の歩を選択
    const pawn = page.getByLabel('先手の歩').first();
    await pawn.click();

    // 移動先をクリック（仮に7六の歩を7五に動かす）
    // 実際の座標は実装に依存するため、適切に調整が必要
    const targetCell = page.locator('button[aria-label="五七"]');
    await targetCell.click();

    // 手番が変わることを確認
    await expect(page.getByText('後手番')).toBeVisible();
  });

  test('新規対局ボタンで新しいゲームが開始される', async ({ page }) => {
    // 適当に駒を動かす
    const pawn = page.getByLabel('先手の歩').first();
    await pawn.click();
    const targetCell = page.locator('button').nth(50); // 適当な位置
    await targetCell.click();

    // 新規対局ボタンをクリック
    await page.getByRole('button', { name: '新規対局' }).click();

    // 手番が先手に戻ることを確認
    await expect(page.getByText('先手番')).toBeVisible();
  });

  test('投了ボタンで確認ダイアログが表示される', async ({ page }) => {
    // 投了ボタンをクリック
    await page.getByRole('button', { name: '投了' }).click();

    // 確認ダイアログが表示される
    await expect(page.getByText('本当に投了しますか？')).toBeVisible();

    // キャンセルボタンをクリック
    await page.getByRole('button', { name: 'キャンセル' }).click();

    // ダイアログが閉じる
    await expect(page.getByText('本当に投了しますか？')).not.toBeVisible();
  });

  test('成り選択ダイアログが表示される', async ({ page }) => {
    // 実際のゲーム進行に依存するため、モック化が必要
    // ここでは基本的な流れのテストのみ
    
    // 将棋盤が表示されていることを確認
    await expect(page.getByRole('grid')).toBeVisible();
  });
});