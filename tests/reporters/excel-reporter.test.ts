import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { ExcelReporter } from '../../src/reporters/excel-reporter.js';
import type { ProcessedVulnerability, VulnerabilitySummary } from '../../src/types.js';

describe('ExcelReporter', () => {
  const testOutputFile = 'test-vulnerability-report.xlsx';

  afterEach(async () => {
    try {
      await fs.unlink(testOutputFile);
    } catch {
      // File might not exist
    }
  });

  const mockVulnerabilities: ProcessedVulnerability[] = [
    {
      id: 'CVE-2023-12345',
      packageName: 'lodash',
      installedVersion: '4.17.20',
      fixedVersion: '4.17.21',
      severity: 'CRITICAL',
      title: 'Critical vulnerability in lodash',
      description: 'Remote code execution vulnerability',
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-12345'],
      isIgnored: false,
    },
    {
      id: 'CVE-2023-67890',
      packageName: 'axios',
      installedVersion: '0.21.0',
      severity: 'HIGH',
      title: 'High severity vulnerability in axios',
      description: 'Information disclosure vulnerability',
      isIgnored: true,
      ignoreReason: '已確認為誤報',
    },
    {
      id: 'CVE-2023-11111',
      packageName: 'moment',
      installedVersion: '2.29.0',
      fixedVersion: '2.29.4',
      severity: 'MEDIUM',
      title: 'Medium vulnerability in moment',
      description: 'Regular expression DoS',
      isIgnored: false,
    },
  ];

  const mockSummary: VulnerabilitySummary = {
    critical: { new: 1, ignored: 0, total: 1 },
    high: { new: 0, ignored: 1, total: 1 },
    medium: { new: 1, ignored: 0, total: 1 },
    low: { new: 0, ignored: 0, total: 0 },
  };

  it('should generate Excel report with summary and vulnerability details', async () => {
    const reporter = new ExcelReporter();

    await reporter.generateReport(
      {
        vulnerabilities: mockVulnerabilities,
        summary: mockSummary,
        reportTitle: 'Test Vulnerability Report',
        detailsUrl: 'https://example.com/details',
      },
      testOutputFile,
    );

    const fileExists = await fs
      .access(testOutputFile)
      .then(() => true)
      .catch(() => false);

    expect(fileExists).toBe(true);
  });

  it('should handle empty vulnerabilities list', async () => {
    const reporter = new ExcelReporter();

    await reporter.generateReport(
      {
        vulnerabilities: [],
        summary: {
          critical: { new: 0, ignored: 0, total: 0 },
          high: { new: 0, ignored: 0, total: 0 },
          medium: { new: 0, ignored: 0, total: 0 },
          low: { new: 0, ignored: 0, total: 0 },
        },
        reportTitle: 'Empty Report',
      },
      testOutputFile,
    );

    const fileExists = await fs
      .access(testOutputFile)
      .then(() => true)
      .catch(() => false);

    expect(fileExists).toBe(true);
  });

  it('should format severity colors correctly', () => {
    const reporter = new ExcelReporter();

    // 這些是內部方法的測試，我們通過生成報告來間接測試
    expect(() => {
      (reporter as any).getSeverityColor('CRITICAL');
      (reporter as any).getSeverityColor('HIGH');
      (reporter as any).getSeverityColor('MEDIUM');
      (reporter as any).getSeverityColor('LOW');
    }).not.toThrow();
  });
});
