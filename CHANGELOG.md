# 更新日誌

本專案的所有重要變更都會記錄在此檔案中。

格式基於 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)，
版本號遵循 [語義化版本](https://semver.org/spec/v2.0.0.html) 規範。

## [0.1.2] - 2025-08-12

### 💥 重大變更

- **配置檔案整合** - 將原本分離的 `.vuln-ignore.yml` 和 `.vuln-notify.yml` 合併為單一配置檔案 `.vuln-config.yml`
- **CLI 選項簡化** - 移除 `--ignore-config` 和 `--notify-config` 選項，改用單一 `--config` / `-c` 選項

### 新增功能

- 🔧 **整合配置管理** - 新增統一的配置檔案結構，提升配置管理的一致性
- 📋 **增強配置載入器** - `ConfigLoader` 現在支援載入包含忽略規則和通知器設定的整合配置
- 🎯 **自動配置檢測** - 支援自動載入預設配置檔案 (`.vuln-config.yml` 或 `.vuln-config.yaml`)
- ✅ **完整驗證機制** - 新增對整合配置檔案中 `ignore` 和 `notify` 區段的格式驗證

### 改進

- 📁 **簡化專案結構** - 減少配置檔案數量，降低使用者設定複雜度
- 🔄 **重構核心處理器** - `VulnerabilityProcessor` 適配新的整合配置載入邏輯
- 📝 **統一配置格式** - 使用巢狀結構組織忽略規則和通知器設定，提升可讀性
- 🧪 **擴展測試覆蓋** - 新增整合配置檔案的完整測試案例

### 技術變更

- **新增檔案**:
  - `examples/.vuln-config.yml` - 整合配置檔案範例

- **移除檔案**:
  - `examples/.vuln-ignore.yml` - 已整合至 `.vuln-config.yml`
  - `examples/.vuln-notify.yml` - 已整合至 `.vuln-config.yml`
  - `src/utils/notify-config-loader.ts` - 功能已整合至 `ConfigLoader`

- **更新檔案**:
  - `src/cli.ts` - 移除分離的配置選項，改用單一 `--config` 選項
  - `src/core/vulnerability-processor.ts` - 適配整合配置載入邏輯
  - `src/types.ts` - 新增 `Config` 介面以支援整合配置結構
  - `src/utils/config-loader.ts` - 重構為支援載入整合配置檔案
  - `src/utils/normalizeOptions.ts` - 更新預設選項處理
  - `tests/` - 更新所有相關測試以適配新的配置結構

### 向後相容性

- ❌ **不向後相容** - 此版本移除了分離配置檔案的支援
- 🔄 **遷移指南** - 使用者需要將現有的 `.vuln-ignore.yml` 和 `.vuln-notify.yml` 手動合併至 `.vuln-config.yml`
- 📋 **CLI 變更** - `--ignore-config` 和 `--notify-config` 選項已移除，改用 `--config`

### 遷移說明

從 0.1.1 升級到 0.1.2 需要進行以下步驟：

1. **合併配置檔案**：

   ```yaml
   # 新的 .vuln-config.yml 格式
   ignore:
     rules:
       # 將原本 .vuln-ignore.yml 的 rules 內容移至此處

   notify:
     notifiers:
       # 將原本 .vuln-notify.yml 的 notifiers 內容移至此處
   ```

2. **更新 CLI 指令**：

   ```bash
   # 舊版指令
   vuln-reporter --ignore-config custom.yml --notify-config notify.yml

   # 新版指令
   vuln-reporter --config custom-config.yml
   ```

3. **更新 CI/CD 配置**：
   - 將 `--ignore-config` 和 `--notify-config` 參數合併為 `--config`
   - 確保配置檔案採用新的整合格式

## [0.1.1] - 2025-08-08

### 新增功能

- 🏗️ **核心架構重構** - 新增 `VulnerabilityProcessor` 核心處理器，統一管理漏洞處理流程
- 🎯 **退出碼控制** - 新增 `--exit-on-high-severity` 和 `--no-exit-on-high-severity` 選項，可自定義 CI/CD 退出行為
- ⚙️ **選項標準化** - 新增 `normalizeOptions` 函數，提供一致的預設值和選項處理
- 🧪 **完整測試覆蓋** - 新增核心處理器測試，測試案例從 64 個增加到 80 個，確保所有功能模組的整合測試

### 改進

- 📦 **模組化設計** - 將 CLI 邏輯抽離到 `VulnerabilityProcessor`，提升程式碼可維護性
- 🔧 **配置管理** - 改善選項處理和預設值管理，提升使用者體驗
- 📝 **程式碼品質** - 使用 Prettier 統一程式碼格式，提升程式碼一致性

### 技術變更

- **新增檔案**:
  - `src/core/vulnerability-processor.ts` - 核心漏洞處理器
  - `src/utils/normalizeOptions.ts` - CLI 選項標準化工具
  - `tests/core/vulnerability-processor.test.ts` - 核心處理器測試

- **更新檔案**:
  - `src/cli.ts` - 重構為使用 `VulnerabilityProcessor`
  - `src/types.ts` - 新增 `exitOnHighSeverity` 選項支援

### 向後相容性

- ✅ **完全向後相容** - 所有現有 CLI 選項和行為保持不變
- ✅ **預設行為** - `--exit-on-high-severity` 預設為 `true`，維持原有的 CI/CD 友善行為

## [0.1.0] - 2025-08-08

### 新增功能

- 🎉 **首次公開發布**
- 🔧 **Trivy 掃描器支援** - 完整支援 Trivy 漏洞掃描報告，包含自動格式檢測
- 📊 **Excel 報告生成** - 生成包含摘要和詳細漏洞資訊的完整 Excel 報告
- 📢 **Microsoft Teams 通知** - 發送 Adaptive Cards 格式通知到 Teams 頻道，支援嚴重性顏色主題
- 🚫 **智能忽略機制** - 基於 YAML 的漏洞忽略規則，支援到期日期設定
- 🤖 **智能格式檢測** - 自動檢測掃描報告格式，無需手動指定
- 🔍 **詳細輸出模式** - 顯示完整漏洞資訊，便於調試和分析
- 🎯 **CI/CD 友善設計** - 根據漏洞嚴重性提供適當的退出碼，便於建置流程整合
- ⚡ **零配置啟動** - 開箱即用，無需複雜設定
- 🏗️ **Adapter 架構** - 可擴展設計，支援多種掃描器和通知平台

### 技術特性

- **CLI 介面** - 完整的命令列工具，提供豐富的選項
- **TypeScript 支援** - 完整的類型安全，嚴格的 TypeScript 配置
- **ESM 模組系統** - 現代 ES 模組支援
- **Node.js 18+ 支援** - 相容 Node.js 18 及以上版本
- **NPX 支援** - 無需安裝即可直接執行 `npx vuln-reporter`

### 測試與品質

- **80 個測試案例** - 涵蓋所有模組的完整測試覆蓋率
- **TDD 開發** - 測試驅動開發方法
- **ESLint + Prettier** - 程式碼品質和格式化標準
- **GitHub Actions CI** - 自動化測試和品質檢查
- **類型檢查** - 嚴格的 TypeScript 類型驗證

### 文件

- **完整的 README** - 詳細的使用說明和範例
- **開發者指南** - 完整的開發文件 (CLAUDE.md)
- **範例檔案** - 範例配置和使用腳本
- **API 文件** - TypeScript 類型定義和介面

### 配置

- **忽略規則** - `.vuln-ignore.yml` 用於管理漏洞例外
- **通知配置** - `.vuln-notify.yml` 用於通知平台設定
- **彈性輸出** - 可自訂 Excel 報告檔案名稱和位置

### 支援平台

- **掃描器**: Trivy (具備可擴展架構，支援未來新增掃描器)
- **通知**: Microsoft Teams (具備可擴展架構，可支援 Slack、Discord、Email 等)
- **作業系統**: Windows、macOS、Linux
- **套件管理器**: npm、pnpm、yarn

### 命令列選項

- `--input` / `-i` - 掃描報告 JSON 檔案路徑
- `--reporter-title` / `-t` - 報告標題
- `--scanner` / `-s` - 掃描器類型指定 (auto, trivy)
- `--verbose` / `-v` - 顯示詳細漏洞資訊
- `--details-url` / `-d` - 可選的詳細報告連結
- `--ignore-config` - 忽略規則配置檔案路徑
- `--notify-config` / `-n` - 通知配置檔案路徑
- `--output-file` / `-o` - Excel 報告輸出檔案路徑
- `--exit-on-high-severity` - 發現 Critical/High 漏洞時以非零退出碼退出 (預設: true)
- `--no-exit-on-high-severity` - 發現 Critical/High 漏洞時不以非零退出碼退出

### 退出碼

- `0` - 未發現新漏洞或僅有低/中等嚴重性問題
- `1` - 發現 Critical 或 High 嚴重性漏洞 (可透過 `--no-exit-on-high-severity` 停用)

---

## 未來發展規劃

### 計劃功能

- 🔧 **額外掃描器支援** - Snyk、OWASP Dependency Check、npm audit 等
- 📢 **更多通知平台** - Slack、Discord、Email、Webhook
- 📊 **額外報告格式** - PDF、HTML、JSON、CSV
- 🔍 **進階過濾** - 自訂嚴重性閾值、套件特定規則
- 🎯 **增強 CI/CD 整合** - 預建的 GitHub Actions、GitLab CI 範本

### 版本規劃

- `0.2.x` - 額外通知平台 (Slack、Discord)
- `0.3.x` - 額外掃描器支援 (Snyk、npm audit)
- `0.4.x` - 額外報告格式 (PDF、HTML)
- `1.0.0` - 經社群驗證的穩定 API

---

## 貢獻

歡迎貢獻！請參考我們的[開發指南](./CLAUDE.md)了解詳情：

- 設置開發環境
- 執行測試
- 程式碼風格指南
- 提交 Pull Request

## 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](./LICENSE) 檔案。
