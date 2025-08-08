import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ResultLogger } from '../../src/utils/result-logger.js';
import type { ProcessedVulnerability, VulnerabilitySummary } from '../../src/types.js';

describe('ResultLogger', () => {
  let consoleLogSpy: any;

  const mockSummary: VulnerabilitySummary = {
    critical: { new: 1, ignored: 0, total: 1 },
    high: { new: 1, ignored: 1, total: 2 },
    medium: { new: 2, ignored: 0, total: 2 },
    low: { new: 0, ignored: 1, total: 1 },
  };

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
    {
      id: 'CVE-2023-22222',
      packageName: 'react',
      installedVersion: '17.0.0',
      fixedVersion: '17.0.2',
      severity: 'MEDIUM',
      title: 'Another medium vulnerability',
      description: 'Cross-site scripting vulnerability',
      isIgnored: false,
    },
    {
      id: 'CVE-2023-33333',
      packageName: 'express',
      installedVersion: '4.17.0',
      severity: 'HIGH',
      title: 'Express vulnerability',
      description: 'Path traversal vulnerability',
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-33333'],
      isIgnored: false,
    },
    {
      id: 'CVE-2023-44444',
      packageName: 'word-wrap',
      installedVersion: '1.2.3',
      fixedVersion: '1.2.4',
      severity: 'LOW',
      title: 'Low severity vulnerability',
      description: 'ReDoS vulnerability',
      isIgnored: true,
      ignoreReason: '開發依賴套件',
    },
  ];

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create logger with default options', () => {
      const logger = new ResultLogger();
      expect(logger).toBeInstanceOf(ResultLogger);
    });

    it('should create logger with custom options', () => {
      const logger = new ResultLogger({ verbose: true });
      expect(logger).toBeInstanceOf(ResultLogger);
    });
  });

  describe('logSummary', () => {
    it('should log summary statistics correctly', () => {
      const logger = new ResultLogger();
      logger.logSummary(mockSummary);

      expect(consoleLogSpy).toHaveBeenCalledWith('📊 處理結果: 4 個新漏洞, 2 個已忽略漏洞');
      expect(consoleLogSpy).toHaveBeenCalledWith('   - Critical: 1 新發現, 0 已忽略');
      expect(consoleLogSpy).toHaveBeenCalledWith('   - High: 1 新發現, 1 已忽略');
      expect(consoleLogSpy).toHaveBeenCalledWith('   - Medium: 2 新發現, 0 已忽略');
      expect(consoleLogSpy).toHaveBeenCalledWith('   - Low: 0 新發現, 1 已忽略');
    });

    it('should handle empty summary', () => {
      const emptySummary: VulnerabilitySummary = {
        critical: { new: 0, ignored: 0, total: 0 },
        high: { new: 0, ignored: 0, total: 0 },
        medium: { new: 0, ignored: 0, total: 0 },
        low: { new: 0, ignored: 0, total: 0 },
      };

      const logger = new ResultLogger();
      logger.logSummary(emptySummary);

      expect(consoleLogSpy).toHaveBeenCalledWith('📊 處理結果: 0 個新漏洞, 0 個已忽略漏洞');
    });
  });

  describe('logDetailedVulnerabilities', () => {
    it('should not log details when verbose is false', () => {
      const logger = new ResultLogger({ verbose: false });
      logger.logDetailedVulnerabilities(mockVulnerabilities);

      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('詳細漏洞資訊'));
    });

    it('should log detailed vulnerabilities when verbose is true', () => {
      const logger = new ResultLogger({ verbose: true });
      logger.logDetailedVulnerabilities(mockVulnerabilities);

      expect(consoleLogSpy).toHaveBeenCalledWith('\n📋 詳細漏洞資訊:');
      expect(consoleLogSpy).toHaveBeenCalledWith('─'.repeat(80));

      // 檢查是否包含各種嚴重程度的標題
      expect(consoleLogSpy).toHaveBeenCalledWith('\n🔴 CRITICAL 漏洞 (1 個):');
      expect(consoleLogSpy).toHaveBeenCalledWith('\n🟠 HIGH 漏洞 (2 個):');
      expect(consoleLogSpy).toHaveBeenCalledWith('\n🟡 MEDIUM 漏洞 (2 個):');
      expect(consoleLogSpy).toHaveBeenCalledWith('\n🟢 LOW 漏洞 (1 個):');
    });

    it('should display vulnerability details correctly', () => {
      const logger = new ResultLogger({ verbose: true });
      logger.logDetailedVulnerabilities(mockVulnerabilities);

      // 檢查 CRITICAL 漏洞詳情
      expect(consoleLogSpy).toHaveBeenCalledWith('1. [🆕 新發現] CVE-2023-12345');
      expect(consoleLogSpy).toHaveBeenCalledWith('   套件: lodash (4.17.20)');
      expect(consoleLogSpy).toHaveBeenCalledWith('   標題: Critical vulnerability in lodash');
      expect(consoleLogSpy).toHaveBeenCalledWith('   修復版本: 4.17.21');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '   參考連結: https://nvd.nist.gov/vuln/detail/CVE-2023-12345',
      );

      // 檢查已忽略漏洞
      expect(consoleLogSpy).toHaveBeenCalledWith('1. [🔇 已忽略] CVE-2023-67890');
      expect(consoleLogSpy).toHaveBeenCalledWith('   忽略原因: 已確認為誤報');
    });

    it('should handle empty vulnerabilities list', () => {
      const logger = new ResultLogger({ verbose: true });
      logger.logDetailedVulnerabilities([]);

      expect(consoleLogSpy).toHaveBeenCalledWith('\n📋 詳細漏洞資訊:');
      expect(consoleLogSpy).toHaveBeenCalledWith('─'.repeat(80));
      // 不應該有任何嚴重程度的標題
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('🔴'));
    });
  });

  describe('logResults', () => {
    it('should call both logSummary and logDetailedVulnerabilities', () => {
      const logger = new ResultLogger({ verbose: true });
      const logSummarySpy = vi.spyOn(logger, 'logSummary');
      const logDetailedSpy = vi.spyOn(logger, 'logDetailedVulnerabilities');

      logger.logResults(mockSummary, mockVulnerabilities);

      expect(logSummarySpy).toHaveBeenCalledWith(mockSummary);
      expect(logDetailedSpy).toHaveBeenCalledWith(mockVulnerabilities);
    });
  });

  describe('calculateTotals', () => {
    it('should calculate totals correctly', () => {
      const logger = new ResultLogger();
      const totals = logger.calculateTotals(mockSummary);

      expect(totals.totalNew).toBe(4);
      expect(totals.totalIgnored).toBe(2);
    });

    it('should handle zero totals', () => {
      const emptySummary: VulnerabilitySummary = {
        critical: { new: 0, ignored: 0, total: 0 },
        high: { new: 0, ignored: 0, total: 0 },
        medium: { new: 0, ignored: 0, total: 0 },
        low: { new: 0, ignored: 0, total: 0 },
      };

      const logger = new ResultLogger();
      const totals = logger.calculateTotals(emptySummary);

      expect(totals.totalNew).toBe(0);
      expect(totals.totalIgnored).toBe(0);
    });
  });

  describe('private methods via public interface', () => {
    it('should group vulnerabilities by severity correctly', () => {
      const logger = new ResultLogger({ verbose: true });
      logger.logDetailedVulnerabilities(mockVulnerabilities);

      // 驗證分組是否正確 - 透過檢查輸出來驗證
      expect(consoleLogSpy).toHaveBeenCalledWith('\n🔴 CRITICAL 漏洞 (1 個):');
      expect(consoleLogSpy).toHaveBeenCalledWith('\n🟠 HIGH 漏洞 (2 個):');
      expect(consoleLogSpy).toHaveBeenCalledWith('\n🟡 MEDIUM 漏洞 (2 個):');
      expect(consoleLogSpy).toHaveBeenCalledWith('\n🟢 LOW 漏洞 (1 個):');
    });

    it('should display correct severity icons', () => {
      const logger = new ResultLogger({ verbose: true });
      logger.logDetailedVulnerabilities(mockVulnerabilities);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('🔴'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('🟠'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('🟡'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('🟢'));
    });
  });
});
