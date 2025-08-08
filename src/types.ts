// 標準化漏洞格式 - 所有掃描工具的適配器都要轉換成此格式
export interface StandardVulnerability {
  id: string; // CVE ID 或其他漏洞標識符
  packageName: string; // 套件名稱
  installedVersion: string; // 目前安裝版本
  fixedVersion?: string; // 修復版本
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string; // 漏洞標題
  description: string; // 漏洞描述
  references?: string[]; // 參考連結
}

export interface VulnIgnoreRule {
  cve: string;
  package?: string;
  expires?: string;
  reason: string;
}

export interface VulnIgnoreConfig {
  rules: VulnIgnoreRule[];
}

// 漏洞掃描器適配器介面
export interface VulnerabilityScanner {
  parseReport(reportData: any): StandardVulnerability[];
}

export interface ProcessedVulnerability extends StandardVulnerability {
  isIgnored: boolean;
  ignoreReason?: string;
}

export interface VulnerabilitySummary {
  critical: { new: number; ignored: number; total: number };
  high: { new: number; ignored: number; total: number };
  medium: { new: number; ignored: number; total: number };
  low: { new: number; ignored: number; total: number };
}

export interface CliOptions {
  input: string;
  reporterTitle: string;
  detailsUrl?: string;
  teamsWebhookUrl?: string;
  outputFile?: string;
}
