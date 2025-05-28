import { storage } from "./storage";
import { db } from "./db";

/**
 * Google Drive Backup Service
 * Handles automated backup and restore operations to Google Drive
 */
export class GoogleDriveBackupService {
  private driveEmail: string | null = null;
  private accessToken: string | null = null;

  constructor() {
    this.initializeFromSettings();
  }

  /**
   * Initialize Google Drive settings from database
   */
  private async initializeFromSettings(): Promise<void> {
    try {
      const emailSetting = await storage.getSetting('google_drive_email');
      const tokenSetting = await storage.getSetting('google_drive_token');
      
      this.driveEmail = emailSetting?.value || null;
      this.accessToken = tokenSetting?.value || null;
    } catch (error) {
      console.log('Google Drive settings not yet configured');
    }
  }

  /**
   * Configure Google Drive backup with email authentication
   */
  async configureBackup(email: string, accessToken: string): Promise<{ success: boolean; message: string }> {
    try {
      // Test the connection first
      const testResult = await this.testConnection(accessToken);
      if (!testResult.success) {
        return testResult;
      }

      this.driveEmail = email;
      this.accessToken = accessToken;

      // Save to settings
      await storage.setSetting('google_drive_email', email, 'string', 'Google Drive Email');
      await storage.setSetting('google_drive_token', accessToken, 'string', 'Google Drive Access Token');

      return { success: true, message: 'Google Drive backup configured successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to configure Google Drive: ' + error.message };
    }
  }

  /**
   * Test Google Drive connection
   */
  private async testConnection(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          message: `Connected to Google Drive for ${data.user.emailAddress}` 
        };
      } else {
        return { success: false, message: 'Invalid Google Drive access token' };
      }
    } catch (error) {
      return { success: false, message: 'Network error: ' + error.message };
    }
  }

  /**
   * Create full database backup
   */
  async createBackup(): Promise<{ success: boolean; message: string; backupId?: number }> {
    if (!this.accessToken || !this.driveEmail) {
      return { success: false, message: 'Google Drive not configured' };
    }

    try {
      // Create backup log entry
      const backupLog = await storage.createBackupLog({
        type: 'backup',
        status: 'in_progress',
        destination: 'google_drive',
        metadata: { email: this.driveEmail }
      });

      // Export database data
      const backupData = await this.exportDatabaseData();
      const backupJson = JSON.stringify(backupData, null, 2);
      const backupBuffer = Buffer.from(backupJson, 'utf8');

      // Upload to Google Drive
      const fileName = `vpn-billing-backup-${new Date().toISOString().split('T')[0]}.json`;
      const uploadResult = await this.uploadToGoogleDrive(backupBuffer, fileName);

      if (uploadResult.success) {
        // Update backup log
        await storage.updateBackupLog(backupLog.id, {
          status: 'success',
          fileSize: backupBuffer.length,
          metadata: { 
            email: this.driveEmail, 
            fileId: uploadResult.fileId,
            fileName: fileName
          }
        });

        return { 
          success: true, 
          message: `Backup created successfully: ${fileName}`,
          backupId: backupLog.id
        };
      } else {
        // Update backup log with error
        await storage.updateBackupLog(backupLog.id, {
          status: 'failed',
          errorMessage: uploadResult.message
        });

        return { success: false, message: uploadResult.message };
      }
    } catch (error) {
      return { success: false, message: 'Backup failed: ' + error.message };
    }
  }

  /**
   * Export all database data
   */
  private async exportDatabaseData(): Promise<any> {
    const [
      representatives,
      invoices,
      payments,
      fileImports,
      settings,
      systemUsers,
      invoiceTemplates,
      notifications,
      analyticsReports
    ] = await Promise.all([
      storage.getAllRepresentatives(),
      storage.getAllInvoices(),
      storage.getAllPayments(),
      storage.getAllFileImports(),
      storage.getAllSettings(),
      storage.getAllSystemUsers(),
      storage.getAllInvoiceTemplates(),
      storage.getAllNotifications(),
      storage.getAllAnalyticsReports()
    ]);

    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        representatives,
        invoices,
        payments,
        fileImports,
        settings,
        systemUsers,
        invoiceTemplates,
        notifications,
        analyticsReports
      }
    };
  }

  /**
   * Upload file to Google Drive
   */
  private async uploadToGoogleDrive(
    fileBuffer: Buffer, 
    fileName: string
  ): Promise<{ success: boolean; message: string; fileId?: string }> {
    try {
      // Create file metadata
      const metadata = {
        name: fileName,
        parents: ['appDataFolder'] // Store in app data folder for privacy
      };

      // Upload file
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([fileBuffer], { type: 'application/json' }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: form,
      });

      if (response.ok) {
        const result = await response.json();
        return { 
          success: true, 
          message: 'File uploaded successfully',
          fileId: result.id
        };
      } else {
        const error = await response.text();
        return { success: false, message: 'Upload failed: ' + error };
      }
    } catch (error) {
      return { success: false, message: 'Upload error: ' + error.message };
    }
  }

  /**
   * List available backups from Google Drive
   */
  async listBackups(): Promise<{ success: boolean; backups?: any[]; message: string }> {
    if (!this.accessToken) {
      return { success: false, message: 'Google Drive not configured' };
    }

    try {
      const response = await fetch(
        "https://www.googleapis.com/drive/v3/files?q=parents in 'appDataFolder' and name contains 'vpn-billing-backup'&fields=files(id,name,createdTime,size)",
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          backups: data.files || [],
          message: 'Backups retrieved successfully'
        };
      } else {
        return { success: false, message: 'Failed to list backups' };
      }
    } catch (error) {
      return { success: false, message: 'Error listing backups: ' + error.message };
    }
  }

  /**
   * Restore database from Google Drive backup
   */
  async restoreBackup(fileId: string): Promise<{ success: boolean; message: string }> {
    if (!this.accessToken) {
      return { success: false, message: 'Google Drive not configured' };
    }

    try {
      // Create restore log entry
      const restoreLog = await storage.createBackupLog({
        type: 'restore',
        status: 'in_progress',
        destination: 'google_drive',
        metadata: { fileId }
      });

      // Download backup file
      const downloadResult = await this.downloadFromGoogleDrive(fileId);
      if (!downloadResult.success) {
        await storage.updateBackupLog(restoreLog.id, {
          status: 'failed',
          errorMessage: downloadResult.message
        });
        return downloadResult;
      }

      // Parse backup data
      const backupData = JSON.parse(downloadResult.content!);
      
      // Restore data to database
      await this.restoreDatabaseData(backupData.data);

      // Update restore log
      await storage.updateBackupLog(restoreLog.id, {
        status: 'success',
        fileSize: downloadResult.content!.length
      });

      return { success: true, message: 'Database restored successfully' };
    } catch (error) {
      return { success: false, message: 'Restore failed: ' + error.message };
    }
  }

  /**
   * Download file from Google Drive
   */
  private async downloadFromGoogleDrive(fileId: string): Promise<{ success: boolean; content?: string; message: string }> {
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (response.ok) {
        const content = await response.text();
        return { success: true, content, message: 'File downloaded successfully' };
      } else {
        return { success: false, message: 'Download failed' };
      }
    } catch (error) {
      return { success: false, message: 'Download error: ' + error.message };
    }
  }

  /**
   * Restore database data from backup
   */
  private async restoreDatabaseData(data: any): Promise<void> {
    // Note: In production, you'd want to backup current data first
    // and implement more sophisticated restore logic with user confirmation

    // Clear existing data (careful!)
    // await this.clearDatabaseTables();

    // Restore data
    if (data.representatives) {
      for (const rep of data.representatives) {
        await storage.createRepresentative(rep);
      }
    }

    if (data.invoices) {
      for (const invoice of data.invoices) {
        await storage.createInvoice(invoice);
      }
    }

    if (data.payments) {
      for (const payment of data.payments) {
        await storage.createPayment(payment);
      }
    }

    if (data.settings) {
      for (const setting of data.settings) {
        await storage.setSetting(setting.key, setting.value, setting.type, setting.description);
      }
    }

    // Continue for other tables...
  }

  /**
   * Schedule automated backups
   */
  async scheduleAutomaticBackups(intervalHours: number = 24): Promise<void> {
    setInterval(async () => {
      console.log('Running scheduled backup...');
      const result = await this.createBackup();
      if (result.success) {
        console.log('Scheduled backup completed successfully');
      } else {
        console.error('Scheduled backup failed:', result.message);
      }
    }, intervalHours * 60 * 60 * 1000);
  }
}

export const googleDriveBackup = new GoogleDriveBackupService();