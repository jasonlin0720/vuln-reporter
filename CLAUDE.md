# Claude Code 專案配置

本專案是一個通用型漏洞掃描與報告工具，採用 Adapter 架構支援多種掃描工具並生成報告。

## 專案概述

這是一個純粹的**防護型安全工具**，用途包括：

- 解析多種漏洞掃描工具報告（目前支援 Trivy，可擴展）
- 智能格式檢測與標準化處理
- 生成 Excel 格式的詳細報告
- 透過 Adapter 架構支援多種通知平台（Teams 等）
- 管理漏洞忽略規則
- 提供詳細的漏洞資訊輸出
- 支援 CI/CD 整合，可自定義退出碼行為

## 專案結構

```
vuln-reporter/
├── src/                    # 主要源碼
│   ├── core/              # 核心處理邏輯
│   │   └── vulnerability-processor.ts # 漏洞處理核心類別
│   ├── parsers/           # 掃描工具解析器 (Adapter 架構)
│   │   ├── trivy-parser.ts      # Trivy 適配器
│   │   └── parser-registry.ts   # 解析器註冊表與調度器
│   ├── types/             # 類型定義
│   │   ├── trivy-types.ts       # Trivy 專用類型
│   │   └── [其他工具類型].ts    # 未來擴展用
│   ├── reporters/         # Excel 報告生成器
│   ├── notifiers/         # 通知器功能 (Adapter 架構)
│   │   ├── teams-notifier.ts    # Teams 通知適配器
│   │   └── notifier-registry.ts # 通知器註冊表與調度器
│   ├── utils/             # 工具函數
│   │   ├── ignore-filter.ts     # 忽略規則過濾器
│   │   ├── config-loader.ts     # 忽略規則配置載入器
│   │   ├── notify-config-loader.ts # 通知器配置載入器
│   │   ├── result-logger.ts     # 結果輸出記錄器
│   │   └── normalizeOptions.ts  # CLI 選項標準化
│   ├── types.ts           # 通用 TypeScript 類型定義
│   └── cli.ts             # CLI 主程式
├── tests/                 # 測試檔案
│   ├── core/              # 核心邏輯測試
│   ├── parsers/           # 解析器測試
│   ├── reporters/         # 報告器測試
│   ├── notifiers/         # 通知器測試
│   └── utils/             # 工具函數測試
├── examples/              # 範例檔案
│   ├── trivy-report-sample.json
│   ├── .vuln-config.yml
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
pnpm test tests/core/vulnerability-processor.test.ts
pnpm test tests/parsers/trivy-parser.test.ts
pnpm test tests/parsers/parser-registry.test.ts
pnpm test tests/utils/ignore-filter.test.ts
pnpm test tests/utils/result-logger.test.ts
pnpm test tests/reporters/excel-reporter.test.ts
pnpm test tests/notifiers/teams-notifier.test.ts
pnpm test tests/notifiers/notifier-registry.test.ts
pnpm test tests/utils/config-loader.test.ts
pnpm test tests/utils/notify-config-loader.test.ts
```

### 範例執行

```bash
# 基本用法 (自動檢測格式)
pnpm dev --input examples/trivy-report-sample.json --reporter-title "測試報告"

# 詳細輸出模式
pnpm dev --input examples/trivy-report-sample.json --reporter-title "測試報告" --verbose

# 指定掃描工具類型
pnpm dev --input examples/trivy-report-sample.json --reporter-title "Trivy 報告" --scanner trivy

# 包含自定義配置檔案
pnpm dev --input examples/trivy-report-sample.json --reporter-title "測試報告" --config examples/.vuln-config.yml

# 使用預設配置檔案 (需要先複製範例配置)
cp examples/.vuln-config.yml .
pnpm dev --input examples/trivy-report-sample.json --reporter-title "測試報告 (套用預設配置)" --verbose

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

1. **TDD 開發**: 所有功能都有對應測試（目前 80 個測試案例）
2. **Adapter 架構**: 支援多種掃描工具和通知平台的擴展性設計
3. **模組化設計**: 每個功能獨立模組，職責清晰分離
4. **核心處理器**: 使用 `VulnerabilityProcessor` 統一處理流程
5. **類型安全**: 完整的 TypeScript 類型定義
6. **標準化處理**: 統一的 `StandardVulnerability` 和 `NotificationData` 格式
7. **配置驅動**: 透過單一整合的 YAML 配置檔案管理忽略規則和通知器
8. **錯誤處理**: 完善的錯誤處理和使用者提示
9. **CI/CD 友善**: 可自定義退出碼行為，適應不同部署需求

## 功能模組

### 1. 核心處理器 (`src/core/vulnerability-processor.ts`)

- 統一的漏洞處理流程管理
- 整合所有功能模組（解析、過濾、報告、通知）
- 支援選項標準化和預設值處理
- 提供退出碼控制邏輯
- 測試: `tests/core/vulnerability-processor.test.ts`

### 2. 解析器系統 (Adapter 架構)

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

- 讀取整合的 YAML 配置檔案（包含忽略規則和通知器設定）
- 驗證配置格式和結構
- 支援自動載入預設配置檔案
- 測試: `tests/utils/config-loader.test.ts`

#### 選項標準化 (`src/utils/normalizeOptions.ts`)

- 標準化 CLI 選項，提供預設值
- 確保選項一致性和向後相容性
- 支援 `exitOnHighSeverity` 等新選項

### 4. Excel 報告生成器 (`src/reporters/excel-reporter.ts`)

- 生成摘要和詳情工作表
- 支援標準化漏洞格式
- 支援多語言欄位標題
- 測試: `tests/reporters/excel-reporter.test.ts`

### 5. 通知器系統 (Adapter 架構)

#### 通知器註冊表 (`src/notifiers/notifier-registry.ts`)

- 管理所有通知器
- 統一發送通知到多個平台
- 支援配置驅動的通知器管理
- 測試: `tests/notifiers/notifier-registry.test.ts`

#### Teams 通知器 (`src/notifiers/teams-notifier.ts`)

- 實作 `Notifier` 介面
- 發送 Adaptive Cards 通知
- 根據嚴重性調整主題顏色
- 支援新舊介面（向後相容）
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

2. **通知發送失敗**
   - 檢查 `.vuln-config.yml` 配置檔案中的 `notify` 區段格式
   - 驗證 Webhook URL 格式
   - 檢查網路連線
   - 確認通知平台設定正確

3. **忽略規則不生效**
   - 確認 `.vuln-config.yml` 檔案位於正確位置
   - 檢查配置檔案中的 `ignore` 區段格式
   - 驗證 CVE ID 和套件名稱是否完全匹配
   - 使用 `--config` 指定自定義配置檔案路徑

4. **配置檔案問題**
   - 確認 `.vuln-config.yml` 檔案格式正確
   - 檢查 `ignore` 和 `notify` 區段的結構
   - 驗證各配置參數的正確性
   - 使用 `--config` 指定自定義配置檔案路徑

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

#### 新增通知器

1. **建立通知器類別**：

   ```typescript
   // src/notifiers/slack-notifier.ts
   export class SlackNotifier implements Notifier {
     async sendNotification(data: NotificationData, config: SlackConfig): Promise<void> {
       // 實作 Slack 通知邏輯
     }
   }
   ```

2. **註冊通知器**：

   ```typescript
   // src/notifiers/notifier-registry.ts
   constructor() {
     this.registerNotifier('teams', new TeamsNotifier());
     this.registerNotifier('slack', new SlackNotifier()); // 新增這行
   }
   ```

3. **配置檔案支援**：
   ```yaml
   # .vuln-config.yml
   notify:
     notifiers:
       - type: slack
         enabled: true
         config:
           webhookUrl: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
           channel: '#security-alerts'
   ```

#### 其他擴展

1. **新增報告格式**: 在 `src/reporters/` 建立新的報告生成器
2. **新增工具函數**: 在 `src/utils/` 添加共用功能

### 開發要求

每個新功能請包含：

- 完整的 TypeScript 類型定義
- 對應的測試檔案（遵循 TDD 原則）
- 使用範例和文件
- 更新 README 和 CLAUDE.md

### 架構優勢

- **雙重標準化**:
  - 掃描工具都輸出 `StandardVulnerability` 格式
  - 通知器都使用 `NotificationData` 格式
- **解耦合**: 新工具和通知器不影響現有功能
- **可測試**: 每個組件都有獨立測試
- **擴展性**: 輕鬆添加新的掃描工具和通知平台支援
- **配置驅動**: 透過單一整合的 YAML 配置檔案管理複雜設定
- **向後相容**: 保持 API 穩定性，支援漸進式升級
