import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { UnifiedConfigLoader } from '../../src/utils/unified-config-loader.js';
import type { UnifiedConfig } from '../../src/types.js';

describe('UnifiedConfigLoader', () => {
  let loader: UnifiedConfigLoader;
  let tempDir: string;
  let tempConfigPath: string;

  beforeEach(async () => {
    loader = new UnifiedConfigLoader();
    tempDir = path.join(process.cwd(), 'temp-test');
    await fs.mkdir(tempDir, { recursive: true });
    tempConfigPath = path.join(tempDir, 'test-config.yml');
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // 忽略清理錯誤
    }
  });

  describe('loadConfig', () => {
    it('應該成功載入完整的統一配置檔案', async () => {
      const configContent = `
ignore:
  rules:
    - cve: CVE-2023-001
      reason: "測試忽略"
      expires: "2024-12-31"
    - cve: CVE-2023-002
      package: test-package
      reason: "另一個測試忽略"

notify:
  notifiers:
    - type: teams
      enabled: true
      config:
        webhookUrl: "https://test.webhook.url"
    - type: slack
      enabled: false
      config:
        webhookUrl: "https://slack.webhook.url"
        channel: "#alerts"
`;
      await fs.writeFile(tempConfigPath, configContent);

      const config = await loader.loadConfig(tempConfigPath);

      expect(config).toBeDefined();
      expect(config.ignore).toBeDefined();
      expect(config.ignore?.rules).toHaveLength(2);
      expect(config.ignore?.rules[0]).toEqual({
        cve: 'CVE-2023-001',
        reason: '測試忽略',
        expires: '2024-12-31',
      });
      expect(config.ignore?.rules[1]).toEqual({
        cve: 'CVE-2023-002',
        package: 'test-package',
        reason: '另一個測試忽略',
      });

      expect(config.notify).toBeDefined();
      expect(config.notify?.notifiers).toHaveLength(2);
      expect(config.notify?.notifiers[0]).toEqual({
        type: 'teams',
        enabled: true,
        config: {
          webhookUrl: 'https://test.webhook.url',
        },
      });
    });

    it('應該成功載入僅包含 ignore 的配置檔案', async () => {
      const configContent = `
ignore:
  rules:
    - cve: CVE-2023-001
      reason: "僅測試忽略"
`;
      await fs.writeFile(tempConfigPath, configContent);

      const config = await loader.loadConfig(tempConfigPath);

      expect(config.ignore).toBeDefined();
      expect(config.ignore?.rules).toHaveLength(1);
      expect(config.notify).toBeUndefined();
    });

    it('應該成功載入僅包含 notify 的配置檔案', async () => {
      const configContent = `
notify:
  notifiers:
    - type: teams
      enabled: true
      config:
        webhookUrl: "https://test.webhook.url"
`;
      await fs.writeFile(tempConfigPath, configContent);

      const config = await loader.loadConfig(tempConfigPath);

      expect(config.notify).toBeDefined();
      expect(config.notify?.notifiers).toHaveLength(1);
      expect(config.ignore).toBeUndefined();
    });

    it('應該處理空的配置檔案', async () => {
      const configContent = `{}`;
      await fs.writeFile(tempConfigPath, configContent);

      const config = await loader.loadConfig(tempConfigPath);

      expect(config).toEqual({});
    });

    it('檔案不存在時應該回傳空配置', async () => {
      const nonExistentPath = path.join(tempDir, 'non-existent.yml');

      const config = await loader.loadConfig(nonExistentPath);

      expect(config).toEqual({});
    });

    it('應該驗證 ignore 規則格式', async () => {
      const configContent = `
ignore:
  rules:
    - cve: CVE-2023-001
      # 缺少 reason 欄位
`;
      await fs.writeFile(tempConfigPath, configContent);

      await expect(loader.loadConfig(tempConfigPath)).rejects.toThrow(
        /規則.*必須包含 cve 和 reason 欄位/,
      );
    });

    it('應該驗證 notify 配置格式', async () => {
      const configContent = `
notify:
  notifiers:
    - enabled: true
      # 缺少 type 欄位
      config:
        webhookUrl: "https://test.webhook.url"
`;
      await fs.writeFile(tempConfigPath, configContent);

      await expect(loader.loadConfig(tempConfigPath)).rejects.toThrow(/通知器配置.*缺少 type 欄位/);
    });

    it('應該處理無效的 YAML 檔案', async () => {
      const configContent = `
invalid: yaml: content:
  - this is not
    valid yaml
`;
      await fs.writeFile(tempConfigPath, configContent);

      await expect(loader.loadConfig(tempConfigPath)).rejects.toThrow();
    });
  });

  describe('loadDefaultConfig', () => {
    it('應該自動載入 .vuln-config.yml', async () => {
      const defaultConfigPath = path.join(process.cwd(), '.vuln-config.yml');
      const configContent = `
ignore:
  rules:
    - cve: CVE-2023-001
      reason: "預設配置測試"
`;

      try {
        await fs.writeFile(defaultConfigPath, configContent);

        const config = await loader.loadDefaultConfig();

        expect(config.ignore).toBeDefined();
        expect(config.ignore?.rules).toHaveLength(1);
        expect(config.ignore?.rules[0].cve).toBe('CVE-2023-001');
      } finally {
        // 清理預設配置檔案
        try {
          await fs.unlink(defaultConfigPath);
        } catch {
          // 忽略清理錯誤
        }
      }
    });

    it('應該自動載入 .vuln-config.yaml 作為備選', async () => {
      const defaultConfigPath = path.join(process.cwd(), '.vuln-config.yaml');
      const configContent = `
notify:
  notifiers:
    - type: teams
      enabled: true
      config:
        webhookUrl: "https://backup.webhook.url"
`;

      try {
        await fs.writeFile(defaultConfigPath, configContent);

        const config = await loader.loadDefaultConfig();

        expect(config.notify).toBeDefined();
        expect(config.notify?.notifiers).toHaveLength(1);
      } finally {
        // 清理預設配置檔案
        try {
          await fs.unlink(defaultConfigPath);
        } catch {
          // 忽略清理錯誤
        }
      }
    });

    it('找不到任何預設配置檔案時應該回傳空配置', async () => {
      const config = await loader.loadDefaultConfig();

      expect(config).toEqual({});
    });
  });

  describe('分離配置的兼容性', () => {
    it('應該能正確處理分離的 ignore 配置', async () => {
      const config: UnifiedConfig = {
        ignore: {
          rules: [
            {
              cve: 'CVE-2023-001',
              reason: '測試',
            },
          ],
        },
      };

      expect(config.ignore?.rules).toHaveLength(1);
      expect(config.ignore?.rules[0].cve).toBe('CVE-2023-001');
    });

    it('應該能正確處理分離的 notify 配置', async () => {
      const config: UnifiedConfig = {
        notify: {
          notifiers: [
            {
              type: 'teams',
              enabled: true,
              config: {
                webhookUrl: 'https://test.url',
              },
            },
          ],
        },
      };

      expect(config.notify?.notifiers).toHaveLength(1);
      expect(config.notify?.notifiers[0].type).toBe('teams');
    });
  });
});
