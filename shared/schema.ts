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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
