# vuln-reporter

通用型漏洞掃描與報告工具 - 用於解析 Trivy 掃描結果、生成 Excel 報告並發送 Teams 通知的 CLI 工具

## 功能特點

- 🔍 **Trivy 報告解析**: 解析 Trivy JSON 格式的掃描報告
- 🚫 **智能忽略機制**: 透過 YAML 配置檔案管理漏洞忽略規則
- 📊 **Excel 報告生成**: 生成包含摘要和詳情的 Excel 報告
- 📢 **Teams 通知整合**: 發送 Adaptive Cards 格式的 Teams 通知
- 🎯 **CI/CD 友善**: 根據漏洞嚴重性設定適當的退出碼
- ⚡ **零配置啟動**: 開箱即用，無需複雜配置

## 快速開始

### 安裝

```bash
# 使用 pnpm (推薦)
pnpm install

# 或使用 npm
npm install
```

### 基本使用

```bash
# 基本用法 - 生成 Excel 報告
pnpm dev --input trivy-report.json --reporter-title "我的專案安全掃描"

# 包含詳情連結
pnpm dev --input trivy-report.json --reporter-title "CI/CD 掃描結果" --details-url "https://github.com/your-repo/actions/runs/123"

# 完整功能 - 包含 Teams 通知
pnpm dev --input trivy-report.json --reporter-title "生產環境掃描" --teams-webhook-url "YOUR_TEAMS_WEBHOOK_URL" --output-file "security-report.xlsx"
```

### 命令列參數

| 參數 | 短參數 | 必須 | 說明 |
|------|--------|------|------|
| `--input` | `-i` | ✅ | Trivy JSON 報告檔案路徑 |
| `--reporter-title` | `-t` | ✅ | 報告標題 |
| `--details-url` | `-d` | ❌ | 詳細報告連結 (可選) |
| `--teams-webhook-url` | `-w` | ❌ | Microsoft Teams Webhook URL (可選) |
| `--output-file` | `-o` | ❌ | Excel 報告輸出檔案路徑 (預設: vulnerability-report.xlsx) |

## 漏洞忽略機制

在專案根目錄建立 `.vuln-ignore.yml` 檔案來配置忽略規則：

```yaml
# .vuln-ignore.yml
rules:
  # 依 CVE ID 忽略
  - cve: CVE-2023-26136
    reason: "已確認為誤報"
    expires: "2024-06-30"  # 可選：設定到期日期

  # 依 CVE ID 和套件名稱忽略 (更精確)
  - cve: CVE-2022-25883
    package: semver
    reason: "等待下個維護窗口更新"
    expires: "2024-03-31"

  # 永久忽略 (不設定 expires)
  - cve: CVE-2023-26115
    reason: "開發依賴套件，不影響生產環境"
```

### 忽略規則欄位說明

- `cve`: (必須) CVE ID
- `reason`: (必須) 忽略原因
- `package`: (可選) 特定套件名稱，提供更精確的匹配
- `expires`: (可選) 忽略規則到期日期 (YYYY-MM-DD 格式)

## Teams 通知設定

### 取得 Webhook URL

1. 在 Teams 頻道中點選「...」→「連接器」
2. 搜尋並設定「Incoming Webhook」
3. 輸入名稱和圖片，取得 Webhook URL
4. 在命令中使用 `--teams-webhook-url` 參數

### 通知內容

Teams 通知會包含：
- 📊 漏洞數量摘要 (依嚴重程度分類)
- 🎨 根據嚴重程度的顏色主題
- 🔗 詳細報告連結 (如果提供)
- ⏰ 掃描時間戳記

## 範例

### 範例檔案

專案提供完整的範例檔案：

- `examples/trivy-report-sample.json`: 範例 Trivy 報告
- `examples/.vuln-ignore.yml`: 範例忽略規則配置
- `examples/run-example.bat`: Windows 範例執行腳本
- `examples/run-example.sh`: Linux/Mac 範例執行腳本

### 執行範例

```bash
# Windows
examples\run-example.bat

# Linux/Mac
./examples/run-example.sh
```

## CI/CD 整合

### GitHub Actions

```yaml
- name: Security Scan Report
  run: |
    # 執行 Trivy 掃描
    trivy fs --format json --output trivy-report.json .
    
    # 生成報告並發送通知
    npx vuln-reporter \
      --input trivy-report.json \
      --reporter-title "${{ github.repository }} Security Scan" \
      --details-url "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}" \
      --teams-webhook-url "${{ secrets.TEAMS_WEBHOOK_URL }}"
```

### GitLab CI

```yaml
security_report:
  script:
    - trivy fs --format json --output trivy-report.json .
    - npx vuln-reporter 
        --input trivy-report.json 
        --reporter-title "${CI_PROJECT_NAME} Security Scan" 
        --details-url "${CI_PIPELINE_URL}" 
        --teams-webhook-url "${TEAMS_WEBHOOK_URL}"
```

## 退出碼

- `0`: 未發現新漏洞或僅有低/中等嚴重性漏洞
- `1`: 發現 Critical 或 High 嚴重性漏洞

這讓 CI/CD 系統能夠根據掃描結果決定是否讓建置失敗。

## 開發

### 建置

```bash
pnpm build
```

### 測試

```bash
# 執行所有測試
pnpm test

# 執行特定測試檔案
pnpm test tests/parsers/trivy-parser.test.ts
```

### 開發模式

```bash
pnpm dev --input examples/trivy-report-sample.json --reporter-title "開發測試"
```

## 技術規格

- **Node.js**: >= 18
- **TypeScript**: 5.x
- **核心依賴**:
  - commander.js (CLI 介面)
  - xlsx (Excel 報告生成)
  - ofetch (HTTP 請求)
  - js-yaml (YAML 配置解析)

## 授權

MIT License - 詳見 LICENSE 檔案

## 貢獻

歡迎提交 Issue 和 Pull Request！請確保：

1. 新功能包含對應的測試
2. 遵循現有的程式碼風格
3. 更新相關文件

---

**需要協助？** 請查看 `examples/` 目錄中的範例檔案，或提交 Issue 討論。