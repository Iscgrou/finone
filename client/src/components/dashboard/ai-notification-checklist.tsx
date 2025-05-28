import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPersianNumber, formatPersianDateTime } from "@/lib/persian-utils";
import { 
  Bell, Bot, CheckCircle, AlertTriangle, TrendingDown, 
  Users, FileText, Clock, DollarSign, Calendar,
  Eye, MessageSquare, Download
} from "lucide-react";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  sentToTelegram: boolean;
  data?: any;
  createdAt: string;
}

interface NotificationChecklist {
  id: string;
  title: string;
  description: string;
  type: "performance" | "payment" | "system" | "representative";
  priority: "high" | "medium" | "low";
  completed: boolean;
  dueDate?: string;
  assignedTo?: string;
}

export default function AINotificationChecklist() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/notifications/unread"],
  });

  const { data: checklist, isLoading: checklistLoading } = useQuery({
    queryKey: ["/api/dashboard/checklist"],
  });

  const { data: aiInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/ai/insights"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/notifications/${id}/read`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
      toast({ title: "✅ اعلان خوانده شد" });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => apiRequest(`/api/dashboard/checklist/${taskId}/complete`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/checklist"] });
      toast({ title: "✅ وظیفه تکمیل شد" });
    },
  });

  const sendToTelegramMutation = useMutation({
    mutationFn: (notificationId: number) => apiRequest(`/api/notifications/${notificationId}/telegram`, { method: "POST" }),
    onSuccess: () => {
      toast({ title: "✅ گزارش به تلگرام ارسال شد" });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "performance_drop": return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "overdue_payment": return <Clock className="h-4 w-4 text-orange-500" />;
      case "inactive_rep": return <Users className="h-4 w-4 text-yellow-500" />;
      case "system": return <Bot className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            تحلیل هوشمند امروز
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insightsLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">
                {aiInsights?.summary || "سیستم هوش مصنوعی درحال تحلیل اطلاعات است..."}
              </p>
              {aiInsights?.recommendations && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">پیشنهادات:</h4>
                  <p className="text-sm text-blue-800">{aiInsights.recommendations}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                اعلان‌های فوری
                {notifications?.length > 0 && (
                  <Badge variant="destructive">{formatPersianNumber(notifications.length)}</Badge>
                )}
              </CardTitle>
              {notifications?.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    notifications.forEach((notif: Notification) => {
                      if (!notif.isRead) markAsReadMutation.mutate(notif.id);
                    });
                  }}
                >
                  خواندن همه
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {notificationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : notifications?.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notification: Notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 border rounded-lg ${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatPersianDateTime(new Date(notification.createdAt))}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        {!notification.sentToTelegram && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendToTelegramMutation.mutate(notification.id)}
                          >
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>هیچ اعلان فوری‌ای وجود ندارد</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checklist Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              چک‌لیست روزانه
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today">امروز</TabsTrigger>
                <TabsTrigger value="pending">معلق</TabsTrigger>
                <TabsTrigger value="completed">تکمیل شده</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-3 mt-4">
                {checklistLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-2">
                        <div className="h-4 w-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ChecklistItems 
                    items={checklist?.filter((item: NotificationChecklist) => 
                      !item.completed && (!item.dueDate || new Date(item.dueDate) <= new Date())
                    ) || []}
                    onComplete={(taskId: string) => completeTaskMutation.mutate(taskId)}
                  />
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-3 mt-4">
                <ChecklistItems 
                  items={checklist?.filter((item: NotificationChecklist) => 
                    !item.completed && item.dueDate && new Date(item.dueDate) > new Date()
                  ) || []}
                  onComplete={(taskId: string) => completeTaskMutation.mutate(taskId)}
                />
              </TabsContent>

              <TabsContent value="completed" className="space-y-3 mt-4">
                <ChecklistItems 
                  items={checklist?.filter((item: NotificationChecklist) => item.completed) || []}
                  onComplete={() => {}}
                  showCompleted
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            هشدارهای عملکرد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceAlerts />
        </CardContent>
      </Card>
    </div>
  );
}

function ChecklistItems({ 
  items, 
  onComplete, 
  showCompleted = false 
}: { 
  items: NotificationChecklist[]; 
  onComplete: (taskId: string) => void;
  showCompleted?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>موردی برای نمایش وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
          <Checkbox
            checked={item.completed}
            onCheckedChange={() => !showCompleted && onComplete(item.id)}
            disabled={showCompleted}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className={`font-medium text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                {item.title}
              </h4>
              <Badge variant={getPriorityColor(item.priority)}>
                {item.priority === "high" ? "بالا" : 
                 item.priority === "medium" ? "متوسط" : "پایین"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            {item.dueDate && (
              <p className="text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3 inline ml-1" />
                موعد: {formatPersianDateTime(new Date(item.dueDate))}
              </p>
            )}
            {item.assignedTo && (
              <p className="text-xs text-muted-foreground">
                مسئول: {item.assignedTo}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PerformanceAlerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["/api/performance/alerts"],
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
        <p>عملکرد تمام نمایندگان در وضعیت مطلوب است</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {alerts.map((alert: any, index: number) => (
        <div key={index} className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <h4 className="font-medium text-red-900">{alert.title}</h4>
          </div>
          <p className="text-sm text-red-800 mb-2">{alert.description}</p>
          <div className="flex items-center gap-4 text-xs text-red-700">
            <span>نماینده: {alert.representativeName}</span>
            <span>کاهش: {formatPersianNumber(alert.percentageDrop)}%</span>
            <span>مبلغ فعلی: {formatPersianNumber(alert.currentAmount)} تومان</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function getPriorityColor(priority: string): "default" | "destructive" | "secondary" | "outline" {
  switch (priority) {
    case "high": return "destructive";
    case "medium": return "default";
    case "low": return "secondary";
    default: return "outline";
  }
}