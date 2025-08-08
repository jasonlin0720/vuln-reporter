import { promises as fs } from 'fs';
import * as yaml from 'js-yaml';
import type { NotifyConfig } from '../types.js';

export class NotifyConfigLoader {
  /**
   * 載入通知器配置檔案
   * @param configPath 配置檔案路徑
   */
  async loadNotifyConfig(configPath: string): Promise<NotifyConfig> {
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      const config = yaml.load(content) as NotifyConfig;

      if (!config || !Array.isArray(config.notifiers)) {
        throw new Error('無效的通知器配置格式：必須包含 notifiers 陣列');
      }

      // 驗證每個通知器配置
      config.notifiers.forEach((notifier, index) => {
        if (!notifier.type) {
          throw new Error(`通知器配置 ${index} 缺少 type 欄位`);
        }
        if (!notifier.config) {
          throw new Error(`通知器配置 ${index} 缺少 config 欄位`);
        }
      });

      return config;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // 檔案不存在，回傳空配置
        return { notifiers: [] };
      }
      throw new Error(`載入通知器配置失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 自動載入預設通知器配置檔案
   * 依序嘗試載入 .vuln-notify.yml, .vuln-notify.yaml
   */
  async loadDefaultNotifyConfig(): Promise<NotifyConfig> {
    const defaultPaths = ['.vuln-notify.yml', '.vuln-notify.yaml'];

    for (const path of defaultPaths) {
      try {
        const config = await this.loadNotifyConfig(path);
        if (config.notifiers.length > 0) {
          console.log(`📋 載入通知器配置: ${path}`);
          return config;
        }
      } catch {
        // 繼續嘗試下一個檔案
        continue;
      }
    }

    // 都找不到，回傳空配置
    return { notifiers: [] };
  }
}
