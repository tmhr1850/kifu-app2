# Kifu App 2 - 将棋アプリケーション

![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC)

## 概要

Kifu App 2は、Next.js 15とTypeScriptで構築された高性能な将棋アプリケーションです。クリーンアーキテクチャとTDD（テスト駆動開発）の原則に基づいて開発されています。

## 特徴

- 🎮 **インタラクティブな将棋盤**: 直感的なUIでスムーズな駒の操作
- 🤖 **AI対戦**: Web Workerを使用した非同期AI処理
- 📱 **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- ♿ **アクセシビリティ**: キーボード操作・スクリーンリーダー対応
- ⚡ **高速パフォーマンス**: 最適化されたレンダリングとメモリ管理
- 💾 **自動保存**: ゲーム状態の自動保存と復元

## 技術スタック

- **フレームワーク**: Next.js 15.3.3 (App Router)
- **言語**: TypeScript 5.0
- **スタイリング**: TailwindCSS v4
- **アーキテクチャ**: クリーンアーキテクチャ
- **開発手法**: TDD (テスト駆動開発)

## Getting Started

開発サーバーの起動:

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開いてください。

## コマンド一覧

```bash
npm run dev      # 開発サーバーの起動
npm run build    # プロダクションビルド
npm run start    # プロダクションサーバーの起動
npm run lint     # ESLintの実行
```

## プロジェクト構成

```
src/
├── app/              # Next.js App Router
├── components/       # UIコンポーネント
│   ├── ui/          # 基本UIコンポーネント
│   └── features/    # 機能別コンポーネント
├── domain/          # ドメイン層（ビジネスロジック）
├── usecases/        # ユースケース層
├── infrastructure/  # インフラストラクチャ層
├── hooks/           # カスタムフック
├── workers/         # Web Workers
├── utils/           # ユーティリティ関数
└── styles/          # スタイルシート
```

## パフォーマンス最適化

### 実装済みの最適化

1. **React最適化**
   - React.memoとuseMemoによる再レンダリング削減
   - useReducerによるState管理の改善
   - コンポーネントの適切な分割

2. **AI処理の最適化**
   - Web Workerによるバックグラウンド処理
   - Alpha-Beta枝刈りアルゴリズム
   - 評価関数のキャッシュ

3. **メモリ管理**
   - GameManagerのライフサイクル管理
   - 適切なクリーンアップ処理
   - 非同期LocalStorage操作

4. **UI/UX改善**
   - スムーズなアニメーション
   - タッチデバイス最適化
   - エラー通知の改善

## アクセシビリティ

- WAI-ARIA準拠のマークアップ
- キーボード完全対応（矢印キー、Tab、Enter）
- スクリーンリーダー対応
- 高コントラストモード対応
- モーション軽減設定の尊重

## ブラウザ対応

- Chrome/Edge (最新版)
- Firefox (最新版)
- Safari (最新版)
- モバイルブラウザ対応

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🛠️ 開発環境セットアップ

### Git リポジトリ設定

新規プロジェクトで Git リポジトリを設定する場合は、以下のガイドを参照してください：

- **[Git 設定ガイド](docs/git-setup-guide.md)** - 手動設定の詳細手順
- **自動セットアップスクリプト** - ワンコマンドでセットアップ

```bash
# 自動セットアップの使用例
./scripts/git-setup.sh https://github.com/username/repository.git "Initial commit"
```

### 推奨開発ツール

- [Cursor](https://cursor.sh/) - AI 統合エディタ
- [GitHub Desktop](https://desktop.github.com/) - Git GUI
- [Vercel CLI](https://vercel.com/cli) - デプロイメント
