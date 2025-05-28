import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Representatives from "@/pages/representatives";
import Invoices from "@/pages/invoices";
import Accounting from "@/pages/accounting";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";

function Router() {
  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 md:mr-64">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/representatives" component={Representatives} />
          <Route path="/invoices" component={Invoices} />
          <Route path="/accounting" component={Accounting} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
