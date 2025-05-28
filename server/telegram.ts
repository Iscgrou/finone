import { storage } from "./storage";

/**
 * Telegram Bot Service for sending notifications and reports
 */
export class TelegramService {
  private botToken: string | null = null;
  private chatId: string | null = null;

  constructor() {
    this.initializeFromSettings();
  }

  /**
   * Initialize Telegram settings from database
   */
  private async initializeFromSettings(): Promise<void> {
    try {
      const botTokenSetting = await storage.getSetting('telegram_bot_token');
      const chatIdSetting = await storage.getSetting('telegram_chat_id');
      
      this.botToken = botTokenSetting?.value || null;
      this.chatId = chatIdSetting?.value || null;
    } catch (error) {
      console.log('Telegram settings not yet configured');
    }
  }

  /**
   * Update Telegram configuration
   */
  async updateConfig(botToken: string, chatId: string): Promise<void> {
    this.botToken = botToken;
    this.chatId = chatId;

    await storage.setSetting('telegram_bot_token', botToken, 'string', 'Telegram Bot Token');
    await storage.setSetting('telegram_chat_id', chatId, 'string', 'Telegram Chat ID');
  }

  /**
   * Send message to Telegram channel
   */
  async sendMessage(message: string): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      console.log('Telegram not configured - message would be:', message);
      return false;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      const result = await response.json();
      
      if (result.ok) {
        console.log('Telegram message sent successfully');
        return true;
      } else {
        console.error('Telegram API error:', result.description);
        return false;
      }
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      return false;
    }
  }

  /**
   * Send invoice as document to Telegram
   */
  async sendInvoiceDocument(filePath: string, caption: string): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      console.log('Telegram not configured');
      return false;
    }

    try {
      const FormData = require('form-data');
      const fs = require('fs');
      
      const form = new FormData();
      form.append('chat_id', this.chatId);
      form.append('document', fs.createReadStream(filePath));
      form.append('caption', caption);

      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendDocument`, {
        method: 'POST',
        body: form,
      });

      const result = await response.json();
      return result.ok;
    } catch (error) {
      console.error('Failed to send Telegram document:', error);
      return false;
    }
  }

  /**
   * Test Telegram connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.botToken) {
      return { success: false, message: 'Bot token not configured' };
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/getMe`);
      const result = await response.json();
      
      if (result.ok) {
        return { 
          success: true, 
          message: `Connected to bot: ${result.result.first_name} (@${result.result.username})` 
        };
      } else {
        return { success: false, message: result.description || 'Unknown error' };
      }
    } catch (error) {
      return { success: false, message: 'Network error: ' + error.message };
    }
  }
}

export const telegramService = new TelegramService();

/**
 * Helper function for sending messages
 */
export async function sendTelegramMessage(message: string): Promise<boolean> {
  return await telegramService.sendMessage(message);
}