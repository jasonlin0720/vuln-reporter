import type { StandardVulnerability, VulnerabilityScanner } from '../types.js';
import type { TrivyReport } from '../types/trivy-types.js';

export class TrivyParser implements VulnerabilityScanner {
  parseReport(report: TrivyReport): StandardVulnerability[] {
    const vulnerabilities: StandardVulnerability[] = [];

    for (const result of report.Results) {
      if (result.Vulnerabilities) {
        // 將 Trivy 格式轉換為標準格式
        const standardVulns = result.Vulnerabilities.map((vuln) =>
          this.convertToStandardFormat(vuln),
        );
        vulnerabilities.push(...standardVulns);
      }
    }

    return vulnerabilities;
  }

  private convertToStandardFormat(trivyVuln: any): StandardVulnerability {
    return {
      id: trivyVuln.VulnerabilityID,
      packageName: trivyVuln.PkgName,
      installedVersion: trivyVuln.InstalledVersion,
      fixedVersion: trivyVuln.FixedVersion,
      severity: trivyVuln.Severity,
      title: trivyVuln.Title,
      description: trivyVuln.Description,
      references: trivyVuln.PrimaryURL ? [trivyVuln.PrimaryURL] : undefined,
    };
  }
}
