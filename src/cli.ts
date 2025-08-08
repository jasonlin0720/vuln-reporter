#!/usr/bin/env node
import { Command } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';
import { ParserRegistry } from './parsers/parser-registry.js';
import { IgnoreFilter } from './utils/ignore-filter.js';
import { ConfigLoader } from './utils/config-loader.js';
import { ExcelReporter } from './reporters/excel-reporter.js';
import { NotifierRegistry } from './notifiers/notifier-registry.js';
import { NotifyConfigLoader } from './utils/notify-config-loader.js';
import { ResultLogger } from './utils/result-logger.js';
import type { CliOptions, NormalizedCliOptions } from './types.js';

const program = new Command();

program
  .name('vuln-reporter')
  .description('通用型漏洞掃描與報告工具 - 支援多種掃描工具，生成 Excel 報告並發送 Teams 通知')
  .version('1.0.0');

program
  .requiredOption('-i, --input <file>', '掃描報告 JSON 檔案路徑 (支援 Trivy 等格式)')
  .requiredOption('-t, --reporter-title <title>', '報告標題')
  .option('-s, --scanner <type>', '指定掃描工具類型 (auto, trivy)', 'auto')
  .option('-v, --verbose', '顯示詳細的漏洞資訊', false)
  .option('-d, --details-url <url>', '詳細報告連結 (可選)')
  .option('--ignore-config <file>', '忽略規則配置檔案路徑', '.vuln-ignore.yml')
  .option('-n, --notify-config <file>', '通知器配置檔案路徑', '.vuln-notify.yml')
  .option('-o, --output-file <file>', 'Excel 報告輸出檔案路徑', 'vulnerability-report.xlsx')
  .action(async (options: CliOptions) => {
    try {
      const normalizedOptions = normalizeOptions(options);
      await processVulnerabilityReport(normalizedOptions);
    } catch (error) {
      console.error('❌ 執行失敗:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

/**
 * 標準化 CLI 選項，補齊所有預設值
 */
function normalizeOptions(options: CliOptions): NormalizedCliOptions {
  return {
    input: options.input,
    reporterTitle: options.reporterTitle,
    scanner: options.scanner || 'auto',
    verbose: options.verbose || false,
    detailsUrl: options.detailsUrl,
    ignoreConfig: options.ignoreConfig || '.vuln-ignore.yml',
    notifyConfig: options.notifyConfig || '.vuln-notify.yml',
    outputFile: options.outputFile || 'vulnerability-report.xlsx',
  };
}

async function processVulnerabilityReport(options: NormalizedCliOptions): Promise<void> {
  console.log('🔍 開始處理漏洞掃描報告...');

  // 1. 讀取並解析掃描報告
  console.log('📖 讀取掃描報告檔案...');
  const reportContent = await fs.readFile(options.input, 'utf-8');
  const reportData = JSON.parse(reportContent);

  // 2. 初始化解析器註冊表
  const parserRegistry = new ParserRegistry();

  // 3. 自動檢測或手動指定解析器
  let parserResult;
  if (options.scanner !== 'auto') {
    const parser = parserRegistry.getParser(options.scanner);
    if (!parser) {
      throw new Error(
        `不支援的掃描工具類型: ${options.scanner}。支援的類型: ${parserRegistry.listAvailableParsers().join(', ')}`,
      );
    }
    parserResult = { parser, scannerType: options.scanner };
    console.log(`📋 使用指定的解析器: ${options.scanner}`);
  } else {
    parserResult = parserRegistry.detectParser(reportData);
    console.log(`🔍 自動檢測到掃描工具: ${parserResult.scannerType}`);
  }

  // 4. 解析漏洞報告
  const vulnerabilities = parserResult.parser.parseReport(reportData);
  console.log(`✅ 解析完成，發現 ${vulnerabilities.length} 個漏洞`);

  // 5. 載入忽略規則
  console.log(`📋 載入漏洞忽略規則: ${options.ignoreConfig}`);
  const configLoader = new ConfigLoader();
  const ignoreConfig = await configLoader.loadConfig(options.ignoreConfig);
  console.log(`✅ 載入 ${ignoreConfig.rules.length} 條忽略規則`);

  // 6. 套用忽略規則並生成摘要
  const ignoreFilter = new IgnoreFilter(ignoreConfig.rules);
  const processedVulnerabilities = ignoreFilter.processVulnerabilities(vulnerabilities);
  const summary = ignoreFilter.generateSummary(processedVulnerabilities);

  // 6.1. 初始化結果記錄器並輸出處理結果
  const resultLogger = new ResultLogger({ verbose: options.verbose });
  resultLogger.logResults(summary, processedVulnerabilities);
  const { totalNew } = resultLogger.calculateTotals(summary);

  // 7. 生成 Excel 報告
  const outputPath = path.resolve(options.outputFile);

  console.log(`📊 生成 Excel 報告: ${outputPath}`);
  const excelReporter = new ExcelReporter();
  await excelReporter.generateReport(
    {
      vulnerabilities: processedVulnerabilities,
      summary,
      reportTitle: options.reporterTitle,
      detailsUrl: options.detailsUrl,
    },
    outputPath,
  );
  console.log('✅ Excel 報告生成完成');

  // 8. 載入通知器配置並發送通知
  console.log(`📋 載入通知器配置: ${options.notifyConfig}`);
  const notifyConfigLoader = new NotifyConfigLoader();
  const config = await notifyConfigLoader.loadNotifyConfig(options.notifyConfig);
  const notifierConfigs = config.notifiers;

  // 發送通知
  if (notifierConfigs.length > 0) {
    console.log('📢 發送通知...');
    const notifierRegistry = new NotifierRegistry();

    try {
      await notifierRegistry.sendNotifications(
        {
          summary,
          reportTitle: options.reporterTitle,
          detailsUrl: options.detailsUrl,
        },
        notifierConfigs,
      );
      console.log('✅ 所有通知發送完成');
    } catch (error) {
      console.error('❌ 通知發送失敗:', error instanceof Error ? error.message : error);
      // 通知失敗不應該讓整個程式中斷，只記錄錯誤
    }
  } else {
    console.log('ℹ️ 未配置通知器，跳過通知發送');
  }

  console.log('🎉 所有任務完成!');

  // 提供使用統計
  if (totalNew > 0) {
    if (summary.critical.new > 0 || summary.high.new > 0) {
      console.log('⚠️  請注意: 發現高嚴重性漏洞，建議立即處理');
      process.exit(1); // 返回非零退出碼以便 CI/CD 系統偵測
    } else {
      console.log('ℹ️  發現中低嚴重性漏洞，建議定期處理');
    }
  } else {
    console.log('✨ 恭喜! 未發現任何新漏洞');
  }
}

// 錯誤處理
process.on('unhandledRejection', (reason) => {
  console.error('未處理的 Promise 拒絕:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('未捕獲的例外:', error);
  process.exit(1);
});

// 直接執行解析，無論如何都執行
program.parse();
