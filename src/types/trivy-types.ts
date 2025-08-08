// Trivy 特定的原始格式
export interface TrivyVulnerabilityResult {
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
  Vulnerabilities?: TrivyVulnerabilityResult[];
}

export interface TrivyReport {
  SchemaVersion: number;
  Results: TrivyTarget[];
  CreatedAt: string;
}
