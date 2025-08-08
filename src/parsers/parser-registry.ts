import type { VulnerabilityScanner } from '../types.js';
import { TrivyParser } from './trivy-parser.js';

export interface ParserDetectionResult {
  parser: VulnerabilityScanner;
  scannerType: string;
}

export class ParserRegistry {
  private parsers = new Map<string, VulnerabilityScanner>();

  constructor() {
    // 註冊預設的解析器
    this.registerParser('trivy', new TrivyParser());
  }

  registerParser(scannerType: string, parser: VulnerabilityScanner): void {
    this.parsers.set(scannerType, parser);
  }

  getParser(scannerType: string): VulnerabilityScanner | undefined {
    return this.parsers.get(scannerType);
  }

  /**
   * 根據報告內容自動偵測適合的解析器
   */
  detectParser(reportData: any): ParserDetectionResult {
    // 檢測 Trivy 格式
    if (this.isTrivyFormat(reportData)) {
      return {
        parser: this.parsers.get('trivy')!,
        scannerType: 'trivy',
      };
    }

    // 未來可以加入其他格式的檢測邏輯
    // if (this.isNpmAuditFormat(reportData)) {
    //   return {
    //     parser: this.parsers.get('npm-audit')!,
    //     scannerType: 'npm-audit'
    //   };
    // }

    throw new Error('無法識別報告格式，請檢查輸入檔案是否為支援的掃描工具格式');
  }

  /**
   * 檢測是否為 Trivy 格式
   */
  private isTrivyFormat(data: any): boolean {
    return (
      typeof data === 'object' &&
      data !== null &&
      'SchemaVersion' in data &&
      'Results' in data &&
      Array.isArray(data.Results) &&
      ('CreatedAt' in data ||
        data.Results.length === 0 || // 允許空的 Results 陣列
        data.Results.some(
          (result: any) => result && 'Target' in result && 'Class' in result && 'Type' in result,
        ))
    );
  }

  /**
   * 檢測是否為 NPM Audit 格式 (範例)
   */
  private isNpmAuditFormat(data: any): boolean {
    return (
      typeof data === 'object' &&
      data !== null &&
      'advisories' in data &&
      'metadata' in data &&
      typeof data.advisories === 'object'
    );
  }

  /**
   * 列出所有已註冊的解析器
   */
  listAvailableParsers(): string[] {
    return Array.from(this.parsers.keys());
  }
}
