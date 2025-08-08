export interface VulnerabilityResult {
  VulnerabilityID: string;
  PkgName: string;
  InstalledVersion: string;
  FixedVersion?: string;
  Severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  Title: string;
  Description: string;
  PrimaryURL?: string;
}

export interface TrivyTarget {
  Target: string;
  Class: string;
  Type: string;
  Vulnerabilities?: VulnerabilityResult[];
}

export interface TrivyReport {
  SchemaVersion: number;
  Results: TrivyTarget[];
  CreatedAt: string;
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

export interface ProcessedVulnerability extends VulnerabilityResult {
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