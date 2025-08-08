import { describe, it, expect } from 'vitest';
import { TrivyParser } from '../../src/parsers/trivy-parser.js';
import type { TrivyReport } from '../../src/types/trivy-types.js';

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
    expect(vulnerabilities[0].id).toBe('CVE-2023-12345');
    expect(vulnerabilities[0].packageName).toBe('lodash');
    expect(vulnerabilities[0].installedVersion).toBe('4.17.20');
    expect(vulnerabilities[0].fixedVersion).toBe('4.17.21');
    expect(vulnerabilities[0].severity).toBe('CRITICAL');
    expect(vulnerabilities[0].title).toBe('Test vulnerability');
    expect(vulnerabilities[0].description).toBe('Test description');
    expect(vulnerabilities[0].references).toEqual([
      'https://nvd.nist.gov/vuln/detail/CVE-2023-12345',
    ]);

    expect(vulnerabilities[1].id).toBe('CVE-2023-67890');
    expect(vulnerabilities[1].packageName).toBe('axios');
    expect(vulnerabilities[1].installedVersion).toBe('0.21.0');
    expect(vulnerabilities[1].severity).toBe('HIGH');
    expect(vulnerabilities[1].title).toBe('Another test vulnerability');
    expect(vulnerabilities[1].description).toBe('Another test description');
    expect(vulnerabilities[1].references).toBeUndefined();
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
