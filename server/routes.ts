import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRepresentativeSchema, insertInvoiceSchema, insertPaymentSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.oasis.opendocument.spreadsheet' || 
        file.originalname.endsWith('.ods')) {
      cb(null, true);
    } else {
      cb(new Error('Only ODS files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Representatives endpoints
  app.get("/api/representatives", async (req, res) => {
    try {
      const representatives = await storage.getAllRepresentatives();
      res.json(representatives);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch representatives" });
    }
  });

  app.get("/api/representatives/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const representative = await storage.getRepresentative(id);
      if (!representative) {
        return res.status(404).json({ message: "Representative not found" });
      }
      res.json(representative);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch representative" });
    }
  });

  app.post("/api/representatives", async (req, res) => {
    try {
      const validatedData = insertRepresentativeSchema.parse(req.body);
      const representative = await storage.createRepresentative(validatedData);
      res.status(201).json(representative);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create representative" });
    }
  });

  app.put("/api/representatives/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRepresentativeSchema.parse(req.body);
      const representative = await storage.updateRepresentative(id, validatedData);
      if (!representative) {
        return res.status(404).json({ message: "Representative not found" });
      }
      res.json(representative);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update representative" });
    }
  });

  app.delete("/api/representatives/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRepresentative(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete representative" });
    }
  });

  // Invoices endpoints
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/representative/:repId", async (req, res) => {
    try {
      const repId = parseInt(req.params.repId);
      const invoices = await storage.getInvoicesByRepresentative(repId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.put("/api/invoices/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!['pending', 'paid', 'overdue'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const invoice = await storage.updateInvoiceStatus(id, status);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to update invoice status" });
    }
  });

  // Payments endpoints
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get("/api/payments/representative/:repId", async (req, res) => {
    try {
      const repId = parseInt(req.params.repId);
      const payments = await storage.getPaymentsByRepresentative(repId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // File upload and processing
  app.post("/api/upload-ods", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileImport = await storage.createFileImport({
        filename: req.file.originalname,
        status: "processing"
      });

      // Process file in background (simplified for now)
      // In a real app, this would be done with a job queue
      setTimeout(async () => {
        try {
          const result = await storage.processODSFile(fileImport.id, req.file!.buffer);
          await storage.updateFileImport(fileImport.id, {
            status: "completed",
            processedRows: result.processedRows,
            generatedInvoices: result.generatedInvoices
          });
        } catch (error) {
          await storage.updateFileImport(fileImport.id, {
            status: "failed",
            errors: [error instanceof Error ? error.message : "Unknown error"]
          });
        }
      }, 1000);

      res.json({ 
        message: "File upload started", 
        importId: fileImport.id 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get("/api/file-imports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const fileImport = await storage.getFileImport(id);
      if (!fileImport) {
        return res.status(404).json({ message: "File import not found" });
      }
      res.json(fileImport);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch file import" });
    }
  });

  // Analytics and dashboard
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/analytics/weekly", async (req, res) => {
    try {
      const analytics = await storage.getWeeklyAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
