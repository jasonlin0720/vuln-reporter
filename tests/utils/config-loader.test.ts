import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { ConfigLoader } from '../../src/utils/config-loader.js';
import type { VulnIgnoreConfig } from '../../src/types.js';

describe('ConfigLoader', () => {
  const testConfigFile = '.vuln-ignore.test.yml';

  afterEach(async () => {
    try {
      await fs.unlink(testConfigFile);
    } catch {
      // File might not exist
    }
  });

  it('should load valid YAML configuration', async () => {
    const configContent = `
rules:
  - cve: CVE-2023-12345
    reason: 已確認為誤報
    expires: "2024-12-31"
  - cve: CVE-2023-67890
    package: lodash
    reason: 將在下個版本修復
`;

    await fs.writeFile(testConfigFile, configContent);

    const loader = new ConfigLoader();
    const config = await loader.loadConfig(testConfigFile);

    expect(config.rules).toHaveLength(2);
    expect(config.rules[0].cve).toBe('CVE-2023-12345');
    expect(config.rules[0].reason).toBe('已確認為誤報');
    expect(config.rules[0].expires).toBe('2024-12-31');

    expect(config.rules[1].cve).toBe('CVE-2023-67890');
    expect(config.rules[1].package).toBe('lodash');
    expect(config.rules[1].reason).toBe('將在下個版本修復');
  });

  it('should return empty config when file does not exist', async () => {
    const loader = new ConfigLoader();
    const config = await loader.loadConfig('non-existent-file.yml');

    expect(config.rules).toHaveLength(0);
  });

  it('should throw error for invalid YAML', async () => {
    const invalidYaml = `
rules:
  - cve: CVE-2023-12345
    reason: 缺少引號的字串: 這會導致錯誤
      invalid_indent: true
`;

    await fs.writeFile(testConfigFile, invalidYaml);

    const loader = new ConfigLoader();

    await expect(loader.loadConfig(testConfigFile)).rejects.toThrow();
  });

  it('should validate required fields', async () => {
    const missingRequiredFields = `
rules:
  - cve: CVE-2023-12345
    # missing reason field
  - reason: 有原因但沒有 CVE
    # missing cve field
`;

    await fs.writeFile(testConfigFile, missingRequiredFields);

    const loader = new ConfigLoader();

    await expect(loader.loadConfig(testConfigFile)).rejects.toThrow('必須包含 cve 和 reason 欄位');
  });

  it('should handle empty rules array', async () => {
    const emptyConfig = `
rules: []
`;

    await fs.writeFile(testConfigFile, emptyConfig);

    const loader = new ConfigLoader();
    const config = await loader.loadConfig(testConfigFile);

    expect(config.rules).toHaveLength(0);
  });
});
