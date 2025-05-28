import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Wallet, 
  Settings
} from "lucide-react";

const navigation = [
  { name: 'داشبورد', href: '/', icon: LayoutDashboard },
  { name: 'نمایندگان', href: '/representatives', icon: Users },
  { name: 'فاکتورها', href: '/invoices', icon: Receipt },
  { name: 'حسابداری', href: '/accounting', icon: Wallet },
  { name: 'تنظیمات', href: '/settings', icon: Settings },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50">
      <div className="flex">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <a className={cn(
                "flex-1 flex flex-col items-center py-2 px-1 transition-colors",
                isActive 
                  ? "text-primary bg-primary/5" 
                  : "text-muted-foreground hover:text-foreground"
              )}>
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
