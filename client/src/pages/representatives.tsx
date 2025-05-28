import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import RepresentativeForm from "@/components/representatives/representative-form";
import RepresentativeList from "@/components/representatives/representative-list";
import { Plus, Search, Users } from "lucide-react";
import { formatPersianNumber, formatPersianCurrency } from "@/lib/persian-utils";

export default function Representatives() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRep, setSelectedRep] = useState<any>(null);

  const { data: representatives, isLoading, refetch } = useQuery({
    queryKey: ["/api/representatives"],
  });

  const filteredReps = representatives?.filter((rep: any) =>
    rep.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.adminUsername.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEditRep = (rep: any) => {
    setSelectedRep(rep);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedRep(null);
    refetch();
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 md:p-6 -m-4 md:-m-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              مدیریت نمایندگان
            </h1>
            <p className="text-muted-foreground mt-1">مدیریت اطلاعات و قیمت‌گذاری نمایندگان</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            افزودن نماینده جدید
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">کل نمایندگان</p>
                <p className="text-2xl font-bold">{formatPersianNumber(representatives?.length || 0)}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">نمایندگان فعال</p>
                <p className="text-2xl font-bold text-success">
                  {formatPersianNumber(representatives?.filter((rep: any) => rep.status === 'active').length || 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">موجودی مثبت</p>
                <p className="text-2xl font-bold text-success">
                  {formatPersianNumber(representatives?.filter((rep: any) => rep.balance > 0).length || 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-success" />
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
                  {formatPersianNumber(representatives?.filter((rep: any) => rep.balance < 0).length || 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-error" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
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
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                همه ({formatPersianNumber(representatives?.length || 0)})
              </Badge>
              <Badge variant="default" className="cursor-pointer">
                فعال ({formatPersianNumber(representatives?.filter((rep: any) => rep.status === 'active').length || 0)})
              </Badge>
              <Badge variant="destructive" className="cursor-pointer">
                بدهکار ({formatPersianNumber(representatives?.filter((rep: any) => rep.balance < 0).length || 0)})
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Representatives List */}
      <RepresentativeList
        representatives={filteredReps}
        isLoading={isLoading}
        onEdit={handleEditRep}
        onRefresh={refetch}
      />

      {/* Representative Form Modal */}
      <RepresentativeForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        representative={selectedRep}
      />
    </div>
  );
}
