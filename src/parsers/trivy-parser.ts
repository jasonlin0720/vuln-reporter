import type { TrivyReport, VulnerabilityResult } from '../types.js';

export class TrivyParser {
  parseReport(report: TrivyReport): VulnerabilityResult[] {
    const vulnerabilities: VulnerabilityResult[] = [];

    for (const result of report.Results) {
      if (result.Vulnerabilities) {
        vulnerabilities.push(...result.Vulnerabilities);
      }
    }

    return vulnerabilities;
  }
}