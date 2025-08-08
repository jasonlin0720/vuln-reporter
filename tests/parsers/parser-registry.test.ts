import { describe, it, expect } from 'vitest';
import { ParserRegistry } from '../../src/parsers/parser-registry.js';
import type { VulnerabilityScanner } from '../../src/types.js';

describe('ParserRegistry', () => {
  it('should register and retrieve parsers', () => {
    const registry = new ParserRegistry();
    const mockParser: VulnerabilityScanner = {
      parseReport: () => [],
    };

    registry.registerParser('test', mockParser);
    const retrievedParser = registry.getParser('test');

    expect(retrievedParser).toBe(mockParser);
  });

  it('should return undefined for unknown parser', () => {
    const registry = new ParserRegistry();
    const result = registry.getParser('unknown');

    expect(result).toBeUndefined();
  });

  it('should detect Trivy format correctly', () => {
    const registry = new ParserRegistry();
    const trivyData = {
      SchemaVersion: 2,
      CreatedAt: '2024-01-01T00:00:00Z',
      Results: [
        {
          Target: 'package.json',
          Class: 'lang-pkgs',
          Type: 'npm',
          Vulnerabilities: [],
        },
      ],
    };

    const result = registry.detectParser(trivyData);

    expect(result.scannerType).toBe('trivy');
    expect(result.parser).toBeDefined();
  });

  it('should throw error for unknown format', () => {
    const registry = new ParserRegistry();
    const unknownData = {
      someProperty: 'value',
    };

    expect(() => registry.detectParser(unknownData)).toThrow('無法識別報告格式');
  });

  it('should list available parsers', () => {
    const registry = new ParserRegistry();
    const parsers = registry.listAvailableParsers();

    expect(parsers).toContain('trivy');
    expect(Array.isArray(parsers)).toBe(true);
  });

  it('should detect Trivy format with minimal data', () => {
    const registry = new ParserRegistry();
    const trivyDataMinimal = {
      SchemaVersion: 2,
      Results: [],
    };

    const result = registry.detectParser(trivyDataMinimal);
    expect(result.scannerType).toBe('trivy');
  });
});
