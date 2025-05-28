import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, PieChart, Users, Receipt, Calendar } from "lucide-react";
import { formatPersianNumber, formatPersianCurrency, formatPersianDate } from "@/lib/persian-utils";

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: weeklyAnalytics, isLoading: weeklyLoading } = useQuery({
    queryKey: ["/api/analytics/weekly"],
  });

  const { data: representatives } = useQuery({
    queryKey: ["/api/representatives"],
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/payments"],
  });

  // Calculate analytics
  const totalRevenue = invoices?.filter((inv: any) => inv.status === 'paid')
    .reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0;

  const averageInvoice = invoices?.length ? totalRevenue / invoices.filter((inv: any) => inv.status === 'paid').length : 0;

  const topRepresentatives = representatives?.map((rep: any) => {
    const repInvoices = invoices?.filter((inv: any) => inv.representativeId === rep.id) || [];
    const totalSales = repInvoices.filter((inv: any) => inv.status === 'paid')
      .reduce((sum: number, inv: any) => sum + inv.amount, 0);
    return { ...rep, totalSales, invoiceCount: repInvoices.length };
  }).sort((a: any, b: any) => b.totalSales - a.totalSales).slice(0, 5) || [];

  // Monthly data simulation for charts
  const monthlyData = [
    { month: 'فروردین', invoices: 45, revenue: 2500000, reps: 18 },
    { month: 'اردیبهشت', invoices: 52, revenue: 2800000, reps: 21 },
    { month: 'خرداد', invoices: 48, revenue: 2650000, reps: 19 },
    { month: 'تیر', invoices: 67, revenue: 3400000, reps: 24 },
    { month: 'مرداد', invoices: 71, revenue: 3750000, reps: 27 },
    { month: 'شهریور', invoices: 83, revenue: 4200000, reps: 29 },
  ];

  const statusDistribution = invoices ? [
    { status: 'پرداخت شده', count: invoices.filter((inv: any) => inv.status === 'paid').length, color: 'bg-success' },
    { status: 'در انتظار', count: invoices.filter((inv: any) => inv.status === 'pending').length, color: 'bg-warning' },
    { status: 'معوق', count: invoices.filter((inv: any) => inv.status === 'overdue').length, color: 'bg-error' },
  ] : [];

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 md:p-6 -m-4 md:-m-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              آنالیتیکس هوشمند
            </h1>
            <p className="text-muted-foreground mt-1">تحلیل عمقی عملکرد و روندهای فروش</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">این ماه</Badge>
            <Badge variant="default">۶ ماه اخیر</Badge>
            <Badge variant="outline">سال جاری</Badge>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">کل درآمد</p>
                <p className="text-2xl font-bold">{formatPersianCurrency(totalRevenue)}</p>
                <div className="flex items-center text-success text-sm mt-1">
                  <TrendingUp className="h-3 w-3 ml-1" />
                  <span>+{formatPersianNumber(15)}% از ماه گذشته</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">میانگین فاکتور</p>
                <p className="text-2xl font-bold">{formatPersianCurrency(averageInvoice)}</p>
                <div className="flex items-center text-success text-sm mt-1">
                  <TrendingUp className="h-3 w-3 ml-1" />
                  <span>+{formatPersianNumber(8)}% از ماه گذشته</span>
                </div>
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
                <p className="text-sm text-muted-foreground">نرخ پرداخت</p>
                <p className="text-2xl font-bold">
                  {formatPersianNumber(invoices ? Math.round((invoices.filter((inv: any) => inv.status === 'paid').length / invoices.length) * 100) : 0)}%
                </p>
                <div className="flex items-center text-success text-sm mt-1">
                  <TrendingUp className="h-3 w-3 ml-1" />
                  <span>+{formatPersianNumber(5)}% از ماه گذشته</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <PieChart className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">نمایندگان فعال</p>
                <p className="text-2xl font-bold">
                  {formatPersianNumber(representatives?.filter((rep: any) => rep.status === 'active').length || 0)}
                </p>
                <div className="flex items-center text-success text-sm mt-1">
                  <TrendingUp className="h-3 w-3 ml-1" />
                  <span>+{formatPersianNumber(12)}% از ماه گذشته</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              روند ماهانه فروش
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">{month.month}</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{formatPersianCurrency(month.revenue)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPersianNumber(month.invoices)} فاکتور
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              توزیع وضعیت فاکتورها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{formatPersianNumber(item.count)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPersianNumber(invoices ? Math.round((item.count / invoices.length) * 100) : 0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Representatives and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Representatives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              برترین نمایندگان (بر اساس فروش)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRepresentatives.map((rep: any, index) => (
                <div key={rep.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-muted-foreground'
                    }`}>
                      {formatPersianNumber(index + 1)}
                    </div>
                    <div>
                      <div className="font-medium">{rep.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatPersianNumber(rep.invoiceCount)} فاکتور
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{formatPersianCurrency(rep.totalSales)}</div>
                    <div className="text-xs text-muted-foreground">
                      میانگین: {formatPersianCurrency(rep.invoiceCount ? rep.totalSales / rep.invoiceCount : 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              بینش‌های عملکرد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-success/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="font-medium text-success">رشد مثبت</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  فروش در ماه جاری {formatPersianNumber(15)}% نسبت به ماه گذشته افزایش یافته است
                </p>
              </div>

              <div className="bg-warning/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span className="font-medium text-warning">نیاز به توجه</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatPersianNumber(5)} نماینده بیش از {formatPersianNumber(7)} روز معوقات دارند
                </p>
              </div>

              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-medium text-primary">پیشنهاد بهبود</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  ارسال یادآوری خودکار برای نمایندگان با معوقات بیش از {formatPersianNumber(3)} روز
                </p>
              </div>

              <div className="bg-secondary/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="font-medium text-secondary">فرصت رشد</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatPersianNumber(3)} نماینده جدید در انتظار تائید و فعال‌سازی هستند
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Analytics Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            خلاصه عملکرد هفتگی
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-16 mb-2"></div>
                  <div className="h-2 bg-muted rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">فاکتورهای صادر شده</span>
                  <span className="font-semibold">{formatPersianNumber(weeklyAnalytics?.weeklyInvoices || 0)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">هدف هفتگی: {formatPersianNumber(80)}</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">پرداخت‌های دریافتی</span>
                  <span className="font-semibold">{formatPersianNumber(weeklyAnalytics?.weeklyPayments || 0)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">نرخ وصولی: {formatPersianNumber(80)}%</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">نمایندگان فعال</span>
                  <span className="font-semibold">{formatPersianNumber(weeklyAnalytics?.activeReps || 0)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">از کل {formatPersianNumber(representatives?.length || 0)} نماینده</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
