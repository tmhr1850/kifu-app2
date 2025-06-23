# 新規リポジトリ作成・プッシュ手順ガイド

新しいプロジェクトを GitHub にプッシュする際の標準手順をまとめたドキュメントです。

## 🚀 基本的なプッシュ手順

### 1. リモートリポジトリの追加

```bash
git remote add origin https://github.com/USERNAME/REPOSITORY_NAME.git
```

### 2. ファイルのステージング・コミット

```bash
# 全ファイルをステージング
git add .

# 初期コミット作成
git commit -m "Initial commit: プロジェクト名 setup"
```

### 3. プッシュとアップストリーム設定

```bash
# mainブランチをプッシュし、upstream設定
git push -u origin main
```

## 🧹 不要ファイルの削除手順

プッシュ後に不要なファイルがリポジトリに含まれてしまった場合の対処法：

### 1. Git の追跡から削除（ローカルファイルは残す）

```bash
# フォルダを削除
git rm -r --cached FOLDER_NAME

# ファイルを削除
git rm --cached FILE_NAME
```

### 2. .gitignore の更新

削除したファイル/フォルダを`.gitignore`に追加して今後の除外を確実にする

### 3. 変更をコミット・プッシュ

```bash
git add .gitignore
git commit -m "Remove unwanted files and update .gitignore"
git push
```

## 📝 推奨 .gitignore 設定

Next.js プロジェクトで除外すべき主要ファイル：

```gitignore
# 開発環境固有
/.specstory
.cursorindexingignore
.claude/
.vscode/
.idea/

# 依存関係
/node_modules
package-lock.json
yarn.lock

# ビルド関連
/.next/
/out/
/build

# 環境設定
.env*

# その他
.DS_Store
*.pem
*.log
```

## ⚡ ワンライナー実行例

```bash
# 基本プッシュ（一括実行）
git remote add origin https://github.com/USERNAME/REPO.git && git add . && git commit -m "Initial commit" && git push -u origin main

# 不要ファイル削除（一括実行）
git rm -r --cached .specstory && git rm --cached package-lock.json && git add .gitignore && git commit -m "Clean up unwanted files" && git push
```

## 🔔 通知設定（macOS）

タスク完了後の音声通知：

```bash
# 効果音再生
afplay /System/Library/Sounds/Glass.aiff

# 音声通知
say "GitHubリポジトリへのプッシュが完了しました"
```

## 📋 チェックリスト

- [ ] リモートリポジトリの追加
- [ ] .gitignore の確認・更新
- [ ] 不要ファイルの除外確認
- [ ] 初期コミット作成
- [ ] プッシュ・アップストリーム設定
- [ ] GitHub でリポジトリ確認
- [ ] 不要ファイルが含まれていないか確認

---

**注意事項：**

- `USERNAME`と`REPOSITORY_NAME`は実際の値に置き換えてください
- 既にファイルがプッシュされている場合は、削除手順を先に実行してください
- 大きなファイルや機密情報は事前に.gitignore で除外してください
