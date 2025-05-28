import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import FileUpload from "@/components/invoices/file-upload";
import InvoiceGenerator from "@/components/invoices/invoice-generator";
import { Upload, Receipt, Search, FileText, Download } from "lucide-react";
import { formatPersianNumber, formatPersianCurrency, formatPersianDate } from "@/lib/persian-utils";

export default function Invoices() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const { data: representatives } = useQuery({
    queryKey: ["/api/representatives"],
  });

  const filteredInvoices = invoices?.filter((invoice: any) => {
    const matchesSearch = 
      invoice.representative?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.representative?.adminUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const stats = {
    total: invoices?.length || 0,
    pending: invoices?.filter((inv: any) => inv.status === 'pending').length || 0,
    paid: invoices?.filter((inv: any) => inv.status === 'paid').length || 0,
    overdue: invoices?.filter((inv: any) => inv.status === 'overdue').length || 0,
    totalAmount: invoices?.reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0,
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 md:p-6 -m-4 md:-m-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Receipt className="h-6 w-6" />
              مرکز فاکتورها
            </h1>
            <p className="text-muted-foreground mt-1">مدیریت و تولید فاکتورهای نمایندگان</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              آپلود فایل ODS
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              خروجی Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">کل فاکتورها</p>
                <p className="text-2xl font-bold">{formatPersianNumber(stats.total)}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">پرداخت شده</p>
                <p className="text-2xl font-bold text-success">{formatPersianNumber(stats.paid)}</p>
              </div>
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">در انتظار</p>
                <p className="text-2xl font-bold text-warning">{formatPersianNumber(stats.pending)}</p>
              </div>
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">کل مبلغ</p>
                <p className="text-2xl font-bold">{formatPersianCurrency(stats.totalAmount)}</p>
              </div>
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            تولید فاکتور از فایل ODS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
                 onClick={() => setIsUploadOpen(true)}>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-medium mb-2">بارگذاری فایل ODS</h4>
              <p className="text-muted-foreground mb-4">
                فایل صادراتی از پنل Marzban را اینجا بکشید یا کلیک کنید
              </p>
              <Button>انتخاب فایل</Button>
              <p className="text-xs text-muted-foreground mt-2">
                فرمت‌های پشتیبانی شده: .ods
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="font-medium">آخرین فایل پردازش شده</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  billing_data_2024_01_15.ods
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPersianDate(new Date())} - {formatPersianNumber(14)}:{formatPersianNumber(30)}
                </p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="default">
                    {formatPersianNumber(24)} نماینده
                  </Badge>
                  <Badge variant="secondary">
                    {formatPersianNumber(48)} فاکتور
                  </Badge>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4">
                <h5 className="font-medium mb-2">راهنمای کاربرد</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• فایل باید شامل admin_username در ستون A باشد</li>
                  <li>• مقادیر "null" برای عدم استفاده نادیده گرفته می‌شوند</li>
                  <li>• قیمت‌گذاری از پنل نمایندگان اعمال می‌شود</li>
                  <li>• فاکتورها به صورت خودکار تولید می‌شوند</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو بر اساس نام نماینده، شماره فاکتور..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <Badge
                variant={statusFilter === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setStatusFilter("all")}
              >
                همه
              </Badge>
              <Badge
                variant={statusFilter === "pending" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setStatusFilter("pending")}
              >
                در انتظار
              </Badge>
              <Badge
                variant={statusFilter === "paid" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setStatusFilter("paid")}
              >
                پرداخت شده
              </Badge>
              <Badge
                variant={statusFilter === "overdue" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setStatusFilter("overdue")}
              >
                معوق
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>لیست فاکتورها</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg"></div>
                      <div>
                        <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">فاکتوری یافت نشد</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "هیچ فاکتوری با این شرایط یافت نشد"
                  : "هنوز فاکتوری صادر نشده است"}
              </p>
              <Button onClick={() => setIsUploadOpen(true)}>
                آپلود فایل اول
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        فاکتور #{formatPersianNumber(invoice.id)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.representative?.fullName || 'نامشخص'} ({invoice.representative?.adminUsername})
                      </div>
                      <div className="text-xs text-muted-foreground">
                        تاریخ: {formatPersianDate(new Date(invoice.createdAt))}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold mb-1">
                      {formatPersianCurrency(invoice.amount)}
                    </div>
                    <Badge variant={
                      invoice.status === 'paid' ? 'default' :
                      invoice.status === 'overdue' ? 'destructive' : 'secondary'
                    }>
                      {invoice.status === 'paid' ? 'پرداخت شده' :
                       invoice.status === 'overdue' ? 'معوق' : 'در انتظار'}
                    </Badge>
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="outline">
                        مشاهده
                      </Button>
                      <Button size="sm" variant="outline">
                        PDF
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Upload Modal */}
      <FileUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
