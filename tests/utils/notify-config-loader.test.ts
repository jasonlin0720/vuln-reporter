import { describe, it, expect, beforeEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import { NotifyConfigLoader } from '../../src/utils/notify-config-loader.js';

// Mock fs
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
  },
}));

describe('NotifyConfigLoader', () => {
  let loader: NotifyConfigLoader;
  const mockReadFile = fs.readFile as any;

  beforeEach(() => {
    loader = new NotifyConfigLoader();
    vi.clearAllMocks();
  });

  describe('loadNotifyConfig', () => {
    it('should load valid notify config successfully', async () => {
      const yamlContent = `
notifiers:
  - type: teams
    enabled: true
    config:
      webhookUrl: "https://example.com/webhook"
  - type: slack
    enabled: false
    config:
      webhookUrl: "https://slack.example.com/webhook"
`;
      mockReadFile.mockResolvedValue(yamlContent);

      const config = await loader.loadNotifyConfig('test-config.yml');

      expect(config.notifiers).toHaveLength(2);
      expect(config.notifiers[0].type).toBe('teams');
      expect(config.notifiers[0].enabled).toBe(true);
      expect(config.notifiers[0].config.webhookUrl).toBe('https://example.com/webhook');
    });

    it('should return empty config when file does not exist', async () => {
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockReadFile.mockRejectedValue(error);

      const config = await loader.loadNotifyConfig('nonexistent.yml');

      expect(config.notifiers).toEqual([]);
    });

    it('should throw error for invalid config format', async () => {
      const invalidYaml = `
invalid: format
without: notifiers
`;
      mockReadFile.mockResolvedValue(invalidYaml);

      await expect(loader.loadNotifyConfig('invalid.yml')).rejects.toThrow(
        '無效的通知器配置格式：必須包含 notifiers 陣列',
      );
    });

    it('should validate notifier configuration', async () => {
      const yamlWithMissingType = `
notifiers:
  - enabled: true
    config:
      webhookUrl: "https://example.com/webhook"
`;
      mockReadFile.mockResolvedValue(yamlWithMissingType);

      await expect(loader.loadNotifyConfig('missing-type.yml')).rejects.toThrow(
        '通知器配置 0 缺少 type 欄位',
      );
    });

    it('should validate notifier config field', async () => {
      const yamlWithMissingConfig = `
notifiers:
  - type: teams
    enabled: true
`;
      mockReadFile.mockResolvedValue(yamlWithMissingConfig);

      await expect(loader.loadNotifyConfig('missing-config.yml')).rejects.toThrow(
        '通知器配置 0 缺少 config 欄位',
      );
    });
  });

  describe('loadDefaultNotifyConfig', () => {
    it('should load first available default config file', async () => {
      const yamlContent = `
notifiers:
  - type: teams
    config:
      webhookUrl: "https://default.example.com/webhook"
`;

      mockReadFile
        .mockRejectedValueOnce(new Error('File not found')) // .vuln-notify.yml 不存在
        .mockResolvedValueOnce(yamlContent); // .vuln-notify.yaml 存在

      const config = await loader.loadDefaultNotifyConfig();

      expect(config.notifiers).toHaveLength(1);
      expect(config.notifiers[0].type).toBe('teams');
      expect(mockReadFile).toHaveBeenCalledTimes(2);
    });

    it('should return empty config when no default files exist', async () => {
      mockReadFile.mockRejectedValue(new Error('File not found'));

      const config = await loader.loadDefaultNotifyConfig();

      expect(config.notifiers).toEqual([]);
    });

    it('should return empty config when default files exist but are empty', async () => {
      const emptyYamlContent = `notifiers: []`;
      mockReadFile.mockResolvedValue(emptyYamlContent);

      const config = await loader.loadDefaultNotifyConfig();

      expect(config.notifiers).toEqual([]);
    });
  });
});
