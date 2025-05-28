import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatPersianNumber, formatPersianCurrency, formatPersianDate } from "@/lib/persian-utils";
import { FileText, Download, Eye, Check, Clock, AlertCircle } from "lucide-react";

interface InvoiceGeneratorProps {
  importData?: {
    id: number;
    filename: string;
    status: string;
    processedRows: number;
    generatedInvoices: number;
    createdAt: string;
  };
}

export default function InvoiceGenerator({ importData }: InvoiceGeneratorProps) {
  const [generatingPDFs, setGeneratingPDFs] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  const handleGeneratePDFs = async () => {
    setGeneratingPDFs(true);
    setPdfProgress(0);

    // Simulate PDF generation progress
    const interval = setInterval(() => {
      setPdfProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGeneratingPDFs(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDownloadAll = () => {
    // Simulate downloading all PDFs as a ZIP file
    alert('دانلود فایل ZIP شامل تمام فاکتورهای PDF آغاز شد');
  };

  const handleSendToTelegram = () => {
    // Simulate sending invoices to Telegram
    alert('ارسال فاکتورها به تلگرام آغاز شد');
  };

  if (!importData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">فایلی بارگذاری نشده</h3>
          <p className="text-muted-foreground">
            برای تولید فاکتور، ابتدا فایل ODS را بارگذاری کنید
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Import Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            وضعیت پردازش فایل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium">{importData.filename}</div>
              <div className="text-sm text-muted-foreground">
                {formatPersianDate(new Date(importData.createdAt))}
              </div>
            </div>
            <Badge variant={
              importData.status === 'completed' ? 'default' :
              importData.status === 'processing' ? 'secondary' :
              'destructive'
            }>
              {importData.status === 'completed' ? 'تکمیل شده' :
               importData.status === 'processing' ? 'در حال پردازش' :
               'خطا'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{formatPersianNumber(importData.processedRows)}</div>
              <div className="text-sm text-muted-foreground">ردیف پردازش شده</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">{formatPersianNumber(importData.generatedInvoices)}</div>
              <div className="text-sm text-muted-foreground">فاکتور تولید شده</div>
            </div>
          </div>

          {importData.status === 'completed' && (
            <div className="flex items-center gap-2 text-success">
              <Check className="h-4 w-4" />
              <span className="text-sm">پردازش با موفقیت تکمیل شد</span>
            </div>
          )}

          {importData.status === 'processing' && (
            <div className="flex items-center gap-2 text-warning">
              <Clock className="h-4 w-4" />
              <span className="text-sm">در حال پردازش...</span>
            </div>
          )}

          {importData.status === 'failed' && (
            <div className="flex items-center gap-2 text-error">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">خطا در پردازش فایل</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Generation */}
      {importData.status === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle>تولید فاکتورهای PDF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {formatPersianNumber(importData.generatedInvoices)} فاکتور آماده تولید PDF
              </span>
              <Button 
                onClick={handleGeneratePDFs}
                disabled={generatingPDFs}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                {generatingPDFs ? 'در حال تولید...' : 'تولید همه PDFها'}
              </Button>
            </div>

            {generatingPDFs && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>در حال تولید فایل‌های PDF...</span>
                  <span>{formatPersianNumber(pdfProgress)}%</span>
                </div>
                <Progress value={pdfProgress} className="h-2" />
              </div>
            )}

            {pdfProgress === 100 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button variant="outline" onClick={handleDownloadAll} className="gap-2">
                  <Download className="h-4 w-4" />
                  دانلود همه (ZIP)
                </Button>
                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  پیش‌نمایش
                </Button>
                <Button variant="outline" onClick={handleSendToTelegram} className="gap-2">
                  ارسال به تلگرام
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invoice Preview */}
      {importData.status === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle>نمونه فاکتور تولید شده</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-muted/30">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">فاکتور فروش خدمات VPN</h3>
                <p className="text-sm text-muted-foreground">شماره: #{formatPersianNumber(1001)}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium mb-2">اطلاعات نماینده:</h4>
                  <p className="text-sm">علی رضایی</p>
                  <p className="text-sm text-muted-foreground">admin_ali</p>
                  <p className="text-sm text-muted-foreground">@ali_vpn</p>
                </div>
                <div className="text-left">
                  <h4 className="font-medium mb-2">تاریخ صدور:</h4>
                  <p className="text-sm">{formatPersianDate(new Date())}</p>
                  <p className="text-sm text-muted-foreground">سررسید: {formatPersianDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span>خدمات محدود (۱۲ گیگابایت)</span>
                  <span>{formatPersianCurrency(60000)}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span>خدمات نامحدود (۲ ماه)</span>
                  <span>{formatPersianCurrency(50000)}</span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>مجموع کل:</span>
                    <span>{formatPersianCurrency(110000)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4 text-center">
              این یک نمونه فاکتور است. فاکتورهای واقعی با اطلاعات کامل تولید خواهند شد.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
