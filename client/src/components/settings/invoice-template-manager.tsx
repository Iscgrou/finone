import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, FileText, Image } from "lucide-react";

interface InvoiceTemplate {
  id: number;
  name: string;
  isDefault: boolean;
  headerHtml: string;
  bodyHtml: string;
  footerHtml: string;
  styles: string;
  outputFormat: "pdf" | "image";
  fields: {
    showLogo: boolean;
    showCompanyInfo: boolean;
    showDueDate: boolean;
    showQrCode: boolean;
    customFields: { label: string; value: string }[];
  };
}

export default function InvoiceTemplateManager() {
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/settings/invoice-templates"],
  });

  const createTemplateMutation = useMutation({
    mutationFn: (template: Partial<InvoiceTemplate>) =>
      apiRequest("/api/settings/invoice-templates", {
        method: "POST",
        body: JSON.stringify(template),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/invoice-templates"] });
      setIsCreating(false);
      setSelectedTemplate(null);
      toast({ title: "✅ قالب فاکتور ایجاد شد", description: "قالب جدید با موفقیت اضافه شد" });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, ...template }: Partial<InvoiceTemplate> & { id: number }) =>
      apiRequest(`/api/settings/invoice-templates/${id}`, {
        method: "PUT",
        body: JSON.stringify(template),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/invoice-templates"] });
      setIsEditing(false);
      setSelectedTemplate(null);
      toast({ title: "✅ قالب فاکتور به‌روزرسانی شد", description: "تغییرات با موفقیت ذخیره شد" });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/settings/invoice-templates/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/invoice-templates"] });
      toast({ title: "✅ قالب فاکتور حذف شد", description: "قالب با موفقیت حذف شد" });
    },
  });

  const handleSave = (templateData: Partial<InvoiceTemplate>) => {
    if (isCreating) {
      createTemplateMutation.mutate(templateData);
    } else if (selectedTemplate) {
      updateTemplateMutation.mutate({ id: selectedTemplate.id, ...templateData });
    }
  };

  const defaultTemplate = {
    name: "",
    isDefault: false,
    headerHtml: `<div style="text-align: center; margin-bottom: 20px;">
  <h1 style="color: #2563eb;">{{COMPANY_NAME}}</h1>
  <p>{{COMPANY_ADDRESS}}</p>
</div>`,
    bodyHtml: `<div style="margin: 20px 0;">
  <h2>فاکتور شماره: {{INVOICE_NUMBER}}</h2>
  <p><strong>نماینده:</strong> {{REPRESENTATIVE_NAME}}</p>
  <p><strong>تاریخ:</strong> {{INVOICE_DATE}}</p>
  <p><strong>سررسید:</strong> {{DUE_DATE}}</p>
  
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background: #f3f4f6;">
      <th style="border: 1px solid #d1d5db; padding: 8px;">شرح</th>
      <th style="border: 1px solid #d1d5db; padding: 8px;">مقدار</th>
      <th style="border: 1px solid #d1d5db; padding: 8px;">مبلغ</th>
    </tr>
    {{INVOICE_ITEMS}}
  </table>
  
  <div style="text-align: left; margin: 20px 0;">
    <h3>مجموع: {{TOTAL_AMOUNT}} تومان</h3>
  </div>
</div>`,
    footerHtml: `<div style="text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280;">
  <p>با تشکر از همکاری شما</p>
  <p>{{COMPANY_PHONE}} | {{COMPANY_EMAIL}}</p>
</div>`,
    styles: `body { font-family: 'Vazir', Arial, sans-serif; direction: rtl; }
table { width: 100%; }
th, td { text-align: right; }`,
    outputFormat: "pdf" as const,
    fields: {
      showLogo: true,
      showCompanyInfo: true,
      showDueDate: true,
      showQrCode: false,
      customFields: []
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            مدیریت قالب‌های فاکتور
          </CardTitle>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setSelectedTemplate(defaultTemplate as InvoiceTemplate);
                setIsCreating(true);
              }}>
                <Plus className="h-4 w-4 ml-2" />
                قالب جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>ایجاد قالب جدید</DialogTitle>
              </DialogHeader>
              {selectedTemplate && (
                <TemplateEditor
                  template={selectedTemplate}
                  onSave={handleSave}
                  onCancel={() => {
                    setIsCreating(false);
                    setSelectedTemplate(null);
                  }}
                  isLoading={createTemplateMutation.isPending}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">درحال بارگذاری...</div>
        ) : (
          <div className="grid gap-4">
            {templates?.map((template: InvoiceTemplate) => (
              <Card key={template.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {template.isDefault && (
                          <Badge variant="default">پیش‌فرض</Badge>
                        )}
                        <Badge variant="outline">
                          {template.outputFormat === "pdf" ? <FileText className="h-3 w-3 ml-1" /> : <Image className="h-3 w-3 ml-1" />}
                          {template.outputFormat === "pdf" ? "PDF" : "تصویر"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsEditing(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTemplateMutation.mutate(template.id)}
                      disabled={template.isDefault}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ویرایش قالب فاکتور</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <TemplateEditor
              template={selectedTemplate}
              onSave={handleSave}
              onCancel={() => {
                setIsEditing(false);
                setSelectedTemplate(null);
              }}
              isLoading={updateTemplateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function TemplateEditor({
  template,
  onSave,
  onCancel,
  isLoading
}: {
  template: InvoiceTemplate;
  onSave: (template: Partial<InvoiceTemplate>) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState(template);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">تنظیمات پایه</TabsTrigger>
          <TabsTrigger value="header">سربرگ</TabsTrigger>
          <TabsTrigger value="body">متن فاکتور</TabsTrigger>
          <TabsTrigger value="footer">پاورقی</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">نام قالب</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="نام قالب را وارد کنید"
                required
              />
            </div>
            <div>
              <Label htmlFor="outputFormat">فرمت خروجی</Label>
              <Select
                value={formData.outputFormat}
                onValueChange={(value: "pdf" | "image") => 
                  setFormData(prev => ({ ...prev, outputFormat: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">فایل PDF</SelectItem>
                  <SelectItem value="image">تصویر PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isDefault: checked }))
              }
            />
            <Label htmlFor="isDefault">قالب پیش‌فرض</Label>
          </div>
        </TabsContent>

        <TabsContent value="header" className="space-y-4">
          <div>
            <Label htmlFor="headerHtml">HTML سربرگ</Label>
            <Textarea
              id="headerHtml"
              value={formData.headerHtml}
              onChange={(e) => setFormData(prev => ({ ...prev, headerHtml: e.target.value }))}
              rows={8}
              className="font-mono text-sm"
              placeholder="کد HTML سربرگ فاکتور..."
            />
          </div>
        </TabsContent>

        <TabsContent value="body" className="space-y-4">
          <div>
            <Label htmlFor="bodyHtml">HTML متن اصلی</Label>
            <Textarea
              id="bodyHtml"
              value={formData.bodyHtml}
              onChange={(e) => setFormData(prev => ({ ...prev, bodyHtml: e.target.value }))}
              rows={12}
              className="font-mono text-sm"
              placeholder="کد HTML متن اصلی فاکتور..."
            />
          </div>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <div>
            <Label htmlFor="footerHtml">HTML پاورقی</Label>
            <Textarea
              id="footerHtml"
              value={formData.footerHtml}
              onChange={(e) => setFormData(prev => ({ ...prev, footerHtml: e.target.value }))}
              rows={6}
              className="font-mono text-sm"
              placeholder="کد HTML پاورقی فاکتور..."
            />
          </div>

          <div>
            <Label htmlFor="styles">استایل‌های CSS</Label>
            <Textarea
              id="styles"
              value={formData.styles}
              onChange={(e) => setFormData(prev => ({ ...prev, styles: e.target.value }))}
              rows={6}
              className="font-mono text-sm"
              placeholder="کدهای CSS برای استایل فاکتور..."
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          انصراف
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "درحال ذخیره..." : "ذخیره قالب"}
        </Button>
      </div>
    </form>
  );
}