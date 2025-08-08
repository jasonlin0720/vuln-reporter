#!/bin/bash

# vuln-reporter 版本發布腳本
# 使用方法: ./scripts/release.sh [版本號]
# 範例: ./scripts/release.sh 0.1.2

set -e  # 遇到錯誤立即退出

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "❌ 請提供版本號"
    echo "使用方法: ./scripts/release.sh [版本號]"
    echo "範例: ./scripts/release.sh 0.1.2"
    exit 1
fi

echo "🚀 開始發布 vuln-reporter v$VERSION"

# 1. 檢查 git 狀態
echo "📋 檢查 git 狀態..."
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ 工作目錄不乾淨，請先提交所有變更"
    git status
    exit 1
fi

# 2. 確保在 master 分支
echo "🔍 檢查分支..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo "❌ 請切換到 master 分支"
    echo "當前分支: $CURRENT_BRANCH"
    exit 1
fi

# 3. 拉取最新變更
echo "⬇️ 拉取最新變更..."
git pull origin master

# 4. 更新版本號
echo "📝 更新版本號到 $VERSION..."
npm version $VERSION --no-git-tag-version

# 5. 建置專案
echo "🔨 建置專案..."
pnpm build

# 6. 執行測試
echo "🧪 執行測試..."
pnpm test

# 7. 程式碼檢查
echo "🔍 程式碼檢查..."
pnpm lint

# 8. 類型檢查
echo "📋 類型檢查..."
pnpm typecheck

# 9. 提交版本變更
echo "💾 提交版本變更..."
git add package.json
git commit -m "chore: 更新版本號至 $VERSION"

# 10. 建立標籤
echo "🏷️ 建立 git 標籤..."
git tag -a "v$VERSION" -m "Release v$VERSION

請參考 RELEASE-v$VERSION.md 了解詳細變更內容"

# 11. 推送變更
echo "⬆️ 推送到遠端..."
git push origin master
git push origin "v$VERSION"

echo "✅ 版本 v$VERSION 發布完成！"
echo ""
echo "📋 後續步驟:"
echo "1. 前往 GitHub 建立 Release: https://github.com/jasonlin0720/vuln-reporter/releases/new?tag=v$VERSION"
echo "2. 如需發布到 NPM，執行: npm publish"
echo "3. 驗證發布: npx vuln-reporter@latest --version"
echo ""
echo "🎉 發布成功！"
