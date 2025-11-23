import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ScholarHeader } from "@/components/scholar-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AdminDashboard from "@/pages/admin-dashboard";
import ScholarDashboard from "@/pages/scholar-dashboard";
import Scholars from "@/pages/scholars";
import Activities from "@/pages/activities";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import SubmitActivity from "@/pages/submit-activity";
import MyActivities from "@/pages/my-activities";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 z-40 bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function ScholarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ScholarHeader />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading, isAdmin, isScholar } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  if (isAdmin) {
    return (
      <AdminLayout>
        <Switch>
          <Route path="/" component={AdminDashboard} />
          <Route path="/scholars" component={Scholars} />
          <Route path="/activities" component={Activities} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </AdminLayout>
    );
  }

  if (isScholar) {
    return (
      <ScholarLayout>
        <Switch>
          <Route path="/" component={ScholarDashboard} />
          <Route path="/submit-activity" component={SubmitActivity} />
          <Route path="/my-activities" component={MyActivities} />
          <Route component={NotFound} />
        </Switch>
      </ScholarLayout>
    );
  }

  return <Landing />;
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
