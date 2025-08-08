import type { Notifier, NotificationData, NotifierConfig } from '../types.js';
import { TeamsNotifier } from './teams-notifier.js';

export class NotifierRegistry {
  private notifiers = new Map<string, Notifier>();

  constructor() {
    this.registerNotifier('teams', new TeamsNotifier());
  }

  registerNotifier(name: string, notifier: Notifier): void {
    this.notifiers.set(name, notifier);
  }

  getNotifier(name: string): Notifier | undefined {
    return this.notifiers.get(name);
  }

  listAvailableNotifiers(): string[] {
    return Array.from(this.notifiers.keys());
  }

  hasNotifier(name: string): boolean {
    return this.notifiers.has(name);
  }

  /**
   * 統一發送通知到多個通知器
   * @param data 通知資料
   * @param notifierConfigs 通知器配置陣列
   */
  async sendNotifications(
    data: NotificationData,
    notifierConfigs: NotifierConfig[],
  ): Promise<void> {
    const enabledConfigs = notifierConfigs.filter((config) => config.enabled !== false);

    if (enabledConfigs.length === 0) {
      return;
    }

    const promises = enabledConfigs.map(async (config) => {
      const notifier = this.getNotifier(config.type);
      if (!notifier) {
        throw new Error(
          `通知器類型 '${config.type}' 未註冊。可用類型: ${this.listAvailableNotifiers().join(', ')}`,
        );
      }

      try {
        await notifier.sendNotification(data, config.config);
        console.log(`✅ ${config.type} 通知發送成功`);
      } catch (error) {
        console.error(
          `❌ ${config.type} 通知發送失敗:`,
          error instanceof Error ? error.message : error,
        );
        throw error;
      }
    });

    await Promise.all(promises);
  }
}
