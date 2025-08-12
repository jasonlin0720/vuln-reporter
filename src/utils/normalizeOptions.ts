import type { CliOptions, NormalizedCliOptions } from '../types';

/**
 * 標準化 CLI 選項，補齊所有預設值
 */
export function normalizeOptions(options: CliOptions): NormalizedCliOptions {
  return {
    input: options.input,
    reporterTitle: options.reporterTitle,
    scanner: options.scanner || 'auto',
    verbose: options.verbose || false,
    detailsUrl: options.detailsUrl,
    config: options.config || '.vuln-config.yml',
    outputFile: options.outputFile || 'vulnerability-report.xlsx',
    exitOnHighSeverity:
      options.exitOnHighSeverity !== undefined ? options.exitOnHighSeverity : true,
  };
}
