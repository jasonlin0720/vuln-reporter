# Claude Code 專案配置

本專案是一個通用型漏洞掃描與報告工具，採用 Adapter 架構支援多種掃描工具並生成報告。

## 專案概述

這是一個純粹的**防護型安全工具**，用途包括：

- 解析多種漏洞掃描工具報告（目前支援 Trivy，可擴展）
- 智能格式檢測與標準化處理
- 生成 Excel 格式的詳細報告
- 發送 Microsoft Teams 通知
- 管理漏洞忽略規則
- 提供詳細的漏洞資訊輸出

## 專案結構

```
vuln-reporter/
├── src/                    # 主要源碼
│   ├── parsers/           # 掃描工具解析器 (Adapter 架構)
│   │   ├── trivy-parser.ts      # Trivy 適配器
│   │   └── parser-registry.ts   # 解析器註冊表與調度器
│   ├── types/             # 類型定義
│   │   ├── trivy-types.ts       # Trivy 專用類型
│   │   └── [其他工具類型].ts    # 未來擴展用
│   ├── reporters/         # Excel 報告生成器
│   ├── notifiers/         # Teams 通知功能
│   ├── utils/             # 工具函數
│   │   ├── ignore-filter.ts     # 忽略規則過濾器
│   │   ├── config-loader.ts     # 配置載入器
│   │   └── result-logger.ts     # 結果輸出記錄器
│   ├── types.ts           # 通用 TypeScript 類型定義
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
pnpm test tests/parsers/parser-registry.test.ts
pnpm test tests/utils/ignore-filter.test.ts
pnpm test tests/utils/result-logger.test.ts
pnpm test tests/reporters/excel-reporter.test.ts
pnpm test tests/notifiers/teams-notifier.test.ts
pnpm test tests/utils/config-loader.test.ts
```

### 範例執行

```bash
# 基本用法 (自動檢測格式)
pnpm dev --input examples/trivy-report-sample.json --reporter-title "測試報告"

# 詳細輸出模式
pnpm dev --input examples/trivy-report-sample.json --reporter-title "測試報告" --verbose

# 指定掃描工具類型
pnpm dev --input examples/trivy-report-sample.json --reporter-title "Trivy 報告" --scanner trivy

# 包含忽略規則 (需要先複製範例配置)
cp examples/.vuln-ignore.yml .
pnpm dev --input examples/trivy-report-sample.json --reporter-title "測試報告 (套用忽略規則)" --verbose

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

1. **TDD 開發**: 所有功能都有對應測試（目前 41 個測試案例）
2. **Adapter 架構**: 支援多種掃描工具的擴展性設計
3. **模組化設計**: 每個功能獨立模組，職責清晰分離
4. **類型安全**: 完整的 TypeScript 類型定義
5. **標準化處理**: 統一的 `StandardVulnerability` 格式
6. **錯誤處理**: 完善的錯誤處理和使用者提示

## 功能模組

### 1. 解析器系統 (Adapter 架構)

#### 解析器註冊表 (`src/parsers/parser-registry.ts`)

- 管理所有掃描工具解析器
- 自動格式檢測功能
- 支援手動指定解析器類型
- 測試: `tests/parsers/parser-registry.test.ts`

#### Trivy 解析器 (`src/parsers/trivy-parser.ts`)

- 實作 `VulnerabilityScanner` 介面
- 將 Trivy 格式轉換為 `StandardVulnerability`
- 測試: `tests/parsers/trivy-parser.test.ts`

### 2. 類型系統

#### 通用類型 (`src/types.ts`)

- `StandardVulnerability`: 標準化漏洞格式
- `VulnerabilityScanner`: 解析器介面
- 其他通用類型定義

#### Trivy 類型 (`src/types/trivy-types.ts`)

- Trivy 專用的原始格式定義
- 與通用類型隔離，便於維護

### 3. 工具函數模組

#### 忽略規則過濾器 (`src/utils/ignore-filter.ts`)

- 套用忽略規則到標準化漏洞
- 生成漏洞摘要統計
- 支援到期日期檢查
- 測試: `tests/utils/ignore-filter.test.ts`

#### 結果輸出記錄器 (`src/utils/result-logger.ts`)

- 封裝結果輸出邏輯
- 支援 verbose 詳細模式
- 按嚴重性分組顯示
- 測試: `tests/utils/result-logger.test.ts`

#### 配置載入器 (`src/utils/config-loader.ts`)

- 讀取 YAML 忽略規則配置
- 驗證配置格式
- 測試: `tests/utils/config-loader.test.ts`

### 4. Excel 報告生成器 (`src/reporters/excel-reporter.ts`)

- 生成摘要和詳情工作表
- 支援標準化漏洞格式
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
NODE_DEBUG=* pnpm dev --input examples/trivy-report-sample.json --reporter-title "除錯測試" --verbose
```

## 擴展開發

### Adapter 架構擴展

#### 新增掃描工具支援

1. **建立類型定義**：

   ```bash
   # 在 src/types/ 建立新工具的類型檔案
   touch src/types/new-scanner-types.ts
   ```

2. **實作解析器**：

   ```typescript
   // src/parsers/new-scanner-parser.ts
   export class NewScannerParser implements VulnerabilityScanner {
     parseReport(report: NewScannerReport): StandardVulnerability[] {
       // 轉換邏輯...
       return standardVulnerabilities;
     }
   }
   ```

3. **註冊解析器**：

   ```typescript
   // src/parsers/parser-registry.ts
   constructor() {
     this.registerParser('trivy', new TrivyParser());
     this.registerParser('new-scanner', new NewScannerParser()); // 新增這行
   }
   ```

4. **添加格式檢測**：
   ```typescript
   // 在 detectParser() 方法中新增檢測邏輯
   if (this.isNewScannerFormat(reportData)) {
     return { parser: this.parsers.get('new-scanner')!, scannerType: 'new-scanner' };
   }
   ```

#### 其他擴展

1. **新增報告格式**: 在 `src/reporters/` 建立新的報告生成器
2. **整合新通知平台**: 在 `src/notifiers/` 實作新的通知器
3. **新增工具函數**: 在 `src/utils/` 添加共用功能

### 開發要求

每個新功能請包含：

- 完整的 TypeScript 類型定義
- 對應的測試檔案（遵循 TDD 原則）
- 使用範例和文件
- 更新 README 和 CLAUDE.md

### 架構優勢

- **標準化**: 所有掃描工具都輸出 `StandardVulnerability` 格式
- **解耦合**: 新工具不影響現有功能
- **可測試**: 每個組件都有獨立測試
- **擴展性**: 輕鬆添加新的掃描工具支援
