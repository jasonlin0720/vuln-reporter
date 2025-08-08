#!/usr/bin/env node
import { Command } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';
import { TrivyParser } from './parsers/trivy-parser.js';
import { IgnoreFilter } from './utils/ignore-filter.js';
import { ConfigLoader } from './utils/config-loader.js';
import { ExcelReporter } from './reporters/excel-reporter.js';
import { TeamsNotifier } from './notifiers/teams-notifier.js';
import type { TrivyReport, CliOptions } from './types.js';

const program = new Command();

program
  .name('vuln-reporter')
  .description(
    '通用型漏洞掃描與報告工具 - 用於解析 Trivy 掃描結果、生成 Excel 報告並發送 Teams 通知',
  )
  .version('1.0.0');

program
  .requiredOption('-i, --input <file>', 'Trivy JSON 報告檔案路徑')
  .requiredOption('-t, --reporter-title <title>', '報告標題')
  .option('-d, --details-url <url>', '詳細報告連結 (可選)')
  .option('-w, --teams-webhook-url <url>', 'Microsoft Teams Webhook URL (可選)')
  .option('-o, --output-file <file>', 'Excel 報告輸出檔案路徑 (預設: vulnerability-report.xlsx)')
  .action(async (options: CliOptions) => {
    try {
      await processVulnerabilityReport(options);
    } catch (error) {
      console.error('❌ 執行失敗:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

async function processVulnerabilityReport(options: CliOptions): Promise<void> {
  console.log('🔍 開始處理漏洞掃描報告...');

  // 1. 讀取並解析 Trivy 報告
  console.log('📖 讀取 Trivy 報告檔案...');
  const trivyReportContent = await fs.readFile(options.input, 'utf-8');
  const trivyReport: TrivyReport = JSON.parse(trivyReportContent);

  const parser = new TrivyParser();
  const vulnerabilities = parser.parseReport(trivyReport);
  console.log(`✅ 解析完成，發現 ${vulnerabilities.length} 個漏洞`);

  // 2. 載入忽略規則
  console.log('📋 載入漏洞忽略規則...');
  const configLoader = new ConfigLoader();
  const ignoreConfig = await configLoader.loadConfig('.vuln-ignore.yml');
  console.log(`✅ 載入 ${ignoreConfig.rules.length} 條忽略規則`);

  // 3. 套用忽略規則並生成摘要
  const ignoreFilter = new IgnoreFilter(ignoreConfig.rules);
  const processedVulnerabilities = ignoreFilter.processVulnerabilities(vulnerabilities);
  const summary = ignoreFilter.generateSummary(processedVulnerabilities);

  const totalNew = summary.critical.new + summary.high.new + summary.medium.new + summary.low.new;
  const totalIgnored =
    summary.critical.ignored + summary.high.ignored + summary.medium.ignored + summary.low.ignored;

  console.log(`📊 處理結果: ${totalNew} 個新漏洞, ${totalIgnored} 個已忽略漏洞`);
  console.log(`   - Critical: ${summary.critical.new} 新發現, ${summary.critical.ignored} 已忽略`);
  console.log(`   - High: ${summary.high.new} 新發現, ${summary.high.ignored} 已忽略`);
  console.log(`   - Medium: ${summary.medium.new} 新發現, ${summary.medium.ignored} 已忽略`);
  console.log(`   - Low: ${summary.low.new} 新發現, ${summary.low.ignored} 已忽略`);

  // 4. 生成 Excel 報告
  const outputFile = options.outputFile || 'vulnerability-report.xlsx';
  const outputPath = path.resolve(outputFile);

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

  // 5. 發送 Teams 通知 (如果提供 webhook URL)
  if (options.teamsWebhookUrl) {
    console.log('📢 發送 Microsoft Teams 通知...');
    const teamsNotifier = new TeamsNotifier();
    await teamsNotifier.sendNotification({
      webhookUrl: options.teamsWebhookUrl,
      summary,
      reportTitle: options.reporterTitle,
      detailsUrl: options.detailsUrl,
    });
    console.log('✅ Teams 通知發送完成');
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
process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的 Promise 拒絕:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('未捕獲的例外:', error);
  process.exit(1);
});

// 直接執行解析，無論如何都執行
program.parse();
