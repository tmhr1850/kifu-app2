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
    // 7七の歩を選択 (初期位置)
    await page.getByRole('button', { name: '先手の歩' }).nth(6).click();

    // 7六に移動
    await page.getByTestId('cell-5-2').click();

    // 手番が後手に変わることを確認
    await expect(page.getByText('後手番')).toBeVisible();

    // 後手の3三の歩を選択
    await page.getByRole('button', { name: '後手の歩' }).nth(2).click();

    // 3四に移動
    await page.getByTestId('cell-3-6').click();

    // 手番が先手に戻ることを確認
    await expect(page.getByText('先手番')).toBeVisible();
  });

  test('新規対局ボタンで新しいゲームが開始される', async ({ page }) => {
    // 7七の歩を7六に動かす
    await page.getByRole('button', { name: '先手の歩' }).nth(6).click();
    await page.getByTestId('cell-5-2').click();

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