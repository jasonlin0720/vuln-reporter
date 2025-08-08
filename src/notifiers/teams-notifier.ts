import { ofetch } from 'ofetch';
import type { VulnerabilitySummary, Notifier, NotificationData } from '../types.js';

export interface TeamsNotificationData {
  webhookUrl: string;
  summary: VulnerabilitySummary;
  reportTitle: string;
  detailsUrl?: string;
}

export interface TeamsConfig {
  webhookUrl: string;
}

export class TeamsNotifier implements Notifier {
  // 新的 Adapter 介面方法
  async sendNotification(data: NotificationData, config: TeamsConfig): Promise<void> {
    const teamsData: TeamsNotificationData = {
      webhookUrl: config.webhookUrl,
      summary: data.summary,
      reportTitle: data.reportTitle,
      detailsUrl: data.detailsUrl,
    };
    return this.sendTeamsNotification(teamsData);
  }

  // 保留原有方法以維持向後相容性
  async sendTeamsNotification(data: TeamsNotificationData): Promise<void> {
    try {
      const adaptiveCard = this.createAdaptiveCard(data);

      await ofetch(data.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adaptiveCard),
      });
    } catch (error) {
      throw new Error(`Teams 通知發送失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  private createAdaptiveCard(data: TeamsNotificationData) {
    const { summary, reportTitle, detailsUrl } = data;
    const totalNew = summary.critical.new + summary.high.new + summary.medium.new + summary.low.new;
    const hasCriticalOrHigh = summary.critical.new > 0 || summary.high.new > 0;

    // 決定主題顏色
    let themeColor = '28a745'; // 預設綠色 (良好)
    if (summary.critical.new > 0) {
      themeColor = 'dc3545'; // 紅色 (危險)
    } else if (summary.high.new > 0) {
      themeColor = 'fd7e14'; // 橙色 (警告)
    } else if (totalNew > 0) {
      themeColor = 'ffc107'; // 黃色 (注意)
    }

    // 生成摘要文字
    let summaryText = '';
    if (totalNew === 0) {
      summaryText = '✅ 未發現任何新漏洞，系統安全狀態良好';
    } else if (summary.critical.new > 0) {
      summaryText = `🚨 發現 ${summary.critical.new} 個嚴重漏洞，需要立即處理`;
    } else if (summary.high.new > 0) {
      summaryText = `⚠️ 發現 ${summary.high.new} 個高嚴重程度漏洞，建議儘快處理`;
    } else {
      summaryText = `📊 發現 ${totalNew} 個中低嚴重程度漏洞`;
    }

    const card = {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            type: 'AdaptiveCard',
            version: '1.4',
            summary: summaryText,
            body: [
              {
                type: 'TextBlock',
                text: reportTitle,
                weight: 'Bolder',
                size: 'Large',
              },
              {
                type: 'TextBlock',
                text: summaryText,
                wrap: true,
                spacing: 'Medium',
              },
              {
                type: 'FactSet',
                facts: [
                  {
                    title: 'Critical',
                    value: `${summary.critical.new} 新發現, ${summary.critical.ignored} 已忽略 (總計: ${summary.critical.total})`,
                  },
                  {
                    title: 'High',
                    value: `${summary.high.new} 新發現, ${summary.high.ignored} 已忽略 (總計: ${summary.high.total})`,
                  },
                  {
                    title: 'Medium',
                    value: `${summary.medium.new} 新發現, ${summary.medium.ignored} 已忽略 (總計: ${summary.medium.total})`,
                  },
                  {
                    title: 'Low',
                    value: `${summary.low.new} 新發現, ${summary.low.ignored} 已忽略 (總計: ${summary.low.total})`,
                  },
                  {
                    title: '掃描時間',
                    value: new Date().toLocaleString('zh-TW'),
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    // 如果有詳情連結，添加動作按鈕
    if (detailsUrl) {
      (card.attachments[0].content.body as any[]).push({
        type: 'ActionSet',
        actions: [
          {
            type: 'Action.OpenUrl',
            title: '查看詳細報告',
            url: detailsUrl,
          },
        ],
      });
    }

    return card;
  }
}
