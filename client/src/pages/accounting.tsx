import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Wallet, TrendingUp, TrendingDown, Plus, Search, Calendar } from "lucide-react";
import { formatPersianNumber, formatPersianCurrency, formatPersianDate } from "@/lib/persian-utils";

const paymentSchema = z.object({
  representativeId: z.number(),
  amount: z.number().min(1),
  type: z.enum(["full", "partial", "manual"]),
  description: z.string().optional(),
});

export default function Accounting() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: representatives, isLoading: repsLoading } = useQuery({
    queryKey: ["/api/representatives"],
  });

  const { data: payments, isLoading: paymentsLoading, refetch: refetchPayments } = useQuery({
    queryKey: ["/api/payments"],
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      type: "manual",
      description: "",
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data: z.infer<typeof paymentSchema>) =>
      apiRequest("POST", "/api/payments", data),
    onSuccess: () => {
      toast({
        title: "پرداخت ثبت شد",
        description: "پرداخت با موفقیت در سیستم ثبت شد",
      });
      setIsPaymentModalOpen(false);
      form.reset();
      refetchPayments();
      queryClient.invalidateQueries({ queryKey: ["/api/representatives"] });
    },
    onError: () => {
      toast({
        title: "خطا در ثبت پرداخت",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    },
  });

  const filteredReps = representatives?.filter((rep: any) =>
    rep.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.adminUsername.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    totalBalance: representatives?.reduce((sum: number, rep: any) => sum + rep.balance, 0) || 0,
    positiveBalance: representatives?.filter((rep: any) => rep.balance > 0).reduce((sum: number, rep: any) => sum + rep.balance, 0) || 0,
    negativeBalance: representatives?.filter((rep: any) => rep.balance < 0).reduce((sum: number, rep: any) => sum + rep.balance, 0) || 0,
    totalPayments: payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0,
    creditors: representatives?.filter((rep: any) => rep.balance > 0).length || 0,
    debtors: representatives?.filter((rep: any) => rep.balance < 0).length || 0,
  };

  const onSubmit = (data: z.infer<typeof paymentSchema>) => {
    createPaymentMutation.mutate(data);
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 md:p-6 -m-4 md:-m-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              حسابداری و مالی
            </h1>
            <p className="text-muted-foreground mt-1">مدیریت مالی و پیگیری پرداخت‌های نمایندگان</p>
          </div>
          <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                ثبت پرداخت دستی
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>ثبت پرداخت دستی</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="representativeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نماینده</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب نماینده" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {representatives?.map((rep: any) => (
                              <SelectItem key={rep.id} value={rep.id.toString()}>
                                {rep.fullName} ({rep.adminUsername})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مبلغ (تومان)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="۱۰۰۰۰۰"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="ltr text-right"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>توضیحات (اختیاری)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="توضیحات پرداخت..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={createPaymentMutation.isPending}
                    >
                      {createPaymentMutation.isPending ? "در حال ثبت..." : "ثبت پرداخت"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsPaymentModalOpen(false)}
                    >
                      انصراف
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">موجودی کل</p>
                <p className={`text-2xl font-bold ${stats.totalBalance >= 0 ? 'text-success' : 'text-error'}`}>
                  {formatPersianCurrency(stats.totalBalance)}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">طلبکاران</p>
                <p className="text-2xl font-bold text-success">
                  {formatPersianCurrency(stats.positiveBalance)}
                </p>
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
                <p className="text-sm text-muted-foreground">بدهکاران</p>
                <p className="text-2xl font-bold text-error">
                  {formatPersianCurrency(Math.abs(stats.negativeBalance))}
                </p>
              </div>
              <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-error" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">کل پرداخت‌ها</p>
                <p className="text-2xl font-bold">
                  {formatPersianCurrency(stats.totalPayments)}
                </p>
              </div>
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">طلبکاران</p>
                <p className="text-2xl font-bold text-success">
                  {formatPersianNumber(stats.creditors)}
                </p>
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
                <p className="text-sm text-muted-foreground">بدهکاران</p>
                <p className="text-2xl font-bold text-error">
                  {formatPersianNumber(stats.debtors)}
                </p>
              </div>
              <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-error" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو بر اساس نام یا نام کاربری..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">همه</Badge>
              <Badge variant="default">طلبکاران</Badge>
              <Badge variant="destructive">بدهکاران</Badge>
              <Badge variant="secondary">تسویه</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Representatives Balance List */}
      <Card>
        <CardHeader>
          <CardTitle>وضعیت مالی نمایندگان</CardTitle>
        </CardHeader>
        <CardContent>
          {repsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
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
          ) : filteredReps.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">نماینده‌ای یافت نشد</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "هیچ نماینده‌ای با این شرایط یافت نشد" : "هنوز نماینده‌ای ثبت نشده است"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReps.map((rep: any) => (
                <div key={rep.id} className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                      rep.balance > 0 ? 'bg-success' : rep.balance < 0 ? 'bg-error' : 'bg-muted-foreground'
                    }`}>
                      {rep.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{rep.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {rep.adminUsername}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {rep.telegramId && `تلگرام: ${rep.telegramId}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className={`font-bold text-lg ${
                      rep.balance > 0 ? 'text-success' : rep.balance < 0 ? 'text-error' : 'text-muted-foreground'
                    }`}>
                      {rep.balance > 0 ? '+' : ''}{formatPersianCurrency(rep.balance)}
                    </div>
                    <Badge variant={
                      rep.balance > 0 ? 'default' : rep.balance < 0 ? 'destructive' : 'secondary'
                    }>
                      {rep.balance > 0 ? 'طلبکار' : rep.balance < 0 ? 'بدهکار' : 'تسویه'}
                    </Badge>
                    <div className="mt-2">
                      <Button size="sm" variant="outline">
                        تاریخچه پرداخت
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            آخرین پرداخت‌ها
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-lg"></div>
                      <div>
                        <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-muted rounded w-20 mb-1"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : payments?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              هنوز پرداختی ثبت نشده است
            </div>
          ) : (
            <div className="space-y-4">
              {payments?.slice(0, 10).map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {payment.representative?.fullName || 'نامشخص'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payment.description || 'پرداخت ' + payment.type}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-success">
                      +{formatPersianCurrency(payment.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatPersianDate(new Date(payment.createdAt))}
                    </div>
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
