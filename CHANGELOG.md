# 更新日誌

本專案的所有重要變更都會記錄在此檔案中。

格式基於 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)，
版本號遵循 [語義化版本](https://semver.org/spec/v2.0.0.html) 規範。

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

- **64 個測試案例** - 涵蓋所有模組的完整測試覆蓋率
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

### 退出碼

- `0` - 未發現新漏洞或僅有低/中等嚴重性問題
- `1` - 發現 Critical 或 High 嚴重性漏洞

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
