import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Wallet, 
  BarChart3, 
  Settings,
  Network
} from "lucide-react";

const navigation = [
  { name: 'داشبورد', href: '/', icon: LayoutDashboard },
  { name: 'مدیریت نمایندگان', href: '/representatives', icon: Users },
  { name: 'مرکز فاکتورها', href: '/invoices', icon: Receipt },
  { name: 'حسابداری', href: '/accounting', icon: Wallet },
  { name: 'آنالیتیکس هوشمند', href: '/analytics', icon: BarChart3 },
  { name: 'تنظیمات و پشتیبان‌گیری', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex w-64 bg-card h-screen border-l border-border fixed right-0 top-0 z-40">
      <div className="flex flex-col w-full">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Network className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">سامانه VPN</h1>
              <p className="text-sm text-muted-foreground">مدیریت نمایندگان</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <a className={cn(
                      "sidebar-link",
                      isActive && "active"
                    )}>
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Backup Status */}
        <div className="p-6">
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-success rounded-full ml-2"></div>
              <span className="text-sm font-medium">پشتیبان‌گیری خودکار</span>
            </div>
            <p className="text-xs text-muted-foreground">
              آخرین پشتیبان‌گیری: امروز ۱۴:۳۰
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
