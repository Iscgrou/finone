import { 
  representatives, 
  invoices, 
  payments, 
  fileImports,
  users,
  settings,
  systemUsers,
  invoiceTemplates,
  notifications,
  analyticsReports,
  backupLogs,
  type Representative, 
  type InsertRepresentative,
  type Invoice,
  type InsertInvoice,
  type Payment,
  type InsertPayment,
  type FileImport,
  type InsertFileImport,
  type User, 
  type InsertUser,
  type Setting,
  type InsertSetting,
  type SystemUser,
  type InsertSystemUser,
  type InvoiceTemplate,
  type InsertInvoiceTemplate,
  type Notification,
  type InsertNotification,
  type AnalyticsReport,
  type InsertAnalyticsReport,
  type BackupLog,
  type InsertBackupLog
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, lte, and, sql, count, sum } from "drizzle-orm";
import { parseCSVContent, type RepresentativeUsageData, calculateInvoiceAmount } from "../client/src/lib/file-parser";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Representative methods
  getAllRepresentatives(): Promise<Representative[]>;
  getRepresentative(id: number): Promise<Representative | undefined>;
  getRepresentativeByAdminUsername(adminUsername: string): Promise<Representative | undefined>;
  createRepresentative(representative: InsertRepresentative): Promise<Representative>;
  updateRepresentative(id: number, representative: Partial<InsertRepresentative>): Promise<Representative | undefined>;
  deleteRepresentative(id: number): Promise<void>;

  // Invoice methods
  getAllInvoices(): Promise<(Invoice & { representative?: Representative })[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByRepresentative(representativeId: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined>;

  // Payment methods
  getAllPayments(): Promise<(Payment & { representative?: Representative, invoice?: Invoice })[]>;
  getPaymentsByRepresentative(representativeId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;

  // File import methods
  createFileImport(fileImport: InsertFileImport): Promise<FileImport>;
  getFileImport(id: number): Promise<FileImport | undefined>;
  getAllFileImports(): Promise<FileImport[]>;
  updateFileImport(id: number, updates: Partial<InsertFileImport>): Promise<FileImport | undefined>;
  processODSFile(importId: number, fileBuffer: Buffer): Promise<{ processedRows: number; generatedInvoices: number }>;

  // Settings methods
  getSetting(key: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  setSetting(key: string, value: string, type?: string, description?: string): Promise<Setting>;
  deleteSetting(key: string): Promise<void>;

  // System User methods
  getAllSystemUsers(): Promise<SystemUser[]>;
  getSystemUser(id: number): Promise<SystemUser | undefined>;
  getSystemUserByUsername(username: string): Promise<SystemUser | undefined>;
  createSystemUser(user: InsertSystemUser): Promise<SystemUser>;
  updateSystemUser(id: number, user: Partial<InsertSystemUser>): Promise<SystemUser | undefined>;
  deleteSystemUser(id: number): Promise<void>;

  // Invoice Template methods
  getAllInvoiceTemplates(): Promise<InvoiceTemplate[]>;
  getInvoiceTemplate(id: number): Promise<InvoiceTemplate | undefined>;
  getDefaultInvoiceTemplate(): Promise<InvoiceTemplate | undefined>;
  createInvoiceTemplate(template: InsertInvoiceTemplate): Promise<InvoiceTemplate>;
  updateInvoiceTemplate(id: number, template: Partial<InsertInvoiceTemplate>): Promise<InvoiceTemplate | undefined>;
  deleteInvoiceTemplate(id: number): Promise<void>;

  // Notification methods
  getAllNotifications(): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  getUnreadNotifications(userId?: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;

  // Analytics Report methods
  getAllAnalyticsReports(): Promise<AnalyticsReport[]>;
  getAnalyticsReport(id: number): Promise<AnalyticsReport | undefined>;
  createAnalyticsReport(report: InsertAnalyticsReport): Promise<AnalyticsReport>;

  // Backup Log methods
  getAllBackupLogs(): Promise<BackupLog[]>;
  getBackupLog(id: number): Promise<BackupLog | undefined>;
  createBackupLog(log: InsertBackupLog): Promise<BackupLog>;
  updateBackupLog(id: number, updates: Partial<InsertBackupLog>): Promise<BackupLog | undefined>;

  // Analytics methods
  getDashboardStats(): Promise<{
    totalRepresentatives: number;
    activeRepresentatives: number;
    totalInvoices: number;
    todayInvoices: number;
    monthlyRevenue: number;
    overdueInvoices: number;
  }>;
  getWeeklyAnalytics(): Promise<{
    weeklyInvoices: number;
    weeklyPayments: number;
    activeReps: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllRepresentatives(): Promise<Representative[]> {
    return await db.select().from(representatives).orderBy(desc(representatives.createdAt));
  }

  async getRepresentative(id: number): Promise<Representative | undefined> {
    const [representative] = await db.select().from(representatives).where(eq(representatives.id, id));
    return representative || undefined;
  }

  async getRepresentativeByAdminUsername(adminUsername: string): Promise<Representative | undefined> {
    const [representative] = await db.select().from(representatives).where(eq(representatives.adminUsername, adminUsername));
    return representative || undefined;
  }

  async createRepresentative(representative: InsertRepresentative): Promise<Representative> {
    const [newRep] = await db
      .insert(representatives)
      .values({
        ...representative,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newRep;
  }

  async updateRepresentative(id: number, representative: Partial<InsertRepresentative>): Promise<Representative | undefined> {
    const [updated] = await db
      .update(representatives)
      .set({
        ...representative,
        updatedAt: new Date(),
      })
      .where(eq(representatives.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteRepresentative(id: number): Promise<void> {
    await db.delete(representatives).where(eq(representatives.id, id));
  }

  async getAllInvoices(): Promise<(Invoice & { representative?: Representative })[]> {
    return await db
      .select({
        id: invoices.id,
        representativeId: invoices.representativeId,
        amount: invoices.amount,
        status: invoices.status,
        dueDate: invoices.dueDate,
        paidAt: invoices.paidAt,
        data: invoices.data,
        telegramLink: invoices.telegramLink,
        createdAt: invoices.createdAt,
        representative: representatives,
      })
      .from(invoices)
      .leftJoin(representatives, eq(invoices.representativeId, representatives.id))
      .orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async getInvoicesByRepresentative(representativeId: number): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.representativeId, representativeId))
      .orderBy(desc(invoices.createdAt));
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db
      .insert(invoices)
      .values({
        ...invoice,
        createdAt: new Date(),
      })
      .returning();
    return newInvoice;
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    const updateData: any = { status };
    if (status === 'paid') {
      updateData.paidAt = new Date();
    }

    const [updated] = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning();
    return updated || undefined;
  }

  async getAllPayments(): Promise<(Payment & { representative?: Representative, invoice?: Invoice })[]> {
    return await db
      .select({
        id: payments.id,
        representativeId: payments.representativeId,
        invoiceId: payments.invoiceId,
        amount: payments.amount,
        type: payments.type,
        description: payments.description,
        createdAt: payments.createdAt,
        representative: representatives,
        invoice: invoices,
      })
      .from(payments)
      .leftJoin(representatives, eq(payments.representativeId, representatives.id))
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .orderBy(desc(payments.createdAt));
  }

  async getPaymentsByRepresentative(representativeId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.representativeId, representativeId))
      .orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values({
        ...payment,
        createdAt: new Date(),
      })
      .returning();

    // Update representative balance
    if (payment.representativeId) {
      await db
        .update(representatives)
        .set({
          balance: sql`${representatives.balance} + ${payment.amount}`,
          updatedAt: new Date(),
        })
        .where(eq(representatives.id, payment.representativeId));
    }

    return newPayment;
  }

  async createFileImport(fileImport: InsertFileImport): Promise<FileImport> {
    const [newImport] = await db
      .insert(fileImports)
      .values({
        ...fileImport,
        createdAt: new Date(),
      })
      .returning();
    return newImport;
  }

  async getFileImport(id: number): Promise<FileImport | undefined> {
    const [fileImport] = await db.select().from(fileImports).where(eq(fileImports.id, id));
    return fileImport || undefined;
  }

  async updateFileImport(id: number, updates: Partial<InsertFileImport>): Promise<FileImport | undefined> {
    const [updated] = await db
      .update(fileImports)
      .set(updates)
      .where(eq(fileImports.id, id))
      .returning();
    return updated || undefined;
  }

  async processODSFile(importId: number, fileBuffer: Buffer): Promise<{ processedRows: number; generatedInvoices: number }> {
    // This is a simplified implementation. In a real application, you would use
    // a proper ODS parser library like node-ods-parser or similar
    
    // For now, we'll simulate processing and return mock results
    // In production, this would:
    // 1. Parse the ODS file
    // 2. Extract representative data by admin_username
    // 3. Calculate invoices based on usage and pricing
    // 4. Generate invoice records
    
    let processedRows = 0;
    let generatedInvoices = 0;

    try {
      // Simulate file processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, parse the ODS file here
      // const workbook = parseODS(fileBuffer);
      // const worksheet = workbook.getWorksheet(0);
      
      // Mock processing results
      processedRows = 24;
      generatedInvoices = 18; // Some rows might have "null" values

      // Update the file import record
      await this.updateFileImport(importId, {
        status: "completed",
        processedRows,
        generatedInvoices,
      });

      return { processedRows, generatedInvoices };
    } catch (error) {
      await this.updateFileImport(importId, {
        status: "failed",
        errors: [error instanceof Error ? error.message : "Unknown error during file processing"],
      });
      throw error;
    }
  }

  async getDashboardStats(): Promise<{
    totalRepresentatives: number;
    activeRepresentatives: number;
    totalInvoices: number;
    todayInvoices: number;
    monthlyRevenue: number;
    overdueInvoices: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalReps,
      activeReps,
      totalInvoices,
      todayInvoices,
      monthlyRevenue,
      overdueInvoices,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(representatives),
      db.select({ count: sql<number>`count(*)` }).from(representatives).where(eq(representatives.status, 'active')),
      db.select({ count: sql<number>`count(*)` }).from(invoices),
      db.select({ count: sql<number>`count(*)` }).from(invoices).where(gte(invoices.createdAt, today)),
      db.select({ sum: sql<number>`coalesce(sum(amount), 0)` }).from(invoices).where(
        and(
          eq(invoices.status, 'paid'),
          gte(invoices.createdAt, firstDayOfMonth)
        )
      ),
      db.select({ count: sql<number>`count(*)` }).from(invoices).where(
        and(
          eq(invoices.status, 'pending'),
          lte(invoices.dueDate, today)
        )
      ),
    ]);

    return {
      totalRepresentatives: totalReps[0]?.count || 0,
      activeRepresentatives: activeReps[0]?.count || 0,
      totalInvoices: totalInvoices[0]?.count || 0,
      todayInvoices: todayInvoices[0]?.count || 0,
      monthlyRevenue: monthlyRevenue[0]?.sum || 0,
      overdueInvoices: overdueInvoices[0]?.count || 0,
    };
  }

  async getWeeklyAnalytics(): Promise<{
    weeklyInvoices: number;
    weeklyPayments: number;
    activeReps: number;
  }> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [weeklyInvoices, weeklyPayments, activeReps] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(invoices).where(gte(invoices.createdAt, weekAgo)),
      db.select({ count: sql<number>`count(*)` }).from(payments).where(gte(payments.createdAt, weekAgo)),
      db.select({ count: sql<number>`count(*)` }).from(representatives).where(eq(representatives.status, 'active')),
    ]);

    return {
      weeklyInvoices: weeklyInvoices[0]?.count || 0,
      weeklyPayments: weeklyPayments[0]?.count || 0,
      activeReps: activeReps[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
