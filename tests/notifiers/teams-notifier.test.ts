import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamsNotifier } from '../../src/notifiers/teams-notifier.js';
import type { VulnerabilitySummary, NotificationData } from '../../src/types.js';

// Mock ofetch
vi.mock('ofetch', () => ({
  ofetch: vi.fn(),
}));

describe('TeamsNotifier', () => {
  const mockSummary: VulnerabilitySummary = {
    critical: { new: 2, ignored: 1, total: 3 },
    high: { new: 3, ignored: 0, total: 3 },
    medium: { new: 1, ignored: 2, total: 3 },
    low: { new: 0, ignored: 1, total: 1 },
  };

  const mockNotificationData: NotificationData = {
    summary: mockSummary,
    reportTitle: 'Test Security Report',
    detailsUrl: 'https://example.com/details',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe('Adapter Interface', () => {
    it('should implement Notifier interface correctly', async () => {
      const { ofetch } = await import('ofetch');
      const mockOfetch = ofetch as any;
      mockOfetch.mockClear();
      mockOfetch.mockResolvedValue({ ok: true });

      const notifier = new TeamsNotifier();

      await notifier.sendNotification(mockNotificationData, {
        webhookUrl: 'https://outlook.office.com/webhook/test',
      });

      expect(mockOfetch).toHaveBeenCalledTimes(1);
      expect(mockOfetch).toHaveBeenCalledWith(
        'https://outlook.office.com/webhook/test',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"type":"message"'),
        }),
      );
    });

    it('should handle notification data without detailsUrl', async () => {
      const { ofetch } = await import('ofetch');
      const mockOfetch = ofetch as any;
      mockOfetch.mockClear();
      mockOfetch.mockResolvedValue({ ok: true });

      const notifier = new TeamsNotifier();
      const dataWithoutUrl: NotificationData = {
        summary: mockSummary,
        reportTitle: 'Test Report',
      };

      await notifier.sendNotification(dataWithoutUrl, {
        webhookUrl: 'https://outlook.office.com/webhook/test',
      });

      expect(mockOfetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error when adapter notification fails', async () => {
      const { ofetch } = await import('ofetch');
      const mockOfetch = ofetch as any;
      mockOfetch.mockClear();
      mockOfetch.mockRejectedValue(new Error('Network failed'));

      const notifier = new TeamsNotifier();

      await expect(
        notifier.sendNotification(mockNotificationData, {
          webhookUrl: 'https://invalid-webhook.com',
        }),
      ).rejects.toThrow('Teams 通知發送失敗');
    });
  });

  describe('Legacy Interface', () => {
    it('should send notification with correct adaptive card format', async () => {
      const { ofetch } = await import('ofetch');
      const mockOfetch = ofetch as any;
      mockOfetch.mockClear();
      mockOfetch.mockResolvedValue({ ok: true });

      const notifier = new TeamsNotifier();

      await notifier.sendTeamsNotification({
        webhookUrl: 'https://outlook.office.com/webhook/test',
        summary: mockSummary,
        reportTitle: 'Test Security Report',
        detailsUrl: 'https://example.com/details',
      });

      expect(mockOfetch).toHaveBeenCalledTimes(1);
      expect(mockOfetch).toHaveBeenCalledWith(
        'https://outlook.office.com/webhook/test',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"type":"message"'),
        }),
      );

      const callArgs = mockOfetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.attachments[0].content.body).toContainEqual(
        expect.objectContaining({
          type: 'FactSet',
          facts: expect.arrayContaining([
            expect.objectContaining({
              title: 'Critical',
              value: '2 新發現, 1 已忽略 (總計: 3)',
            }),
          ]),
        }),
      );
    });

    it('should handle high severity vulnerabilities with warning theme', async () => {
      const highSeveritySummary: VulnerabilitySummary = {
        critical: { new: 0, ignored: 0, total: 0 },
        high: { new: 5, ignored: 0, total: 5 },
        medium: { new: 0, ignored: 0, total: 0 },
        low: { new: 0, ignored: 0, total: 0 },
      };

      const { ofetch } = await import('ofetch');
      const mockOfetch = ofetch as any;
      mockOfetch.mockClear();
      mockOfetch.mockResolvedValue({ ok: true });

      const notifier = new TeamsNotifier();

      await notifier.sendTeamsNotification({
        webhookUrl: 'https://outlook.office.com/webhook/test',
        summary: highSeveritySummary,
        reportTitle: 'High Severity Report',
      });

      const callArgs = mockOfetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.attachments[0].content.summary).toContain('發現 5 個高嚴重程度漏洞');
    });

    it('should handle no vulnerabilities with good theme', async () => {
      const noVulnSummary: VulnerabilitySummary = {
        critical: { new: 0, ignored: 0, total: 0 },
        high: { new: 0, ignored: 0, total: 0 },
        medium: { new: 0, ignored: 0, total: 0 },
        low: { new: 0, ignored: 0, total: 0 },
      };

      const { ofetch } = await import('ofetch');
      const mockOfetch = ofetch as any;
      mockOfetch.mockClear();
      mockOfetch.mockResolvedValue({ ok: true });

      const notifier = new TeamsNotifier();

      await notifier.sendTeamsNotification({
        webhookUrl: 'https://outlook.office.com/webhook/test',
        summary: noVulnSummary,
        reportTitle: 'Clean Report',
      });

      const callArgs = mockOfetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.attachments[0].content.summary).toContain('未發現任何新漏洞');
    });

    it('should throw error when webhook request fails', async () => {
      const { ofetch } = await import('ofetch');
      const mockOfetch = ofetch as any;
      mockOfetch.mockClear();
      mockOfetch.mockRejectedValue(new Error('Webhook failed'));

      const notifier = new TeamsNotifier();

      await expect(
        notifier.sendTeamsNotification({
          webhookUrl: 'https://invalid-webhook.com',
          summary: mockSummary,
          reportTitle: 'Test Report',
        }),
      ).rejects.toThrow('Teams 通知發送失敗');
    });

    it('should include details URL when provided', async () => {
      const { ofetch } = await import('ofetch');
      const mockOfetch = ofetch as any;
      mockOfetch.mockClear();
      mockOfetch.mockResolvedValue({ ok: true });

      const notifier = new TeamsNotifier();

      await notifier.sendTeamsNotification({
        webhookUrl: 'https://outlook.office.com/webhook/test',
        summary: mockSummary,
        reportTitle: 'Test Report',
        detailsUrl: 'https://example.com/details',
      });

      const callArgs = mockOfetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.attachments[0].content.body).toContainEqual(
        expect.objectContaining({
          type: 'ActionSet',
          actions: expect.arrayContaining([
            expect.objectContaining({
              title: '查看詳細報告',
              url: 'https://example.com/details',
            }),
          ]),
        }),
      );
    });
  }); // 結束 Legacy Interface describe
}); // 結束 TeamsNotifier describe
