# Claude Code 專案配置

本專案是一個通用型漏洞掃描與報告工具，專門用於解析 Trivy 掃描結果並生成報告。

## 專案概述

這是一個純粹的**防護型安全工具**，用途包括：

- 解析 Trivy 漏洞掃描報告
- 生成 Excel 格式的詳細報告
- 發送 Microsoft Teams 通知
- 管理漏洞忽略規則

## 專案結構

```
vuln-reporter/
├── src/                    # 主要源碼
│   ├── parsers/           # Trivy 報告解析器
│   ├── reporters/         # Excel 報告生成器
│   ├── notifiers/         # Teams 通知功能
│   ├── utils/             # 工具函數 (忽略規則、配置載入)
│   ├── types.ts           # TypeScript 類型定義
│   └── cli.ts             # CLI 主程式
├── tests/                 # 測試檔案
├── examples/              # 範例檔案
│   ├── trivy-report-sample.json
│   ├── .vuln-ignore.yml
│   └── run-example.*
└── dist/                  # 編譯後的輸出
```

## 開發指令

### 主要指令

- `pnpm build`: 編譯 TypeScript
- `pnpm dev`: 開發模式執行 CLI
- `pnpm test`: 執行所有測試
- `pnpm lint`: 程式碼檢查
- `pnpm format`: 程式碼格式化

### 測試指令

```bash
# 執行所有測試
pnpm test

# 執行特定測試檔案
pnpm test tests/parsers/trivy-parser.test.ts
pnpm test tests/utils/ignore-filter.test.ts
pnpm test tests/reporters/excel-reporter.test.ts
pnpm test tests/notifiers/teams-notifier.test.ts
pnpm test tests/utils/config-loader.test.ts
```

### 範例執行

```bash
# 基本用法
pnpm dev --input examples/trivy-report-sample.json --reporter-title "測試報告"

# 包含忽略規則 (需要先複製範例配置)
cp examples/.vuln-ignore.yml .
pnpm dev --input examples/trivy-report-sample.json --reporter-title "測試報告 (套用忽略規則)"

# 執行範例腳本 (Windows)
examples\run-example.bat
```

## 技術架構

請遵守 TDD 開發原則，優先調整測試以確認實作目標，再添加/調整最少的程式碼以通過測試。

### 核心依賴

- **commander.js**: CLI 介面框架
- **xlsx**: Excel 檔案生成
- **ofetch**: HTTP 請求 (Teams 通知)
- **js-yaml**: YAML 配置檔解析
- **typescript**: 類型安全
- **vitest**: 測試框架

### 設計原則

1. **TDD 開發**: 所有功能都有對應測試
2. **模組化設計**: 每個功能獨立模組
3. **類型安全**: 完整的 TypeScript 類型定義
4. **錯誤處理**: 完善的錯誤處理和使用者提示

## 功能模組

### 1. Trivy 解析器 (`src/parsers/trivy-parser.ts`)

- 解析 Trivy JSON 報告
- 提取漏洞資訊
- 測試: `tests/parsers/trivy-parser.test.ts`

### 2. 忽略規則過濾器 (`src/utils/ignore-filter.ts`)

- 套用忽略規則
- 生成漏洞摘要統計
- 支援到期日期檢查
- 測試: `tests/utils/ignore-filter.test.ts`

### 3. 配置載入器 (`src/utils/config-loader.ts`)

- 讀取 YAML 忽略規則配置
- 驗證配置格式
- 測試: `tests/utils/config-loader.test.ts`

### 4. Excel 報告生成器 (`src/reporters/excel-reporter.ts`)

- 生成摘要和詳情工作表
- 支援多語言欄位標題
- 測試: `tests/reporters/excel-reporter.test.ts`

### 5. Teams 通知器 (`src/notifiers/teams-notifier.ts`)

- 發送 Adaptive Cards 通知
- 根據嚴重性調整主題顏色
- 測試: `tests/notifiers/teams-notifier.test.ts`

## 安全注意事項

本工具專門用於**防護型安全用途**：

- ✅ 分析和報告現有漏洞
- ✅ 協助修復和管理安全問題
- ✅ 提供安全狀態可視化
- ❌ 不包含任何攻擊性功能
- ❌ 不進行主動漏洞利用

## 疑難排解

### 常見問題

1. **Excel 檔案無法生成**
   - 檢查輸出目錄權限
   - 確認檔案未被其他程式開啟

2. **Teams 通知失敗**
   - 驗證 Webhook URL 格式
   - 檢查網路連線
   - 確認 Teams 頻道設定正確

3. **忽略規則不生效**
   - 確認 `.vuln-ignore.yml` 檔案位於專案根目錄
   - 檢查 YAML 格式是否正確
   - 驗證 CVE ID 和套件名稱是否完全匹配

### 除錯模式

```bash
# 查看詳細錯誤訊息
NODE_DEBUG=* pnpm dev --input examples/trivy-report-sample.json --reporter-title "除錯測試"
```

## 擴展開發

如需擴展功能：

1. **新增報告格式**: 在 `src/reporters/` 建立新的報告生成器
2. **支援新掃描器**: 在 `src/parsers/` 新增對應解析器
3. **整合新通知平台**: 在 `src/notifiers/` 實作新的通知器

每個新功能請包含：

- 完整的 TypeScript 類型定義
- 對應的測試檔案
- 使用範例
- 更新 README 文件
