#!/bin/bash

# 新規リポジトリ設定スクリプト
# 使用方法: ./scripts/git-setup.sh <GitHub_URL> [commit_message]

set -e

# 引数チェック
if [ $# -eq 0 ]; then
    echo "使用方法: $0 <GitHub_URL> [commit_message]"
    echo "例: $0 https://github.com/username/repo.git \"Initial commit\""
    exit 1
fi

REPO_URL=$1
COMMIT_MESSAGE=${2:-"Initial commit: Project setup"}

echo "🚀 新規リポジトリセットアップを開始します..."
echo "リポジトリURL: $REPO_URL"
echo "コミットメッセージ: $COMMIT_MESSAGE"
echo ""

# 1. リモートリポジトリの確認・追加
echo "📡 リモートリポジトリを設定中..."
if git remote get-url origin >/dev/null 2>&1; then
    echo "⚠️  既存のoriginを削除して再設定します"
    git remote remove origin
fi
git remote add origin "$REPO_URL"
echo "✅ リモートリポジトリを設定しました"

# 2. 不要ファイルの削除（既に追跡されている場合）
echo "🧹 不要ファイルをクリーンアップ中..."
files_to_remove=()

# .specstoryフォルダの確認
if git ls-files | grep -q "^\.specstory/"; then
    files_to_remove+=(".specstory")
fi

# package-lock.jsonの確認
if git ls-files | grep -q "^package-lock\.json$"; then
    files_to_remove+=("package-lock.json")
fi

# .cursorindexingignoreの確認
if git ls-files | grep -q "^\.cursorindexingignore$"; then
    files_to_remove+=(".cursorindexingignore")
fi

# ファイル削除実行
for file in "${files_to_remove[@]}"; do
    echo "  🗑️  $file を削除中..."
    if [[ -d "$file" ]]; then
        git rm -r --cached "$file" >/dev/null 2>&1 || true
    else
        git rm --cached "$file" >/dev/null 2>&1 || true
    fi
done

if [ ${#files_to_remove[@]} -gt 0 ]; then
    echo "✅ 不要ファイルを削除しました: ${files_to_remove[*]}"
else
    echo "✅ 削除対象のファイルはありませんでした"
fi

# 3. ファイルのステージング
echo "📦 変更をステージング中..."
git add .
echo "✅ ファイルをステージングしました"

# 4. コミット作成
echo "💾 コミットを作成中..."
git commit -m "$COMMIT_MESSAGE"
echo "✅ コミットを作成しました"

# 5. プッシュ
echo "⬆️  リモートリポジトリにプッシュ中..."
git push -u origin main
echo "✅ プッシュが完了しました"

# 6. 完了通知
echo ""
echo "🎉 セットアップが完了しました！"
echo "リポジトリURL: $REPO_URL"

# 効果音・音声通知（macOSの場合）
if [[ "$OSTYPE" == "darwin"* ]]; then
    afplay /System/Library/Sounds/Glass.aiff 2>/dev/null || true
    say "GitHubリポジトリへのプッシュが完了しました" 2>/dev/null || true
fi

echo ""
echo "📋 確認事項:"
echo "  - GitHubでリポジトリが正しく作成されているか確認してください"
echo "  - 不要なファイルが含まれていないか確認してください"
echo "  - .gitignoreの設定が適切か確認してください" 