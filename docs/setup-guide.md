# 将棋アプリ セットアップガイド 🛠️

このアプリケーションをローカル環境で動かすためのセットアップ手順を説明します。

## 📋 前提条件

### 必要な環境
- **Node.js**: v18.0.0 以上
- **npm**: v8.0.0 以上
- **Git**: 最新版
- **ブラウザ**: Chrome, Firefox, Safari (最新版)

### 推奨開発環境
- **VS Code**: TypeScript開発のため
- **Chrome DevTools**: デバッグ用

## 🚀 クイックスタート

### 1. リポジトリのクローン
```bash
git clone https://github.com/tmhr1850/kifu-app2.git
cd kifu-app2
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 開発サーバーの起動
```bash
npm run dev
```

### 4. ブラウザでアクセス
```
http://localhost:3000
```

## 📁 プロジェクト構造

```
kifu-app2/
├── 📁 src/                      # ソースコード
│   ├── 📁 app/                  # Next.js App Router (UI層)
│   │   ├── page.tsx             # メインページ
│   │   └── board-demo/          # デモページ
│   ├── 📁 components/           # Reactコンポーネント
│   │   ├── 📁 ui/               # 基本UIコンポーネント
│   │   └── 📁 features/         # 機能別コンポーネント
│   ├── 📁 domain/               # ドメイン層（ビジネスロジック）
│   │   ├── 📁 models/           # ドメインモデル
│   │   └── 📁 services/         # ドメインサービス
│   ├── 📁 usecases/             # ユースケース層
│   ├── 📁 infrastructure/       # インフラ層
│   ├── 📁 workers/              # Web Workers (AI処理)
│   └── 📁 lib/                  # ユーティリティ
├── 📁 e2e/                      # E2Eテスト (Playwright)
├── 📁 docs/                     # ドキュメント
├── package.json                 # プロジェクト設定
├── tailwind.config.ts           # TailwindCSS設定
└── CLAUDE.md                    # AIアシスタント向け指示
```

## 🛠️ 利用可能なコマンド

### 開発用コマンド
```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm run start

# コード品質チェック
npm run lint

# テスト実行 (今後実装予定)
npm run test
npm run test:e2e
```

### 開発サーバーのポート
- **メイン**: http://localhost:3000
- **ポート競合時**: 自動的に3001, 3002... に変更

## 🧪 テスト環境

### E2Eテスト (Playwright)
```bash
# Playwrightインストール
npx playwright install

# E2Eテスト実行
npx playwright test

# テスト結果表示
npx playwright show-report
```

### テストの種類
- **board-visual-check**: 将棋盤の表示確認
- **piece-move-test**: 駒の移動機能テスト
- **simple-click-test**: 基本クリック操作テスト

## 🎯 開発のポイント

### アーキテクチャ
- **クリーンアーキテクチャ**: ドメイン駆動設計
- **TDD**: テスト駆動開発を推奨
- **コンポーネント設計**: プレゼンテーショナル/コンテナ分離

### コーディング規約
- **TypeScript**: 厳密な型チェック
- **ESLint**: Next.js推奨ルール
- **命名**: camelCase (変数), PascalCase (コンポーネント)

### パフォーマンス最適化
- **React.memo**: コンポーネントの再レンダリング最適化
- **Web Workers**: AI処理の並列化
- **サーバーコンポーネント**: Next.js 15の活用

## 🐛 トラブルシューティング

### よくある問題と解決法

#### Node.js版本エラー
```bash
# Node.jsバージョン確認
node --version

# nvm使用時（推奨）
nvm use 18
```

#### 依存関係エラー
```bash
# node_modules削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

#### ポート競合エラー
```bash
# プロセス確認
lsof -i :3000

# プロセス終了
kill -9 <PID>
```

#### TypeScriptエラー
```bash
# 型チェック実行
npx tsc --noEmit

# VS Code再起動
cmd + shift + p → "TypeScript: Restart TS Server"
```

#### TailwindCSS スタイル未反映
```bash
# 開発サーバー再起動
npm run dev

# ブラウザキャッシュクリア
cmd + shift + R (Mac) / Ctrl + shift + R (Windows)
```

## 🔧 開発環境設定

### VS Code拡張機能（推奨）
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-playwright.playwright"
  ]
}
```

### Git設定
```bash
# コミットメッセージテンプレート
git config commit.template .gitmessage

# 改行コード設定
git config core.autocrlf false
```

## 📚 参考資料

### 技術スタック詳細
- **Next.js 15.3.3**: https://nextjs.org/docs
- **React 19.0.0**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **TailwindCSS v4**: https://tailwindcss.com/docs
- **Playwright**: https://playwright.dev/

### 将棋ルール
- 詳細: `docs/requirements/shogi-rules.md`
- MVP要件: `docs/requirements/mvp-requirements.md`

## 🚀 デプロイ

### Vercel（推奨）
```bash
# Vercelにデプロイ
npx vercel

# プロダクション環境
npx vercel --prod
```

### その他のプラットフォーム
- **Netlify**: 静的サイトとして
- **Heroku**: Node.jsアプリとして
- **Docker**: コンテナ化対応済み

## 📞 サポート

### 開発に関する質問
- **Issue**: GitHubのIssueページ
- **Discord**: 開発者コミュニティ（準備中）

### コントリビューション
1. Forkしてブランチを作成
2. 変更を実装
3. テストを追加
4. Pull Requestを作成

---

**Happy Coding!** 🎉💻