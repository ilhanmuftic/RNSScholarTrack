import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Heart, LogOut, Activity as ActivityIcon, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getInitials, getFullName } from "@/lib/authUtils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { ScholarStats } from "@shared/schema";
import { authFetch } from "@/hooks/auth-fetch";

export function ScholarHeader() {
  const { user } = useAuth();

  const { data: stats } = useQuery<ScholarStats>({
    queryKey: ["/api/scholars/scholar/stats/"],
    queryFn: () => authFetch("/api/scholars/scholar/stats/"),
  });

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover-elevate rounded-lg px-2 py-1 -mx-2">
              <Heart className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-lg font-serif font-bold text-foreground">Ruku na srce</h1>
                <p className="text-xs text-muted-foreground">Volunteer Program</p>
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {stats && (
              <>
                <div className="text-center px-4 border-r border-border">
                  <p className="text-xs text-muted-foreground">This Month</p>
                  <p className="text-lg font-serif font-semibold text-foreground" data-testid="text-month-hours">
                    {stats.currentMonthHours} hrs
                  </p>
                </div>
                <div className="text-center px-4">
                  <p className="text-xs text-muted-foreground">Total Hours</p>
                  <p className="text-lg font-serif font-semibold text-foreground" data-testid="text-total-hours">
                    {stats.totalHours} hrs
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={getFullName(user?.firstName, user?.lastName)} />
                    <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{getFullName(user?.firstName, user?.lastName)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-activities" className="cursor-pointer">
                    <ActivityIcon className="w-4 h-4 mr-2" />
                    My Activities
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    localStorage.removeItem("authToken");
                    window.location.href = "/login";
                  }}
                  className="cursor-pointer"
                  data-testid="menu-item-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
