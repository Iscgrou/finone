import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatPersianNumber, formatPersianCurrency } from "@/lib/persian-utils";
import { Users, Receipt, TrendingUp, AlertTriangle } from "lucide-react";

interface StatsCardsProps {
  stats?: {
    totalRepresentatives: number;
    activeRepresentatives: number;
    totalInvoices: number;
    todayInvoices: number;
    monthlyRevenue: number;
    overdueInvoices: number;
  };
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="w-10 h-10 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-24 mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm">خطا در بارگذاری آمار</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const growthPercentage = 12; // Mock growth percentage

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Total Representatives */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="outline" className="text-success border-success/20 bg-success/10">
              +{formatPersianNumber(growthPercentage)}%
            </Badge>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatPersianNumber(stats.totalRepresentatives)}
          </div>
          <div className="text-sm text-muted-foreground">نمایندگان فعال</div>
        </CardContent>
      </Card>

      {/* Today's Invoices */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Receipt className="h-5 w-5 text-success" />
            </div>
            <Badge variant="outline" className="text-success border-success/20 bg-success/10">
              +{formatPersianNumber(8)}%
            </Badge>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatPersianNumber(stats.todayInvoices)}
          </div>
          <div className="text-sm text-muted-foreground">فاکتور امروز</div>
        </CardContent>
      </Card>

      {/* Monthly Revenue */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <Badge variant="outline" className="text-success border-success/20 bg-success/10">
              +{formatPersianNumber(15)}%
            </Badge>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatPersianCurrency(stats.monthlyRevenue)}
          </div>
          <div className="text-sm text-muted-foreground">درآمد ماهانه</div>
        </CardContent>
      </Card>

      {/* Overdue Invoices */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-error" />
            </div>
            {stats.overdueInvoices > 0 && (
              <Badge variant="destructive">
                +{formatPersianNumber(stats.overdueInvoices)}
              </Badge>
            )}
          </div>
          <div className="text-2xl font-bold text-error">
            {formatPersianNumber(stats.overdueInvoices)}
          </div>
          <div className="text-sm text-muted-foreground">معوقات پرداخت</div>
        </CardContent>
      </Card>
    </div>
  );
}
