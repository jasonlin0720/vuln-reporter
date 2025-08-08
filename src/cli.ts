#!/usr/bin/env node
import { Command } from 'commander';
import type { CliOptions } from './types.js';
import { VulnerabilityProcessor } from './core/vulnerability-processor.js';

const program = new Command();

program
  .name('vuln-reporter')
  .description('通用型漏洞掃描與報告工具 - 支援多種掃描工具，生成 Excel 報告並發送 Teams 通知')
  .version('0.1.0');

program
  .requiredOption('-i, --input <file>', '掃描報告 JSON 檔案路徑 (支援 Trivy 等格式)')
  .requiredOption('-t, --reporter-title <title>', '報告標題')
  .option('-s, --scanner <type>', '指定掃描工具類型 (auto, trivy)', 'auto')
  .option('-v, --verbose', '顯示詳細的漏洞資訊', false)
  .option('-d, --details-url <url>', '詳細報告連結 (可選)')
  .option('--ignore-config <file>', '忽略規則配置檔案路徑', '.vuln-ignore.yml')
  .option('-n, --notify-config <file>', '通知器配置檔案路徑', '.vuln-notify.yml')
  .option('-o, --output-file <file>', 'Excel 報告輸出檔案路徑', 'vulnerability-report.xlsx')
  .option('--exit-on-high-severity', '在發現 Critical 或 High 嚴重性漏洞時以非零退出碼退出', true)
  .option(
    '--no-exit-on-high-severity',
    '在發現 Critical 或 High 嚴重性漏洞時不以非零退出碼退出',
    false,
  )
  .action(async (options: CliOptions) => {
    try {
      const vulnerabilityProcessor = new VulnerabilityProcessor();
      const success = await vulnerabilityProcessor.processReport(options);

      if (!success) {
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ 執行失敗:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// 錯誤處理
process.on('unhandledRejection', (reason) => {
  console.error('未處理的 Promise 拒絕:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('未捕獲的例外:', error);
  process.exit(1);
});

program.parse();
