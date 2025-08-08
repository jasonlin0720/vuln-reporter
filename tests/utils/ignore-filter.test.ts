import { describe, it, expect } from 'vitest';
import { IgnoreFilter } from '../../src/utils/ignore-filter.js';
import type { VulnerabilityResult, VulnIgnoreRule } from '../../src/types.js';

describe('IgnoreFilter', () => {
  const mockVulnerabilities: VulnerabilityResult[] = [
    {
      VulnerabilityID: 'CVE-2023-12345',
      PkgName: 'lodash',
      InstalledVersion: '4.17.20',
      Severity: 'CRITICAL',
      Title: 'Test vulnerability 1',
      Description: 'Test description 1',
    },
    {
      VulnerabilityID: 'CVE-2023-67890',
      PkgName: 'axios',
      InstalledVersion: '0.21.0',
      Severity: 'HIGH',
      Title: 'Test vulnerability 2',
      Description: 'Test description 2',
    },
    {
      VulnerabilityID: 'CVE-2023-11111',
      PkgName: 'lodash',
      InstalledVersion: '4.17.20',
      Severity: 'MEDIUM',
      Title: 'Test vulnerability 3',
      Description: 'Test description 3',
    },
  ];

  it('should ignore vulnerability by CVE only', () => {
    const ignoreRules: VulnIgnoreRule[] = [
      {
        cve: 'CVE-2023-12345',
        reason: '已確認為誤報',
      },
    ];

    const filter = new IgnoreFilter(ignoreRules);
    const result = filter.processVulnerabilities(mockVulnerabilities);

    expect(result).toHaveLength(3);
    expect(result[0].isIgnored).toBe(true);
    expect(result[0].ignoreReason).toBe('已確認為誤報');
    expect(result[1].isIgnored).toBe(false);
    expect(result[2].isIgnored).toBe(false);
  });

  it('should ignore vulnerability by CVE and package', () => {
    const ignoreRules: VulnIgnoreRule[] = [
      {
        cve: 'CVE-2023-11111',
        package: 'lodash',
        reason: '僅在特定套件中忽略',
      },
    ];

    const filter = new IgnoreFilter(ignoreRules);
    const result = filter.processVulnerabilities(mockVulnerabilities);

    expect(result).toHaveLength(3);
    expect(result[0].isIgnored).toBe(false);
    expect(result[1].isIgnored).toBe(false);
    expect(result[2].isIgnored).toBe(true);
    expect(result[2].ignoreReason).toBe('僅在特定套件中忽略');
  });

  it('should not ignore expired rules', () => {
    const ignoreRules: VulnIgnoreRule[] = [
      {
        cve: 'CVE-2023-12345',
        expires: '2023-01-01',
        reason: '已過期的忽略規則',
      },
    ];

    const filter = new IgnoreFilter(ignoreRules);
    const result = filter.processVulnerabilities(mockVulnerabilities);

    expect(result).toHaveLength(3);
    expect(result[0].isIgnored).toBe(false);
  });

  it('should ignore future expiry rules', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];

    const ignoreRules: VulnIgnoreRule[] = [
      {
        cve: 'CVE-2023-12345',
        expires: futureDateString,
        reason: '未來到期的規則',
      },
    ];

    const filter = new IgnoreFilter(ignoreRules);
    const result = filter.processVulnerabilities(mockVulnerabilities);

    expect(result).toHaveLength(3);
    expect(result[0].isIgnored).toBe(true);
    expect(result[0].ignoreReason).toBe('未來到期的規則');
  });

  it('should generate summary correctly', () => {
    const ignoreRules: VulnIgnoreRule[] = [
      {
        cve: 'CVE-2023-12345',
        reason: '忽略嚴重漏洞',
      },
    ];

    const filter = new IgnoreFilter(ignoreRules);
    const processedVulns = filter.processVulnerabilities(mockVulnerabilities);
    const summary = filter.generateSummary(processedVulns);

    expect(summary.critical.total).toBe(1);
    expect(summary.critical.ignored).toBe(1);
    expect(summary.critical.new).toBe(0);

    expect(summary.high.total).toBe(1);
    expect(summary.high.ignored).toBe(0);
    expect(summary.high.new).toBe(1);

    expect(summary.medium.total).toBe(1);
    expect(summary.medium.ignored).toBe(0);
    expect(summary.medium.new).toBe(1);
  });

  it('should handle empty rules', () => {
    const filter = new IgnoreFilter([]);
    const result = filter.processVulnerabilities(mockVulnerabilities);

    expect(result).toHaveLength(3);
    expect(result.every((v) => !v.isIgnored)).toBe(true);
  });
});
