@echo off
REM 範例執行腳本 - 展示如何使用 vuln-reporter

echo 🚀 執行 vuln-reporter 範例

REM 基本使用 - 只生成 Excel 報告
echo 📊 範例 1: 基本使用 (僅生成 Excel 報告)
call pnpm dev --input examples/trivy-report-sample.json --reporter-title "Node.js 專案安全掃描報告" --output-file "example-report-basic.xlsx"

echo.

REM 進階使用 - 包含詳情連結
echo 📊 範例 2: 包含詳情連結
call pnpm dev --input examples/trivy-report-sample.json --reporter-title "Node.js 專案安全掃描報告 (CI/CD)" --details-url "https://github.com/your-org/your-repo/actions/runs/123456" --output-file "example-report-with-details.xlsx"

echo.

REM 完整使用 - 包含 Teams 通知 (需要實際的 webhook URL)
echo 📊 範例 3: 完整使用 (包含 Teams 通知)
echo 注意: 此範例需要實際的 Teams Webhook URL 才能正常運作
echo 請將 YOUR_TEAMS_WEBHOOK_URL 替換為實際的 webhook URL

REM call pnpm dev --input examples/trivy-report-sample.json --reporter-title "生產環境安全掃描報告" --details-url "https://github.com/your-org/your-repo/security/advisories" --teams-webhook-url "YOUR_TEAMS_WEBHOOK_URL" --output-file "example-report-complete.xlsx"

echo.
echo ✅ 範例執行完成！檢查生成的 Excel 檔案：
dir example-report-*.xlsx 2>nul || echo 沒有找到生成的報告檔案