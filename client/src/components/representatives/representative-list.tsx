import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPersianNumber, formatPersianCurrency } from "@/lib/persian-utils";
import { Edit, Eye, MoreVertical, Phone, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RepresentativeListProps {
  representatives: any[];
  isLoading: boolean;
  onEdit: (representative: any) => void;
  onRefresh: () => void;
}

export default function RepresentativeList({ 
  representatives, 
  isLoading, 
  onEdit,
  onRefresh 
}: RepresentativeListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="text-left space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (representatives.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">نماینده‌ای یافت نشد</h3>
          <p className="text-muted-foreground mb-4">
            هنوز نماینده‌ای ثبت نشده یا جستجوی شما نتیجه‌ای نداشت
          </p>
          <Button onClick={onRefresh} variant="outline">
            بروزرسانی لیست
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {representatives.map((rep) => (
            <div key={rep.id} className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {rep.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="font-medium text-lg">{rep.fullName}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-4">
                    <span>نام کاربری: {rep.adminUsername}</span>
                    {rep.storeName && (
                      <span>فروشگاه: {rep.storeName}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-4 mt-1">
                    {rep.phoneNumber && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {rep.phoneNumber}
                      </span>
                    )}
                    {rep.telegramId && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {rep.telegramId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-left">
                <div className={`text-lg font-bold mb-1 ${
                  rep.balance > 0 ? 'text-success' : 
                  rep.balance < 0 ? 'text-error' : 
                  'text-muted-foreground'
                }`}>
                  {rep.balance > 0 ? '+' : ''}{formatPersianCurrency(rep.balance)}
                </div>
                
                <Badge variant={
                  rep.status === 'active' ? 'default' : 
                  rep.status === 'inactive' ? 'secondary' : 
                  'outline'
                } className="mb-2">
                  {rep.status === 'active' ? 'فعال' : 
                   rep.status === 'inactive' ? 'غیرفعال' : 
                   'در انتظار'}
                </Badge>

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(rep)}
                    className="gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    ویرایش
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 ml-2" />
                        مشاهده جزئیات
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        مشاهده فاکتورها
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        تاریخچه پرداخت‌ها
                      </DropdownMenuItem>
                      {rep.telegramId && (
                        <DropdownMenuItem>
                          <MessageCircle className="h-4 w-4 ml-2" />
                          ارسال پیام تلگرام
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
