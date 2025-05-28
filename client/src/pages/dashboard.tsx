import { useQuery } from "@tanstack/react-query";
import StatsCards from "@/components/dashboard/stats-cards";
import QuickActions from "@/components/dashboard/quick-actions";
import AINotificationChecklist from "@/components/dashboard/ai-notification-checklist";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatPersianNumber, formatPersianCurrency, formatPersianDateTime } from "@/lib/persian-utils";
import { 
  TrendingUp, TrendingDown, Activity, Clock, 
  DollarSign, Users, FileText, Bot 
} from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: representatives, isLoading: repsLoading } = useQuery({
    queryKey: ["/api/representatives"],
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/weekly"],
  });

  const recentReps = representatives?.slice(0, 5) || [];
  const recentInvoices = invoices?.slice(0, 5) || [];

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 md:p-6 -m-4 md:-m-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">داشبورد مدیریت</h1>
            <p className="text-muted-foreground mt-1">نمای کلی از عملکرد نمایندگان</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="default" className="gap-2">
              <Receipt className="h-4 w-4" />
              بارگذاری فایل ODS
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge variant="destructive" className="absolute -top-1 -left-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                  {formatPersianNumber(3)}
                </Badge>
              </Button>
              <Avatar>
                <AvatarFallback>ا</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} isLoading={statsLoading} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Representatives */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              نمایندگان اخیر
            </CardTitle>
            <Button variant="ghost" size="sm">
              مشاهده همه
            </Button>
          </CardHeader>
          <CardContent>
            {repsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                      <div className="h-4 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentReps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                هنوز نماینده‌ای ثبت نشده است
              </div>
            ) : (
              <div className="space-y-4">
                {recentReps.map((rep: any) => (
                  <div key={rep.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {rep.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{rep.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          نماینده: {rep.adminUsername}
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge variant={rep.status === 'active' ? 'default' : 'secondary'}>
                        {rep.status === 'active' ? 'فعال' : 'غیرفعال'}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {rep.balance > 0 ? '+' : ''}{formatPersianCurrency(rep.balance)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions and Analytics */}
        <div className="space-y-6">
          {/* Weekly Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                آمار هفتگی
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex justify-between mb-2">
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-4 bg-muted rounded w-12"></div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">صورتحساب‌های صادر شده</span>
                      <span className="font-semibold">{formatPersianNumber(analytics?.weeklyInvoices || 0)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">پرداخت‌های دریافتی</span>
                      <span className="font-semibold">{formatPersianNumber(analytics?.weeklyPayments || 0)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">نمایندگان فعال</span>
                      <span className="font-semibold">{formatPersianNumber(analytics?.activeReps || 0)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Invoices */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            فاکتورهای اخیر
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between py-3">
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
              ))}
            </div>
          ) : recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              هنوز فاکتوری صادر نشده است
            </div>
          ) : (
            <div className="space-y-4">
              {recentInvoices.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">فاکتور #{formatPersianNumber(invoice.id)}</div>
                      <div className="text-sm text-muted-foreground">
                        نماینده: {invoice.representative?.fullName || 'نامشخص'}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{formatPersianCurrency(invoice.amount)}</div>
                    <Badge variant={
                      invoice.status === 'paid' ? 'default' :
                      invoice.status === 'overdue' ? 'destructive' : 'secondary'
                    }>
                      {invoice.status === 'paid' ? 'پرداخت شده' :
                       invoice.status === 'overdue' ? 'معوق' : 'در انتظار'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
