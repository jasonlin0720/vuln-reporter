@echo off
REM vuln-reporter 版本發布腳本 (Windows)
REM 使用方法: scripts\release.bat [版本號]
REM 範例: scripts\release.bat 0.1.2

setlocal enabledelayedexpansion

set VERSION=%1

if "%VERSION%"=="" (
    echo ❌ 請提供版本號
    echo 使用方法: scripts\release.bat [版本號]
    echo 範例: scripts\release.bat 0.1.2
    exit /b 1
)

echo 🚀 開始發布 vuln-reporter v%VERSION%

REM 1. 檢查 git 狀態
echo 📋 檢查 git 狀態...
git status --porcelain > temp_status.txt
for /f %%i in (temp_status.txt) do (
    echo ❌ 工作目錄不乾淨，請先提交所有變更
    git status
    del temp_status.txt
    exit /b 1
)
del temp_status.txt

REM 2. 確保在 master 分支
echo 🔍 檢查分支...
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
if not "%CURRENT_BRANCH%"=="master" (
    echo ❌ 請切換到 master 分支
    echo 當前分支: %CURRENT_BRANCH%
    exit /b 1
)

REM 3. 拉取最新變更
echo ⬇️ 拉取最新變更...
git pull origin master
if errorlevel 1 (
    echo ❌ 拉取失敗
    exit /b 1
)

REM 4. 更新版本號
echo 📝 更新版本號到 %VERSION%...
npm version %VERSION% --no-git-tag-version
if errorlevel 1 (
    echo ❌ 版本號更新失敗
    exit /b 1
)

REM 5. 建置專案
echo 🔨 建置專案...
pnpm build
if errorlevel 1 (
    echo ❌ 建置失敗
    exit /b 1
)

REM 6. 執行測試
echo 🧪 執行測試...
pnpm test
if errorlevel 1 (
    echo ❌ 測試失敗
    exit /b 1
)

REM 7. 程式碼檢查
echo 🔍 程式碼檢查...
pnpm lint
if errorlevel 1 (
    echo ❌ 程式碼檢查失敗
    exit /b 1
)

REM 8. 類型檢查
echo 📋 類型檢查...
pnpm typecheck
if errorlevel 1 (
    echo ❌ 類型檢查失敗
    exit /b 1
)

REM 9. 提交版本變更
echo 💾 提交版本變更...
git add package.json
git commit -m "chore: 更新版本號至 %VERSION%"
if errorlevel 1 (
    echo ❌ 提交失敗
    exit /b 1
)

REM 10. 建立標籤
echo 🏷️ 建立 git 標籤...
git tag -a "v%VERSION%" -m "Release v%VERSION%"
if errorlevel 1 (
    echo ❌ 標籤建立失敗
    exit /b 1
)

REM 11. 推送變更
echo ⬆️ 推送到遠端...
git push origin master
if errorlevel 1 (
    echo ❌ 推送 master 失敗
    exit /b 1
)

git push origin "v%VERSION%"
if errorlevel 1 (
    echo ❌ 推送標籤失敗
    exit /b 1
)

echo ✅ 版本 v%VERSION% 發布完成！
echo.
echo 📋 後續步驟:
echo 1. 前往 GitHub 建立 Release: https://github.com/jasonlin0720/vuln-reporter/releases/new?tag=v%VERSION%
echo 2. 如需發布到 NPM，執行: npm publish
echo 3. 驗證發布: npx vuln-reporter@latest --version
echo.
echo 🎉 發布成功！

endlocal
