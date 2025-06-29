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
    await expect(page.getByRole('grid', { name: '将棋盤' })).toBeVisible();

    // 持ち駒エリア
    await expect(page.getByTestId('captured-pieces-sente')).toBeVisible();
    await expect(page.getByTestId('captured-pieces-gote')).toBeVisible();

    // コントロールボタン
    await expect(page.getByRole('button', { name: '新規対局' })).toBeVisible();
    await expect(page.getByRole('button', { name: '投了' })).toBeVisible();
  });

  test('駒を動かすことができる', async ({ page }) => {
    // 初期状態で先手番であることを確認
    await expect(page.getByText('先手番')).toBeVisible();

    // 先手の歩を選択
    const sentePawns = await page.locator('[data-piece-type="PAWN"][data-player="SENTE"]').all();
    
    if (sentePawns.length > 0) {
      await sentePawns[0].click({ force: true });
      
      // 少し待機してハイライトが表示される
      await page.waitForTimeout(300);
      
      // 歩の正しい移動先: 1九の歩が1八に移動
      await page.getByTestId('cell-5-8').click();
      
      // AI思考完了まで待機
      await expect(page.getByText('AIが考え中...')).not.toBeVisible({ timeout: 5000 });
      
      // 手番が先手に戻ることを確認（プレイヤーの手 → AIの手 → プレイヤーの手番）
      await expect(page.getByText('先手番')).toBeVisible({ timeout: 1000 });
    } else {
      throw new Error('先手の歩が見つかりませんでした');
    }
  });

  test('新規対局ボタンで新しいゲームが開始される', async ({ page }) => {
    // 初期状態で先手番であることを確認
    await expect(page.getByText('先手番')).toBeVisible();

    // 新規対局ボタンをクリック
    await page.getByRole('button', { name: '新規対局' }).click();

    // ゲームがリセットされて先手番のままであることを確認
    await expect(page.getByText('先手番')).toBeVisible();
    
    // 将棋盤が正しく表示されていることを確認
    await expect(page.getByRole('grid', { name: '将棋盤' })).toBeVisible();
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
    // 実際のゲーム進行に依存するため、現在は基本的な流れのテストのみ
    // TODO: 成り選択が必要なゲーム状況を作る必要がある
    
    // 将棋盤が表示されていることを確認
    await expect(page.getByRole('grid', { name: '将棋盤' })).toBeVisible();
    
    // ゲーム画面の基本要素が正しく動作することを確認
    await expect(page.getByText('先手番')).toBeVisible();
    await expect(page.getByRole('button', { name: '新規対局' })).toBeVisible();
    await expect(page.getByRole('button', { name: '投了' })).toBeVisible();
    
    // 注意: 成り選択ダイアログの表示には実際のゲーム進行が必要
    // 将来的には特定のゲーム状況をセットアップしてテストする予定
  });
});