import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/invoices/file-upload";
import RepresentativeForm from "@/components/representatives/representative-form";
import { useLocation } from "wouter";
import { Upload, UserPlus, BarChart3 } from "lucide-react";

export default function QuickActions() {
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isRepFormOpen, setIsRepFormOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleFileUploadSuccess = () => {
    setIsFileUploadOpen(false);
    // Could refresh invoices or navigate to invoices page
  };

  const handleRepFormClose = () => {
    setIsRepFormOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Upload ODS File */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsFileUploadOpen(true)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary text-sm">←</span>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">آپلود فایل ODS</h3>
            <p className="text-muted-foreground text-sm">
              ایمپورت داده‌های فاکتورینگ از فایل اکسل
            </p>
          </CardContent>
        </Card>

        {/* Add Representative */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsRepFormOpen(true)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <span className="text-secondary text-sm">←</span>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">افزودن نماینده</h3>
            <p className="text-muted-foreground text-sm">
              ثبت نماینده جدید با تنظیمات قیمت‌گذاری
            </p>
          </CardContent>
        </Card>

        {/* View Analytics */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation('/analytics')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-accent-foreground" />
              </div>
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                <span className="text-accent text-sm">←</span>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">گزارش مالی</h3>
            <p className="text-muted-foreground text-sm">
              مشاهده وضعیت حساب‌ها و آنالیتیکس
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <FileUpload
        isOpen={isFileUploadOpen}
        onClose={() => setIsFileUploadOpen(false)}
        onSuccess={handleFileUploadSuccess}
      />

      <RepresentativeForm
        isOpen={isRepFormOpen}
        onClose={handleRepFormClose}
      />
    </>
  );
}
