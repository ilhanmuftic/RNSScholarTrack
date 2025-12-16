import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials, getFullName } from "@/lib/authUtils";
import { Search, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { ProgressBar } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ScholarWithUser, ScholarStats } from "@shared/schema";
import { authFetch } from "@/hooks/auth-fetch";

interface ScholarWithStats extends ScholarWithUser {
  stats: ScholarStats;
}

export default function Scholars() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: scholars, isLoading, error } = useQuery<ScholarWithStats[]>({
    queryKey: ["/api/scholars/admin/scholars/"],
    queryFn: () => authFetch("/api/scholars/admin/scholars/"),

  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const filteredScholars = scholars?.filter((scholar) => {
    const fullName = getFullName(scholar.user.firstName, scholar.user.lastName)?.toLowerCase();
    const scholarId = scholar.scholarId?.toLowerCase();
    const query = searchQuery?.toLowerCase() || "";
    return fullName?.includes(query) || scholarId?.includes(query) || scholar.user.email?.includes(query);
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground">Scholars</h1>
          <p className="text-muted-foreground mt-1">Manage scholarship recipients</p>
        </div>
        <Button data-testid="button-add-scholar">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Scholar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif">Search Scholars</CardTitle>
          <CardDescription>Find scholars by name, ID, or email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, scholar ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !filteredScholars || filteredScholars.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchQuery ? "No scholars found matching your search" : "No scholars yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholars.map((scholar) => (
            <Card key={scholar.id} className="hover-elevate" data-testid={`card-scholar-${scholar.id}`}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={scholar.user.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {getInitials(scholar.user.firstName, scholar.user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {getFullName(scholar.user.firstName, scholar.user.lastName)}
                    </h3>
                    <p className="text-sm text-muted-foreground">{scholar.scholarId}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {scholar.level}
                      </Badge>
                      {scholar.isActive ? (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="text-sm font-medium text-foreground">
                      {scholar.stats.currentMonthHours}/{scholar.requiredHoursPerMonth} hrs
                    </span>
                  </div>
                  <ProgressBar
                    current={scholar.stats.currentMonthHours}
                    required={scholar.requiredHoursPerMonth}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{scholar.stats.totalHours}</p>
                    <p className="text-xs text-muted-foreground">Total Hours</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{scholar.stats.pendingActivities}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{scholar.stats.approvedActivities}</p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
