import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatPersianNumber } from "@/lib/persian-utils";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";

interface FileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FileUpload({ isOpen, onClose, onSuccess }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-ods', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('خطا در آپلود فایل');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "فایل بارگذاری شد",
        description: "فایل با موفقیت بارگذاری و پردازش آغاز شد",
      });
      setUploadProgress(100);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    },
    onError: () => {
      toast({
        title: "خطا در بارگذاری فایل",
        description: "لطفاً فایل را بررسی کرده و دوباره تلاش کنید",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.ods')) {
      toast({
        title: "فرمت فایل نامعتبر",
        description: "لطفاً فایل ODS انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "فایل خیلی بزرگ است",
        description: "حداکثر حجم مجاز ۱۰ مگابایت است",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleUpload = () => {
    if (selectedFile) {
      setUploadProgress(0);
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            بارگذاری فایل ODS
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Drop Zone */}
          <Card 
            className={`border-2 border-dashed transition-colors cursor-pointer ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.ods';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileSelect(file);
              };
              input.click();
            }}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-medium mb-2">
                {selectedFile ? selectedFile.name : "انتخاب فایل ODS"}
              </h4>
              <p className="text-muted-foreground mb-4">
                {selectedFile 
                  ? `حجم: ${(selectedFile.size / 1024 / 1024).toFixed(2)} مگابایت`
                  : "فایل را اینجا بکشید یا کلیک کنید"
                }
              </p>
              {!selectedFile && (
                <p className="text-xs text-muted-foreground">
                  فرمت‌های پشتیبانی شده: .ods
                </p>
              )}
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">در حال پردازش...</span>
                <span className="text-sm text-muted-foreground">
                  {formatPersianNumber(uploadProgress)}%
                </span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Upload Success */}
          {uploadProgress === 100 && !uploadMutation.isPending && (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" />
              <span>فایل با موفقیت پردازش شد</span>
            </div>
          )}

          {/* Guidelines */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                راهنمای کاربرد
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• فایل باید شامل admin_username در ستون A باشد</li>
                <li>• مقادیر "null" برای عدم استفاده نادیده گرفته می‌شوند</li>
                <li>• قیمت‌گذاری از پنل نمایندگان اعمال می‌شود</li>
                <li>• فاکتورها به صورت خودکار تولید می‌شوند</li>
                <li>• حداکثر حجم فایل: ۱۰ مگابایت</li>
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
              className="flex-1"
            >
              {uploadMutation.isPending ? "در حال پردازش..." : "پردازش فایل"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
