import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotifierRegistry } from '../../src/notifiers/notifier-registry.js';
import { TeamsNotifier } from '../../src/notifiers/teams-notifier.js';
import type {
  Notifier,
  NotificationData,
  VulnerabilitySummary,
  NotifierConfig,
} from '../../src/types.js';

// Mock TeamsNotifier
class MockNotifier implements Notifier {
  sendNotification = vi.fn().mockResolvedValue(undefined);
}

// Mock console methods
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('NotifierRegistry', () => {
  let registry: NotifierRegistry;

  const mockSummary: VulnerabilitySummary = {
    critical: { new: 1, ignored: 0, total: 1 },
    high: { new: 2, ignored: 0, total: 2 },
    medium: { new: 0, ignored: 0, total: 0 },
    low: { new: 0, ignored: 0, total: 0 },
  };

  const mockNotificationData: NotificationData = {
    summary: mockSummary,
    reportTitle: 'Test Security Report',
    detailsUrl: 'https://example.com/details',
  };

  beforeEach(() => {
    registry = new NotifierRegistry();
    vi.clearAllMocks();
  });

  it('should register default teams notifier', () => {
    expect(registry.hasNotifier('teams')).toBe(true);
    expect(registry.getNotifier('teams')).toBeInstanceOf(TeamsNotifier);
  });

  it('should list available notifiers', () => {
    const notifiers = registry.listAvailableNotifiers();
    expect(notifiers).toContain('teams');
    expect(notifiers.length).toBeGreaterThan(0);
  });

  it('should register a new notifier', () => {
    const mockNotifier = new MockNotifier();
    registry.registerNotifier('slack', mockNotifier);

    expect(registry.hasNotifier('slack')).toBe(true);
    expect(registry.getNotifier('slack')).toBe(mockNotifier);
    expect(registry.listAvailableNotifiers()).toContain('slack');
  });

  it('should return undefined for unknown notifier', () => {
    expect(registry.getNotifier('unknown')).toBeUndefined();
    expect(registry.hasNotifier('unknown')).toBe(false);
  });

  it('should override existing notifier when registering with same name', () => {
    const originalTeamsNotifier = registry.getNotifier('teams');
    const newMockNotifier = new MockNotifier();

    registry.registerNotifier('teams', newMockNotifier);

    expect(registry.getNotifier('teams')).toBe(newMockNotifier);
    expect(registry.getNotifier('teams')).not.toBe(originalTeamsNotifier);
  });

  it('should handle multiple notifier registrations', () => {
    registry.registerNotifier('slack', new MockNotifier());
    registry.registerNotifier('discord', new MockNotifier());
    registry.registerNotifier('email', new MockNotifier());

    const notifiers = registry.listAvailableNotifiers();

    expect(notifiers).toContain('teams');
    expect(notifiers).toContain('slack');
    expect(notifiers).toContain('discord');
    expect(notifiers).toContain('email');
    expect(notifiers.length).toBe(4);
  });

  describe('sendNotifications', () => {
    it('should send notifications to all enabled notifiers', async () => {
      const mockNotifier1 = new MockNotifier();
      const mockNotifier2 = new MockNotifier();

      registry.registerNotifier('mock1', mockNotifier1);
      registry.registerNotifier('mock2', mockNotifier2);

      const notifierConfigs: NotifierConfig[] = [
        {
          type: 'mock1',
          enabled: true,
          config: { setting1: 'value1' },
        },
        {
          type: 'mock2',
          enabled: true,
          config: { setting2: 'value2' },
        },
      ];

      await registry.sendNotifications(mockNotificationData, notifierConfigs);

      expect(mockNotifier1.sendNotification).toHaveBeenCalledWith(mockNotificationData, {
        setting1: 'value1',
      });
      expect(mockNotifier2.sendNotification).toHaveBeenCalledWith(mockNotificationData, {
        setting2: 'value2',
      });
      expect(console.log).toHaveBeenCalledWith('✅ mock1 通知發送成功');
      expect(console.log).toHaveBeenCalledWith('✅ mock2 通知發送成功');
    });

    it('should skip disabled notifiers', async () => {
      const mockNotifier = new MockNotifier();
      registry.registerNotifier('mock', mockNotifier);

      const notifierConfigs: NotifierConfig[] = [
        {
          type: 'mock',
          enabled: false,
          config: { setting: 'value' },
        },
      ];

      await registry.sendNotifications(mockNotificationData, notifierConfigs);

      expect(mockNotifier.sendNotification).not.toHaveBeenCalled();
    });

    it('should handle notifiers with enabled undefined (default true)', async () => {
      const mockNotifier = new MockNotifier();
      registry.registerNotifier('mock', mockNotifier);

      const notifierConfigs: NotifierConfig[] = [
        {
          type: 'mock',
          config: { setting: 'value' },
          // enabled is undefined
        },
      ];

      await registry.sendNotifications(mockNotificationData, notifierConfigs);

      expect(mockNotifier.sendNotification).toHaveBeenCalledWith(mockNotificationData, {
        setting: 'value',
      });
    });

    it('should do nothing when no enabled configs', async () => {
      const notifierConfigs: NotifierConfig[] = [
        {
          type: 'teams',
          enabled: false,
          config: { webhookUrl: 'test' },
        },
      ];

      await registry.sendNotifications(mockNotificationData, notifierConfigs);

      // Should not throw any error and should not call any notifiers
    });

    it('should throw error for unregistered notifier type', async () => {
      const notifierConfigs: NotifierConfig[] = [
        {
          type: 'unknown',
          enabled: true,
          config: { setting: 'value' },
        },
      ];

      await expect(
        registry.sendNotifications(mockNotificationData, notifierConfigs),
      ).rejects.toThrow("通知器類型 'unknown' 未註冊");
    });

    it('should handle notifier send failure', async () => {
      const failingNotifier = new MockNotifier();
      failingNotifier.sendNotification.mockRejectedValue(new Error('Network error'));

      registry.registerNotifier('failing', failingNotifier);

      const notifierConfigs: NotifierConfig[] = [
        {
          type: 'failing',
          enabled: true,
          config: { setting: 'value' },
        },
      ];

      await expect(
        registry.sendNotifications(mockNotificationData, notifierConfigs),
      ).rejects.toThrow('Network error');

      expect(console.error).toHaveBeenCalledWith('❌ failing 通知發送失敗:', 'Network error');
    });
  });
});
