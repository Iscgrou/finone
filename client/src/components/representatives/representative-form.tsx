import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, CreditCard } from "lucide-react";

const representativeSchema = z.object({
  fullName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  adminUsername: z.string().min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد"),
  telegramId: z.string().optional(),
  phoneNumber: z.string().optional(),
  storeName: z.string().optional(),
  pricing: z.object({
    limited1Month: z.number().min(0, "قیمت نمی‌تواند منفی باشد"),
    limited2Month: z.number().min(0, "قیمت نمی‌تواند منفی باشد"),
    limited3Month: z.number().min(0, "قیمت نمی‌تواند منفی باشد"),
    limited4Month: z.number().min(0, "قیمت نمی‌تواند منفی باشد"),
    limited5Month: z.number().min(0, "قیمت نمی‌تواند منفی باشد"),
    limited6Month: z.number().min(0, "قیمت نمی‌تواند منفی باشد"),
    unlimitedMonthly: z.number().min(0, "قیمت نمی‌تواند منفی باشد"),
  }),
});

type RepresentativeFormData = z.infer<typeof representativeSchema>;

interface RepresentativeFormProps {
  isOpen: boolean;
  onClose: () => void;
  representative?: any;
}

export default function RepresentativeForm({ isOpen, onClose, representative }: RepresentativeFormProps) {
  const { toast } = useToast();
  const isEditing = !!representative;

  const form = useForm<RepresentativeFormData>({
    resolver: zodResolver(representativeSchema),
    defaultValues: representative || {
      fullName: "",
      adminUsername: "",
      telegramId: "",
      phoneNumber: "",
      storeName: "",
      pricing: {
        limited1Month: 0,
        limited2Month: 0,
        limited3Month: 0,
        limited4Month: 0,
        limited5Month: 0,
        limited6Month: 0,
        unlimitedMonthly: 0,
      },
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: RepresentativeFormData) =>
      apiRequest("POST", "/api/representatives", { ...data, status: "active", balance: 0 }),
    onSuccess: () => {
      toast({
        title: "نماینده اضافه شد",
        description: "نماینده جدید با موفقیت در سیستم ثبت شد",
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/representatives"] });
    },
    onError: () => {
      toast({
        title: "خطا در ثبت نماینده",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: RepresentativeFormData) =>
      apiRequest("PUT", `/api/representatives/${representative.id}`, data),
    onSuccess: () => {
      toast({
        title: "نماینده بروزرسانی شد",
        description: "اطلاعات نماینده با موفقیت بروزرسانی شد",
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/representatives"] });
    },
    onError: () => {
      toast({
        title: "خطا در بروزرسانی",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RepresentativeFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? "ویرایش نماینده" : "افزودن نماینده جدید"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">اطلاعات پایه</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام کامل *</FormLabel>
                      <FormControl>
                        <Input placeholder="علی رضایی" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام کاربری ادمین *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ali_vpn" 
                          className="ltr text-right"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telegramId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>شناسه تلگرام</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="@alirezaei" 
                          className="ltr text-right"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>شماره تلفن</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="09123456789" 
                          className="ltr text-right"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>نام فروشگاه (اختیاری)</FormLabel>
                      <FormControl>
                        <Input placeholder="فروشگاه VPN علی" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  تنظیمات قیمت‌گذاری
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Limited Plans */}
                <div>
                  <h4 className="font-medium mb-4">قیمت محدود (تومان به ازای هر گیگابایت)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="pricing.limited1Month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>۱ ماهه</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="۵۰۰۰"
                              className="ltr text-right"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pricing.limited2Month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>۲ ماهه</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="۴۵۰۰"
                              className="ltr text-right"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pricing.limited3Month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>۳ ماهه</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="۴۰۰۰"
                              className="ltr text-right"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pricing.limited4Month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>۴ ماهه</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="۳۸۰۰"
                              className="ltr text-right"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pricing.limited5Month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>۵ ماهه</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="۳۵۰۰"
                              className="ltr text-right"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pricing.limited6Month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>۶ ماهه</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="۳۲۰۰"
                              className="ltr text-right"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Unlimited Plans */}
                <div>
                  <h4 className="font-medium mb-4">قیمت نامحدود (تومان به ازای هر ماه)</h4>
                  <div className="max-w-xs">
                    <FormField
                      control={form.control}
                      name="pricing.unlimitedMonthly"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ماهانه</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="۲۵۰۰۰"
                              className="ltr text-right"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isPending}
              >
                {isPending 
                  ? (isEditing ? "در حال بروزرسانی..." : "در حال ذخیره...") 
                  : (isEditing ? "بروزرسانی نماینده" : "ذخیره نماینده")
                }
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                انصراف
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
