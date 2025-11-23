import { useQuery } from "@tanstack/react-query";
import { Users, Activity, Clock, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActivityStatusBadge } from "@/components/activity-status-badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/authUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ActivityWithDetails } from "@shared/schema";

interface DashboardStats {
  totalScholars: number;
  activeThisMonth: number;
  pendingApprovals: number;
  hoursThisMonth: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: recentActivities, isLoading: activitiesLoading, error: activitiesError } = useQuery<ActivityWithDetails[]>({
    queryKey: ["/api/admin/activities/recent"],
  });

  useEffect(() => {
    if (statsError && isUnauthorizedError(statsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [statsError, toast]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of scholarship program activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Scholars"
          value={stats?.totalScholars || 0}
          icon={Users}
          description="Active in program"
          isLoading={statsLoading}
        />
        <StatCard
          title="Active This Month"
          value={stats?.activeThisMonth || 0}
          icon={TrendingUp}
          description="Submitted activities"
          isLoading={statsLoading}
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingApprovals || 0}
          icon={Clock}
          description="Awaiting review"
          isLoading={statsLoading}
        />
        <StatCard
          title="Hours This Month"
          value={stats?.hoursThisMonth || 0}
          icon={Activity}
          description="Total approved hours"
          isLoading={statsLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif">Recent Activities</CardTitle>
          <CardDescription>Latest volunteer activity submissions from scholars</CardDescription>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : !recentActivities || recentActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No recent activities</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scholar</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.slice(0, 8).map((activity) => (
                  <TableRow key={activity.id} className="hover-elevate" data-testid={`row-activity-${activity.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={activity.scholar?.user?.profileImageUrl || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(activity.scholar?.user?.firstName, activity.scholar?.user?.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {activity.scholar?.user?.firstName} {activity.scholar?.user?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.scholar?.scholarId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{activity.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{activity.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{activity.category?.name || 'General'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(activity.activityDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-medium text-foreground">{activity.hours}</span>
                    </TableCell>
                    <TableCell>
                      <ActivityStatusBadge status={activity.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" data-testid={`button-view-${activity.id}`}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
