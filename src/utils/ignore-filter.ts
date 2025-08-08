import type {
  VulnerabilityResult,
  VulnIgnoreRule,
  ProcessedVulnerability,
  VulnerabilitySummary,
} from '../types.js';

export class IgnoreFilter {
  private rules: VulnIgnoreRule[];

  constructor(rules: VulnIgnoreRule[]) {
    this.rules = rules;
  }

  processVulnerabilities(vulnerabilities: VulnerabilityResult[]): ProcessedVulnerability[] {
    return vulnerabilities.map((vuln) => {
      const matchingRule = this.findMatchingRule(vuln);

      if (matchingRule && !this.isRuleExpired(matchingRule)) {
        return {
          ...vuln,
          isIgnored: true,
          ignoreReason: matchingRule.reason,
        };
      }

      return {
        ...vuln,
        isIgnored: false,
      };
    });
  }

  generateSummary(processedVulnerabilities: ProcessedVulnerability[]): VulnerabilitySummary {
    const summary: VulnerabilitySummary = {
      critical: { new: 0, ignored: 0, total: 0 },
      high: { new: 0, ignored: 0, total: 0 },
      medium: { new: 0, ignored: 0, total: 0 },
      low: { new: 0, ignored: 0, total: 0 },
    };

    for (const vuln of processedVulnerabilities) {
      const severity = vuln.Severity.toLowerCase() as keyof VulnerabilitySummary;

      if (summary[severity]) {
        summary[severity].total++;

        if (vuln.isIgnored) {
          summary[severity].ignored++;
        } else {
          summary[severity].new++;
        }
      }
    }

    return summary;
  }

  private findMatchingRule(vulnerability: VulnerabilityResult): VulnIgnoreRule | undefined {
    return this.rules.find((rule) => {
      // CVE 必須符合
      if (rule.cve !== vulnerability.VulnerabilityID) {
        return false;
      }

      // 如果規則指定了套件名稱，則須符合
      if (rule.package && rule.package !== vulnerability.PkgName) {
        return false;
      }

      return true;
    });
  }

  private isRuleExpired(rule: VulnIgnoreRule): boolean {
    if (!rule.expires) {
      return false;
    }

    const expiryDate = new Date(rule.expires);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return expiryDate < today;
  }
}
