import * as XLSX from 'xlsx';
import type { ProcessedVulnerability, VulnerabilitySummary } from '../types.js';

export interface ReportData {
  vulnerabilities: ProcessedVulnerability[];
  summary: VulnerabilitySummary;
  reportTitle: string;
  detailsUrl?: string;
}

export class ExcelReporter {
  async generateReport(data: ReportData, outputPath: string): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // 建立摘要工作表
    this.createSummarySheet(workbook, data);

    // 建立漏洞詳情工作表
    this.createVulnerabilitySheet(workbook, data.vulnerabilities);

    // 寫入檔案
    XLSX.writeFile(workbook, outputPath);
  }

  private createSummarySheet(workbook: XLSX.WorkBook, data: ReportData): void {
    const summaryData = [
      ['漏洞掃描報告摘要', ''],
      ['報告標題', data.reportTitle],
      ['生成時間', new Date().toISOString()],
      ['詳情連結', data.detailsUrl || 'N/A'],
      [''],
      ['嚴重程度', '新發現', '已忽略', '總計'],
      [
        'Critical',
        data.summary.critical.new,
        data.summary.critical.ignored,
        data.summary.critical.total,
      ],
      ['High', data.summary.high.new, data.summary.high.ignored, data.summary.high.total],
      ['Medium', data.summary.medium.new, data.summary.medium.ignored, data.summary.medium.total],
      ['Low', data.summary.low.new, data.summary.low.ignored, data.summary.low.total],
      [''],
      [
        '總漏洞數',
        data.summary.critical.total +
          data.summary.high.total +
          data.summary.medium.total +
          data.summary.low.total,
      ],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    // 設定欄寬
    summarySheet['!cols'] = [{ width: 20 }, { width: 15 }, { width: 15 }, { width: 15 }];

    XLSX.utils.book_append_sheet(workbook, summarySheet, '摘要');
  }

  private createVulnerabilitySheet(
    workbook: XLSX.WorkBook,
    vulnerabilities: ProcessedVulnerability[],
  ): void {
    if (vulnerabilities.length === 0) {
      const emptySheet = XLSX.utils.aoa_to_sheet([['沒有發現漏洞']]);
      XLSX.utils.book_append_sheet(workbook, emptySheet, '漏洞詳情');
      return;
    }

    const headers = [
      'CVE ID',
      '套件名稱',
      '已安裝版本',
      '修復版本',
      '嚴重程度',
      '標題',
      '描述',
      '參考連結',
      '狀態',
      '忽略原因',
    ];

    const rows = vulnerabilities.map((vuln) => [
      vuln.VulnerabilityID,
      vuln.PkgName,
      vuln.InstalledVersion,
      vuln.FixedVersion || 'N/A',
      vuln.Severity,
      vuln.Title,
      vuln.Description,
      vuln.PrimaryURL || 'N/A',
      vuln.isIgnored ? '已忽略' : '新發現',
      vuln.ignoreReason || 'N/A',
    ]);

    const sheetData = [headers, ...rows];
    const vulnSheet = XLSX.utils.aoa_to_sheet(sheetData);

    // 設定欄寬
    vulnSheet['!cols'] = [
      { width: 20 }, // CVE ID
      { width: 15 }, // 套件名稱
      { width: 15 }, // 已安裝版本
      { width: 15 }, // 修復版本
      { width: 12 }, // 嚴重程度
      { width: 30 }, // 標題
      { width: 50 }, // 描述
      { width: 40 }, // 參考連結
      { width: 10 }, // 狀態
      { width: 20 }, // 忽略原因
    ];

    XLSX.utils.book_append_sheet(workbook, vulnSheet, '漏洞詳情');
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      CRITICAL: 'FF0000', // 紅色
      HIGH: 'FF8C00', // 橙色
      MEDIUM: 'FFD700', // 金色
      LOW: '32CD32', // 綠色
    };

    return colors[severity as keyof typeof colors] || '000000';
  }
}
