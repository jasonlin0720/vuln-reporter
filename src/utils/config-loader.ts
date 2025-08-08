import { promises as fs } from 'fs';
import { load } from 'js-yaml';
import type { VulnIgnoreConfig, VulnIgnoreRule } from '../types.js';

export class ConfigLoader {
  async loadConfig(filePath: string): Promise<VulnIgnoreConfig> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const parsedData = load(fileContent) as any;

      if (!parsedData || !Array.isArray(parsedData.rules)) {
        return { rules: [] };
      }

      const validatedRules = this.validateRules(parsedData.rules);
      return { rules: validatedRules };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { rules: [] };
      }
      throw error;
    }
  }

  private validateRules(rules: any[]): VulnIgnoreRule[] {
    return rules.map((rule, index) => {
      if (!rule.cve || typeof rule.cve !== 'string') {
        throw new Error(`規則 ${index + 1} 必須包含 cve 和 reason 欄位`);
      }

      if (!rule.reason || typeof rule.reason !== 'string') {
        throw new Error(`規則 ${index + 1} 必須包含 cve 和 reason 欄位`);
      }

      return {
        cve: rule.cve,
        package: rule.package,
        expires: rule.expires ? String(rule.expires) : undefined,
        reason: rule.reason,
      };
    });
  }
}
