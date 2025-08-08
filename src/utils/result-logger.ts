import type { ProcessedVulnerability, VulnerabilitySummary } from '../types.js';

export interface LoggerOptions {
  verbose?: boolean;
}

export class ResultLogger {
  private options: LoggerOptions;

  constructor(options: LoggerOptions = {}) {
    this.options = options;
  }

  /**
   * 輸出處理結果摘要
   */
  logSummary(summary: VulnerabilitySummary): void {
    const totalNew = summary.critical.new + summary.high.new + summary.medium.new + summary.low.new;
    const totalIgnored =
      summary.critical.ignored +
      summary.high.ignored +
      summary.medium.ignored +
      summary.low.ignored;

    console.log(`📊 處理結果: ${totalNew} 個新漏洞, ${totalIgnored} 個已忽略漏洞`);
    console.log(
      `   - Critical: ${summary.critical.new} 新發現, ${summary.critical.ignored} 已忽略`,
    );
    console.log(`   - High: ${summary.high.new} 新發現, ${summary.high.ignored} 已忽略`);
    console.log(`   - Medium: ${summary.medium.new} 新發現, ${summary.medium.ignored} 已忽略`);
    console.log(`   - Low: ${summary.low.new} 新發現, ${summary.low.ignored} 已忽略`);
  }

  /**
   * 輸出詳細漏洞資訊
   */
  logDetailedVulnerabilities(processedVulnerabilities: ProcessedVulnerability[]): void {
    if (!this.options.verbose) {
      return;
    }

    console.log('\n📋 詳細漏洞資訊:');
    console.log('─'.repeat(80));

    const severityOrder: Array<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'> = [
      'CRITICAL',
      'HIGH',
      'MEDIUM',
      'LOW',
    ];
    const groupedVulns = this.groupVulnerabilitiesBySeverity(processedVulnerabilities);

    severityOrder.forEach((severity) => {
      const vulns = groupedVulns[severity];
      if (!vulns || vulns.length === 0) return;

      this.logSeverityGroup(severity, vulns);
    });

    console.log('─'.repeat(80));
  }

  /**
   * 輸出完整處理結果（摘要 + 詳細資訊）
   */
  logResults(
    summary: VulnerabilitySummary,
    processedVulnerabilities: ProcessedVulnerability[],
  ): void {
    this.logSummary(summary);
    this.logDetailedVulnerabilities(processedVulnerabilities);
  }

  /**
   * 按嚴重程度分組漏洞
   */
  private groupVulnerabilitiesBySeverity(
    vulnerabilities: ProcessedVulnerability[],
  ): Record<string, ProcessedVulnerability[]> {
    return vulnerabilities.reduce(
      (acc, vuln) => {
        if (!acc[vuln.severity]) acc[vuln.severity] = [];
        acc[vuln.severity].push(vuln);
        return acc;
      },
      {} as Record<string, ProcessedVulnerability[]>,
    );
  }

  /**
   * 輸出特定嚴重程度的漏洞組
   */
  private logSeverityGroup(severity: string, vulnerabilities: ProcessedVulnerability[]): void {
    const severityIcon = this.getSeverityIcon(severity);

    console.log(`\n${severityIcon} ${severity} 漏洞 (${vulnerabilities.length} 個):`);
    console.log('─'.repeat(40));

    vulnerabilities.forEach((vuln, index) => {
      this.logSingleVulnerability(vuln, index + 1, index < vulnerabilities.length - 1);
    });
  }

  /**
   * 輸出單個漏洞的詳細資訊
   */
  private logSingleVulnerability(
    vuln: ProcessedVulnerability,
    number: number,
    hasMore: boolean,
  ): void {
    const status = vuln.isIgnored ? '🔇 已忽略' : '🆕 新發現';

    console.log(`${number}. [${status}] ${vuln.id}`);
    console.log(`   套件: ${vuln.packageName} (${vuln.installedVersion})`);
    console.log(`   標題: ${vuln.title}`);

    if (vuln.fixedVersion) {
      console.log(`   修復版本: ${vuln.fixedVersion}`);
    }

    if (vuln.isIgnored && vuln.ignoreReason) {
      console.log(`   忽略原因: ${vuln.ignoreReason}`);
    }

    if (vuln.references && vuln.references.length > 0) {
      console.log(`   參考連結: ${vuln.references[0]}`);
    }

    if (hasMore) {
      console.log('');
    }
  }

  /**
   * 取得嚴重程度對應的圖示
   */
  private getSeverityIcon(severity: string): string {
    const icons: Record<string, string> = {
      CRITICAL: '🔴',
      HIGH: '🟠',
      MEDIUM: '🟡',
      LOW: '🟢',
    };
    return icons[severity] || '⚪';
  }

  /**
   * 計算統計數據
   */
  calculateTotals(summary: VulnerabilitySummary): { totalNew: number; totalIgnored: number } {
    const totalNew = summary.critical.new + summary.high.new + summary.medium.new + summary.low.new;
    const totalIgnored =
      summary.critical.ignored +
      summary.high.ignored +
      summary.medium.ignored +
      summary.low.ignored;

    return { totalNew, totalIgnored };
  }
}
