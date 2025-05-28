import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const representatives = pgTable("representatives", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  adminUsername: text("admin_username").notNull().unique(),
  telegramId: text("telegram_id"),
  phoneNumber: text("phone_number"),
  storeName: text("store_name"),
  status: text("status").notNull().default("active"), // active, inactive, pending
  balance: integer("balance").default(0), // in tomans
  pricing: jsonb("pricing").$type<{
    limited1Month: number;
    limited2Month: number;
    limited3Month: number;
    limited4Month: number;
    limited5Month: number;
    limited6Month: number;
    unlimitedMonthly: number;
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  representativeId: integer("representative_id").notNull().references(() => representatives.id),
  amount: integer("amount").notNull(), // in tomans
  status: text("status").notNull().default("pending"), // pending, paid, overdue
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  data: jsonb("data").$type<{
    limitedUsage: { [key: string]: number }; // month -> GB
    unlimitedUsage: { [key: string]: number }; // month -> count
    calculations: {
      limitedTotal: number;
      unlimitedTotal: number;
      total: number;
    };
  }>(),
  telegramLink: text("telegram_link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  representativeId: integer("representative_id").notNull().references(() => representatives.id),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  amount: integer("amount").notNull(), // in tomans
  type: text("type").notNull(), // full, partial, manual
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fileImports = pgTable("file_imports", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  status: text("status").notNull(), // processing, completed, failed
  processedRows: integer("processed_rows").default(0),
  generatedInvoices: integer("generated_invoices").default(0),
  errors: jsonb("errors").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Settings table for system configuration
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  type: text("type").notNull().default("string"), // string, number, boolean, json
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users table for multi-user access
export const systemUsers = pgTable("system_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  accessLevel: text("access_level").notNull().default("viewer"), // admin, manager, operator, viewer
  permissions: jsonb("permissions").$type<{
    dashboard: boolean;
    representatives: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    invoices: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    payments: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    analytics: boolean;
    settings: boolean;
    backup: boolean;
  }>(),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Invoice templates for customization
export const invoiceTemplates = pgTable("invoice_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  headerHtml: text("header_html"),
  bodyHtml: text("body_html"),
  footerHtml: text("footer_html"),
  styles: text("styles"), // CSS styles
  outputFormat: text("output_format").notNull().default("pdf"), // pdf, image
  fields: jsonb("fields").$type<{
    showLogo: boolean;
    showCompanyInfo: boolean;
    showDueDate: boolean;
    showQrCode: boolean;
    customFields: { label: string; value: string }[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications and alerts
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // performance_drop, overdue_payment, inactive_rep, etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  isRead: boolean("is_read").notNull().default(false),
  sentToTelegram: boolean("sent_to_telegram").notNull().default(false),
  userId: integer("user_id").references(() => systemUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Analytics results storage
export const analyticsReports = pgTable("analytics_reports", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // weekly_performance, sales_drop, etc.
  period: text("period").notNull(), // week, month, quarter
  data: jsonb("data").notNull(),
  insights: text("insights"), // AI-generated insights
  recommendations: text("recommendations"), // AI recommendations
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Backup logs
export const backupLogs = pgTable("backup_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // backup, restore
  status: text("status").notNull(), // success, failed, in_progress
  destination: text("destination").notNull(), // google_drive, local
  fileSize: integer("file_size"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const representativesRelations = relations(representatives, ({ many }) => ({
  invoices: many(invoices),
  payments: many(payments),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  representative: one(representatives, {
    fields: [invoices.representativeId],
    references: [representatives.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  representative: one(representatives, {
    fields: [payments.representativeId],
    references: [representatives.id],
  }),
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));

// Insert schemas
export const insertRepresentativeSchema = createInsertSchema(representatives).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertFileImportSchema = createInsertSchema(fileImports).omit({
  id: true,
  createdAt: true,
});

// Additional schemas for new tables
export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertSystemUserSchema = createInsertSchema(systemUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export const insertInvoiceTemplateSchema = createInsertSchema(invoiceTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsReportSchema = createInsertSchema(analyticsReports).omit({
  id: true,
  createdAt: true,
});

export const insertBackupLogSchema = createInsertSchema(backupLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertRepresentative = z.infer<typeof insertRepresentativeSchema>;
export type Representative = typeof representatives.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertFileImport = z.infer<typeof insertFileImportSchema>;
export type FileImport = typeof fileImports.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSystemUser = z.infer<typeof insertSystemUserSchema>;
export type SystemUser = typeof systemUsers.$inferSelect;
export type InsertInvoiceTemplate = z.infer<typeof insertInvoiceTemplateSchema>;
export type InvoiceTemplate = typeof invoiceTemplates.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertAnalyticsReport = z.infer<typeof insertAnalyticsReportSchema>;
export type AnalyticsReport = typeof analyticsReports.$inferSelect;
export type InsertBackupLog = z.infer<typeof insertBackupLogSchema>;
export type BackupLog = typeof backupLogs.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
