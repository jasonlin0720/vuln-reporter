# vuln-reporter

![NPM Version](https://img.shields.io/npm/v/vuln-reporter.svg)](https://www.npmjs.com/package/vuln-reporter)
[![License](https://img.shields.io/npm/l/vuln-reporter.svg)](https://github.com/jasonlin0720/vuln-reporter/blob/master/LICENSE)
[![Node.js CI](https://github.com/jasonlin0720/vuln-reporter/actions/workflows/node.js.yml/badge.svg)](https://github.com/jasonlin0720/vuln-reporter/actions/workflows/node.js.yml)

通用型漏洞掃描與報告工具 - 支援多種掃描工具（Trivy 等），生成 Excel 報告並發送 Teams 通知的 CLI 工具

## 功能特點

- 🔧 **多掃描工具支援**: 透過 Adapter 架構支援多種掃描工具（目前支援 Trivy，可擴展）
- 🤖 **智能格式檢測**: 自動檢測掃描報告格式，無需手動指定
- 🚫 **智能忽略機制**: 透過 YAML 配置檔案管理漏洞忽略規則
- 📊 **Excel 報告生成**: 生成包含摘要和詳情的 Excel 報告
- 📢 **多通知器支援**: 透過 Adapter 架構支援多種通知平台（Teams 等），可擴展
- 🔍 **詳細輸出模式**: 支援 verbose 模式顯示完整漏洞資訊
- 🎯 **CI/CD 友善**: 根據漏洞嚴重性設定適當的退出碼，可自定義退出行為
- 🏗️ **模組化架構**: 採用 VulnerabilityProcessor 核心處理器，邏輯清晰易維護
- ⚡ **零配置啟動**: 開箱即用，無需複雜配置

## 快速開始

### 使用 npx (推薦)

無需安裝，直接使用最新版本：

```bash
# 基本用法 - 自動檢測掃描工具格式
npx vuln-reporter --input scan-report.json --reporter-title "我的專案安全掃描"

# 詳細輸出模式 - 顯示完整漏洞資訊
npx vuln-reporter --input scan-report.json --reporter-title "詳細掃描結果" --verbose

# 手動指定掃描工具類型
npx vuln-reporter --input trivy-report.json --reporter-title "Trivy 掃描" --scanner trivy

# 完整功能 - 包含自定義配置
npx vuln-reporter --input scan-report.json --reporter-title "生產環境掃描" --notify-config custom-notify.yml --output-file "security-report.xlsx"
```

### 安裝使用

```bash
# 全域安裝
npm install -g vuln-reporter

# 專案內安裝 (開發依賴)
npm install --save-dev vuln-reporter

# 使用已安裝的版本
vuln-reporter --input scan-report.json --reporter-title "我的專案安全掃描"
```

### 命令列參數

| 參數                         | 短參數 | 必須 | 預設值                      | 說明                                        |
| ---------------------------- | ------ | ---- | --------------------------- | ------------------------------------------- |
| `--input`                    | `-i`   | ✅   | -                           | 掃描報告 JSON 檔案路徑（支援 Trivy 等格式） |
| `--reporter-title`           | `-t`   | ✅   | -                           | 報告標題                                    |
| `--scanner`                  | `-s`   | ❌   | `auto`                      | 指定掃描工具類型 (auto, trivy)              |
| `--verbose`                  | `-v`   | ❌   | `false`                     | 顯示詳細的漏洞資訊                          |
| `--details-url`              | `-d`   | ❌   | -                           | 詳細報告連結 (可選)                         |
| `--ignore-config`            | -      | ❌   | `.vuln-ignore.yml`          | 忽略規則配置檔案路徑                        |
| `--notify-config`            | `-n`   | ❌   | `.vuln-notify.yml`          | 通知器配置檔案路徑                          |
| `--output-file`              | `-o`   | ❌   | `vulnerability-report.xlsx` | Excel 報告輸出檔案路徑                      |
| `--exit-on-high-severity`    | -      | ❌   | `true`                      | 發現 Critical/High 漏洞時以非零退出碼退出   |
| `--no-exit-on-high-severity` | -      | ❌   | `false`                     | 發現 Critical/High 漏洞時不以非零退出碼退出 |

## 漏洞忽略機制

在專案根目錄建立 `.vuln-ignore.yml` 檔案來配置忽略規則：

```yaml
# .vuln-ignore.yml
rules:
  # 依 CVE ID 忽略
  - cve: CVE-2023-26136
    reason: '已確認為誤報'
    expires: '2024-06-30' # 可選：設定到期日期

  # 依 CVE ID 和套件名稱忽略 (更精確)
  - cve: CVE-2022-25883
    package: semver
    reason: '等待下個維護窗口更新'
    expires: '2024-03-31'

  # 永久忽略 (不設定 expires)
  - cve: CVE-2023-26115
    reason: '開發依賴套件，不影響生產環境'
```

### 忽略規則欄位說明

- `cve`: (必須) CVE ID
- `reason`: (必須) 忽略原因
- `package`: (可選) 特定套件名稱，提供更精確的匹配
- `expires`: (可選) 忽略規則到期日期 (YYYY-MM-DD 格式)

## 通知器設定

### 通知器配置檔案

在專案根目錄建立 `.vuln-notify.yml` 檔案來配置通知器：

```yaml
# .vuln-notify.yml
notifiers:
  # Microsoft Teams 通知
  - type: teams
    enabled: true
    config:
      webhookUrl: 'https://outlook.office.com/webhook/your-webhook-url-here'

  # 未來可擴展的其他通知器範例：
  # - type: slack
  #   enabled: false
  #   config:
  #     webhookUrl: "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
  #     channel: "#security-alerts"
```

### Teams 通知設定

#### 取得 Webhook URL

1. 在 Teams 頻道中點選「...」→「連接器」
2. 搜尋並設定「Incoming Webhook」
3. 輸入名稱和圖片，取得 Webhook URL
4. 將 URL 設定在 `.vuln-notify.yml` 配置檔案中

#### 通知內容

Teams 通知會包含：

- 📊 漏洞數量摘要 (依嚴重程度分類)
- 🎨 根據嚴重程度的顏色主題
- 🔗 詳細報告連結 (如果提供)
- ⏰ 掃描時間戳記

### 通知器架構

本工具採用 Adapter 架構設計，支援多種通知平台：

- ✅ **Teams**: 完整支援，發送 Adaptive Cards 格式通知
- 🔧 **其他平台**: 可透過實作 `Notifier` 介面輕鬆新增 (Slack、Discord、Email 等)

## 範例

### 範例檔案

專案提供完整的範例檔案：

- `examples/trivy-report-sample.json`: 範例 Trivy 報告
- `examples/.vuln-ignore.yml`: 範例忽略規則配置
- `examples/.vuln-notify.yml`: 範例通知器配置
- `examples/run-example.bat`: Windows 範例執行腳本
- `examples/run-example.sh`: Linux/Mac 範例執行腳本

### 執行範例

```bash
# 直接使用 npx (推薦)
npx vuln-reporter --input examples/trivy-report-sample.json --reporter-title "範例掃描報告"

# 或執行範例腳本
# Windows
examples\run-example.bat

# Linux/Mac
./examples/run-example.sh
```

## Trivy 本地測試

### 使用 Docker 執行 Trivy 掃描

```bash
# 掃描當前目錄並生成 JSON 報告
docker run --rm -v ${PWD}:/app aquasec/trivy:latest fs /app --format json --output /app/trivy-report.json

# Windows PowerShell
docker run --rm -v ${PWD}:/app aquasec/trivy:latest fs /app --format json --output /app/trivy-report.json

# Windows CMD
docker run --rm -v %CD%:/app aquasec/trivy:latest fs /app --format json --output /app/trivy-report.json
```

### 使用本工具分析掃描結果

```bash
# 基本分析
npx vuln-reporter --input .\trivy-report.json --reporter-title "Trivy 本地掃描測試" --output-file "trivy-report.xlsx"

# 詳細輸出模式
npx vuln-reporter --input .\trivy-report.json --reporter-title "Trivy 本地掃描測試" --output-file "trivy-report.xlsx" --verbose
```

### 完整測試流程

```bash
# 1. 執行 Trivy 掃描
docker run --rm -v ${PWD}:/app aquasec/trivy:latest fs /app --format json --output /app/trivy-report.json

# 2. 複製忽略規則範例（可選）
cp examples/.vuln-ignore.yml .

# 3. 分析掃描結果
npx vuln-reporter --input .\trivy-report.json --reporter-title "Trivy 本地掃描" --output-file "local-scan-report.xlsx" --verbose

# 4. 檢查生成的報告
# - Excel 報告: local-scan-report.xlsx
# - 終端輸出: 詳細的漏洞資訊列表
```

### 其他 Trivy 掃描選項

```bash
# 僅掃描高嚴重性漏洞
docker run --rm -v ${PWD}:/app aquasec/trivy:latest fs /app --severity HIGH,CRITICAL --format json --output /app/trivy-high-only.json

# 掃描特定目錄
docker run --rm -v ${PWD}:/app aquasec/trivy:latest fs /app/src --format json --output /app/trivy-src-only.json

# 包含忽略未修復的漏洞
docker run --rm -v ${PWD}:/app aquasec/trivy:latest fs /app --ignore-unfixed --format json --output /app/trivy-fixable.json
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
      --notify-config .vuln-notify.yml
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
      --notify-config .vuln-notify.yml
```

## 退出碼控制

### 預設行為 (v0.1.1+)

- `0`: 未發現新漏洞或僅有低/中等嚴重性漏洞
- `1`: 發現 Critical 或 High 嚴重性漏洞

### 自定義退出碼行為

```bash
# 預設：發現高嚴重性漏洞時退出碼為 1 (建置失敗)
npx vuln-reporter --input scan-report.json --reporter-title "CI 掃描"

# 明確啟用：發現高嚴重性漏洞時退出碼為 1
npx vuln-reporter --input scan-report.json --reporter-title "CI 掃描" --exit-on-high-severity

# 停用：即使發現高嚴重性漏洞也不讓建置失敗 (退出碼為 0)
npx vuln-reporter --input scan-report.json --reporter-title "監控掃描" --no-exit-on-high-severity
```

這讓 CI/CD 系統能夠根據掃描結果和專案需求決定是否讓建置失敗。

## 架構擴展性

### Adapter 架構設計

本工具採用 Adapter 架構設計，具有高度擴展性：

#### 支援新掃描工具

```typescript
// 1. 建立新的掃描工具解析器
export class NewScannerParser implements VulnerabilityScanner {
  parseReport(report: NewScannerReport): StandardVulnerability[] {
    // 將新掃描工具的格式轉換為標準格式
    return convertedVulnerabilities;
  }
}

// 2. 在 ParserRegistry 中註冊
registry.registerParser('new-scanner', new NewScannerParser());
```

#### 支援新通知平台

```typescript
// 1. 建立新的通知器
export class SlackNotifier implements Notifier {
  async sendNotification(data: NotificationData, config: SlackConfig): Promise<void> {
    // 實作 Slack 通知邏輯
  }
}

// 2. 在 NotifierRegistry 中註冊
registry.registerNotifier('slack', new SlackNotifier());
```

### 當前支援

#### 掃描工具

- ✅ **Trivy**: 完整支援，包含自動格式檢測
- 🔧 **其他工具**: 可透過實作 `VulnerabilityScanner` 介面輕鬆新增

#### 通知平台

- ✅ **Microsoft Teams**: 完整支援，包含 Adaptive Cards 格式
- 🔧 **其他平台**: 可透過實作 `Notifier` 介面輕鬆新增 (Slack、Discord、Email 等)

### 標準化格式

#### 漏洞格式標準化

所有掃描工具的報告都會轉換為統一的 `StandardVulnerability` 格式，確保：

- 🔄 **格式一致**: 所有後續處理都基於統一格式
- 🧪 **易於測試**: 標準化格式便於編寫測試
- 🔧 **易於維護**: 新增工具不影響現有功能

#### 通知格式標準化

所有通知器都使用統一的 `NotificationData` 格式，確保：

- 📢 **通知一致**: 所有平台都能接收相同的通知內容
- 🔧 **易於擴展**: 新增通知平台不需要修改核心邏輯
- ⚙️ **配置驅動**: 透過 YAML 配置檔案管理多個通知器

## 開發

### 本地開發環境設置

```bash
# 1. 克隆專案
git clone https://github.com/jasonlin0720/vuln-reporter.git
cd vuln-reporter

# 2. 安裝依賴
pnpm install

# 3. 建置專案
pnpm build
```

### 開發指令

```bash
# 建置 TypeScript
pnpm build

# 開發模式執行 (使用本地源碼)
pnpm dev --input examples/trivy-report-sample.json --reporter-title "本地開發測試"

# 執行所有測試
pnpm test

# 執行特定測試檔案
pnpm test tests/parsers/trivy-parser.test.ts

# 程式碼檢查
pnpm lint

# 程式碼格式化
pnpm format

# TypeScript 類型檢查
pnpm typecheck
```

### 本地測試

```bash
# 使用本地開發版本測試
pnpm dev --input examples/trivy-report-sample.json --reporter-title "本地測試" --verbose

# 測試 Excel 報告生成
pnpm dev --input examples/trivy-report-sample.json --reporter-title "Excel 測試" --output-file "local-test.xlsx"

# 測試忽略規則 (需要先複製範例配置)
cp examples/.vuln-ignore.yml .
pnpm dev --input examples/trivy-report-sample.json --reporter-title "忽略規則測試" --verbose
```

### 與發布版本比較

```bash
# 使用 npx 測試最新發布版本
npx vuln-reporter --input examples/trivy-report-sample.json --reporter-title "發布版本測試"

# 使用本地開發版本
pnpm dev --input examples/trivy-report-sample.json --reporter-title "開發版本測試"
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
