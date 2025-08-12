import { promises as fs } from 'fs';
import * as yaml from 'js-yaml';
import type { Config, VulnIgnoreRule } from '../types.js';

export class ConfigLoader {
  /**
   * 載入配置檔案
   * @param configPath 配置檔案路徑
   */
  async loadConfig(configPath: string): Promise<Config> {
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      const config = yaml.load(content) as Config;

      if (!config) {
        return {};
      }

      // 驗證 ignore 配置
      if (config.ignore?.rules) {
        this.validateIgnoreRules(config.ignore.rules);
      }

      // 驗證 notify 配置
      if (config.notify?.notifiers) {
        this.validateNotifyConfig(config.notify.notifiers);
      }

      return config;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // 檔案不存在，回傳空配置
        return {};
      }
      throw new Error(`載入配置檔案失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 自動載入預設配置檔案
   * 依序嘗試載入 .vuln-config.yml, .vuln-config.yaml
   */
  async loadDefaultConfig(): Promise<Config> {
    const defaultPaths = ['.vuln-config.yml', '.vuln-config.yaml'];

    for (const path of defaultPaths) {
      try {
        const config = await this.loadConfig(path);
        if (Object.keys(config).length > 0) {
          console.log(`📋 載入配置: ${path}`);
          return config;
        }
      } catch {
        // 繼續嘗試下一個檔案
        continue;
      }
    }

    // 都找不到，回傳空配置
    return {};
  }

  /**
   * 驗證忽略規則格式
   */
  private validateIgnoreRules(rules: any[]): VulnIgnoreRule[] {
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

  /**
   * 驗證通知器配置格式
   */
  private validateNotifyConfig(notifiers: any[]): void {
    notifiers.forEach((notifier, index) => {
      if (!notifier.type) {
        throw new Error(`通知器配置 ${index} 缺少 type 欄位`);
      }
      if (!notifier.config) {
        throw new Error(`通知器配置 ${index} 缺少 config 欄位`);
      }
    });
  }
}
