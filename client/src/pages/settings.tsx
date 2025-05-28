import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Download, Upload, Trash2, Database, Bell, Shield, Globe } from "lucide-react";
import { formatPersianDate, formatPersianNumber } from "@/lib/persian-utils";

export default function Settings() {
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupInterval: 'daily',
    cloudBackup: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    overdueInvoices: true,
    newRepresentatives: true,
    paymentReceived: true,
    systemAlerts: true,
  });

  const handleBackupNow = () => {
    // Implement backup functionality
    alert('پشتیبان‌گیری آغاز شد. در صورت تکمیل، اطلاع‌رسانی خواهید شد.');
  };

  const handleExportData = () => {
    // Implement data export
    alert('خروجی داده‌ها آغاز شد. فایل Excel در حال آماده‌سازی است.');
  };

  const handleImportData = () => {
    // Implement data import
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv,.xlsx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        alert(`فایل ${file.name} انتخاب شد. قابلیت ایمپورت در نسخه آینده اضافه خواهد شد.`);
      }
    };
    input.click();
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 md:p-6 -m-4 md:-m-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <SettingsIcon className="h-6 w-6" />
              تنظیمات و پشتیبان‌گیری
            </h1>
            <p className="text-muted-foreground mt-1">مدیریت تنظیمات سیستم و پشتیبان‌گیری داده‌ها</p>
          </div>
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            سیستم سالم
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              پشتیبان‌گیری و بازیابی
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-backup">پشتیبان‌گیری خودکار</Label>
                <p className="text-sm text-muted-foreground">پشتیبان‌گیری روزانه خودکار از تمام داده‌ها</p>
              </div>
              <Switch
                id="auto-backup"
                checked={backupSettings.autoBackup}
                onCheckedChange={(checked) => 
                  setBackupSettings(prev => ({ ...prev, autoBackup: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="cloud-backup">پشتیبان‌گیری ابری</Label>
                <p className="text-sm text-muted-foreground">ذخیره پشتیبان در Google Drive</p>
              </div>
              <Switch
                id="cloud-backup"
                checked={backupSettings.cloudBackup}
                onCheckedChange={(checked) => 
                  setBackupSettings(prev => ({ ...prev, cloudBackup: checked }))
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">آخرین پشتیبان‌گیری</h4>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">backup_2024_01_15.json</span>
                  <Badge variant="default">موفق</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatPersianDate(new Date())} - {formatPersianNumber(14)}:{formatPersianNumber(30)}
                </p>
                <p className="text-xs text-muted-foreground">
                  حجم: {formatPersianNumber(2.5)} مگابایت
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button onClick={handleBackupNow} className="w-full gap-2">
                <Download className="h-4 w-4" />
                پشتیبان‌گیری فوری
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Upload className="h-4 w-4" />
                بازیابی از پشتیبان
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              تنظیمات اطلاع‌رسانی
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="overdue-invoices">فاکتورهای معوق</Label>
                <p className="text-sm text-muted-foreground">اطلاع‌رسانی فاکتورهای سررسید گذشته</p>
              </div>
              <Switch
                id="overdue-invoices"
                checked={notificationSettings.overdueInvoices}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, overdueInvoices: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-reps">نمایندگان جدید</Label>
                <p className="text-sm text-muted-foreground">اطلاع‌رسانی ثبت نمایندگان جدید</p>
              </div>
              <Switch
                id="new-reps"
                checked={notificationSettings.newRepresentatives}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, newRepresentatives: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="payment-received">پرداخت‌های دریافتی</Label>
                <p className="text-sm text-muted-foreground">اطلاع‌رسانی پرداخت‌های جدید</p>
              </div>
              <Switch
                id="payment-received"
                checked={notificationSettings.paymentReceived}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, paymentReceived: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="system-alerts">هشدارهای سیستم</Label>
                <p className="text-sm text-muted-foreground">اطلاع‌رسانی خطاها و مشکلات سیستم</p>
              </div>
              <Switch
                id="system-alerts"
                checked={notificationSettings.systemAlerts}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">تنظیمات اضافی</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="reminder-days">یادآوری پرداخت (روز)</Label>
                  <Input
                    id="reminder-days"
                    type="number"
                    defaultValue="3"
                    className="mt-1 ltr text-right"
                  />
                </div>
                <div>
                  <Label htmlFor="overdue-threshold">آستانه معوقات (روز)</Label>
                  <Input
                    id="overdue-threshold"
                    type="number"
                    defaultValue="7"
                    className="mt-1 ltr text-right"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              مدیریت داده‌ها
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-medium">خروجی داده‌ها</h4>
              <p className="text-sm text-muted-foreground">
                خروجی تمام داده‌های سیستم در فرمت‌های مختلف
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" onClick={handleExportData} className="gap-2">
                  <Download className="h-4 w-4" />
                  خروجی Excel کامل
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  خروجی JSON
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  خروجی گزارش PDF
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">ایمپورت داده‌ها</h4>
              <p className="text-sm text-muted-foreground">
                بازیابی یا ایمپورت داده‌ها از فایل‌های خارجی
              </p>
              <Button variant="outline" onClick={handleImportData} className="w-full gap-2">
                <Upload className="h-4 w-4" />
                انتخاب فایل برای ایمپورت
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-error">ناحیه خطرناک</h4>
              <p className="text-sm text-muted-foreground">
                عملیات‌هایی که قابل بازگشت نیستند
              </p>
              <Button variant="destructive" className="w-full gap-2">
                <Trash2 className="h-4 w-4" />
                پاک کردن تمام داده‌ها
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              اطلاعات سیستم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">نسخه برنامه</span>
                <Badge variant="outline">v{formatPersianNumber(1.0)}.{formatPersianNumber(0)}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">تاریخ آخرین بروزرسانی</span>
                <span className="text-sm">{formatPersianDate(new Date())}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">تعداد نمایندگان</span>
                <span className="text-sm">{formatPersianNumber(24)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">تعداد فاکتورها</span>
                <span className="text-sm">{formatPersianNumber(156)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">حجم دیتابیس</span>
                <span className="text-sm">{formatPersianNumber(15.7)} مگابایت</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">درباره سیستم</h4>
              <p className="text-sm text-muted-foreground">
                سامانه فوترینگ VPN - سیستم جامع مدیریت مالی نمایندگان
              </p>
              <p className="text-xs text-muted-foreground">
                توسعه‌یافته با هدف خودکارسازی فرآیندهای مالی و حسابداری
              </p>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                بررسی بروزرسانی
              </Button>
              <Button variant="outline" className="w-full">
                راهنمای کاربری
              </Button>
              <Button variant="outline" className="w-full">
                پشتیبانی فنی
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
