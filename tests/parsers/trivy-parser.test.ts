import { describe, it, expect } from 'vitest';
import { TrivyParser } from '../../src/parsers/trivy-parser.js';
import type { TrivyReport } from '../../src/types.js';

describe('TrivyParser', () => {
  const mockTrivyReport: TrivyReport = {
    SchemaVersion: 2,
    CreatedAt: '2024-01-01T00:00:00Z',
    Results: [
      {
        Target: 'package.json',
        Class: 'lang-pkgs',
        Type: 'npm',
        Vulnerabilities: [
          {
            VulnerabilityID: 'CVE-2023-12345',
            PkgName: 'lodash',
            InstalledVersion: '4.17.20',
            FixedVersion: '4.17.21',
            Severity: 'CRITICAL',
            Title: 'Test vulnerability',
            Description: 'Test description',
            PrimaryURL: 'https://nvd.nist.gov/vuln/detail/CVE-2023-12345',
          },
          {
            VulnerabilityID: 'CVE-2023-67890',
            PkgName: 'axios',
            InstalledVersion: '0.21.0',
            Severity: 'HIGH',
            Title: 'Another test vulnerability',
            Description: 'Another test description',
          },
        ],
      },
    ],
  };

  it('should parse trivy report and extract vulnerabilities', () => {
    const parser = new TrivyParser();
    const vulnerabilities = parser.parseReport(mockTrivyReport);

    expect(vulnerabilities).toHaveLength(2);
    expect(vulnerabilities[0].VulnerabilityID).toBe('CVE-2023-12345');
    expect(vulnerabilities[1].VulnerabilityID).toBe('CVE-2023-67890');
  });

  it('should handle empty results', () => {
    const parser = new TrivyParser();
    const emptyReport: TrivyReport = {
      SchemaVersion: 2,
      CreatedAt: '2024-01-01T00:00:00Z',
      Results: [],
    };

    const vulnerabilities = parser.parseReport(emptyReport);
    expect(vulnerabilities).toHaveLength(0);
  });

  it('should handle targets without vulnerabilities', () => {
    const parser = new TrivyParser();
    const reportWithoutVulns: TrivyReport = {
      SchemaVersion: 2,
      CreatedAt: '2024-01-01T00:00:00Z',
      Results: [
        {
          Target: 'clean-package.json',
          Class: 'lang-pkgs',
          Type: 'npm',
        },
      ],
    };

    const vulnerabilities = parser.parseReport(reportWithoutVulns);
    expect(vulnerabilities).toHaveLength(0);
  });
});
