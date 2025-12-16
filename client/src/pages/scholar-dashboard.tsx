import { useQuery } from "@tanstack/react-query";
import { Activity, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress-bar";
import { ActivityStatusBadge } from "@/components/activity-status-badge";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Activity as ActivityType, Scholar, ScholarStats } from "@shared/schema";
import { Link } from "wouter";
import { authFetch } from "@/hooks/auth-fetch";

export default function ScholarDashboard() {
  const { toast } = useToast();

  const { data: scholar, isLoading: scholarLoading, error: scholarError } = useQuery<Scholar>({
    queryKey: ["/api/scholars/profile/"],
    queryFn: () => authFetch("/api/scholars/profile/"),
  });

  const { data: stats, isLoading: statsLoading } = useQuery<ScholarStats>({
    queryKey: ["/api/scholars/scholar/stats/"],
    queryFn: () => authFetch("/api/scholars/scholar/stats/"),
  });

  const { data: recentActivities, isLoading: activitiesLoading } = useQuery<ActivityType[]>({
    queryKey: ["/api/scholars/scholar/activities/"],
    queryFn: () => authFetch("/api/scholars/scholar/activities/"),
  });

  useEffect(() => {
    if (scholarError && isUnauthorizedError(scholarError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [scholarError, toast]);

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your volunteer hours and activities</p>
      </div>

      {scholar && stats && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Monthly Progress - {currentMonth}</CardTitle>
            <CardDescription>
              You need {scholar.requiredHoursPerMonth} hours this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressBar
              current={stats.currentMonthHours}
              required={scholar.requiredHoursPerMonth}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="This Month"
          value={`${stats?.currentMonthHours || 0} hrs`}
          icon={TrendingUp}
          description="Hours completed"
          isLoading={statsLoading}
        />
        <StatCard
          title="Total Hours"
          value={stats?.totalHours || 0}
          icon={CheckCircle}
          description="All time"
          isLoading={statsLoading}
        />
        <StatCard
          title="Pending Review"
          value={stats?.pendingActivities || 0}
          icon={Clock}
          description="Activities awaiting approval"
          isLoading={statsLoading}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-serif">Submit New Activity</CardTitle>
            <CardDescription className="mt-1">Log your volunteer work</CardDescription>
          </div>
          <Button asChild data-testid="button-add-activity">
            <Link href="/scholar/submit-activity">
              <Activity className="w-4 h-4 mr-2" />
              Add Activity
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif">Recent Activities</CardTitle>
          <CardDescription>Your latest volunteer submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading activities...</p>
            </div>
          ) : !recentActivities || recentActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No activities yet</p>
              <Button asChild variant="outline" data-testid="button-add-first-activity">
                <Link href="/scholar/submit-activity">Submit Your First Activity</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-border hover-elevate"
                  data-testid={`card-activity-${activity.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-foreground">{activity.title}</h4>
                      <ActivityStatusBadge status={activity.status} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(activity.activityDate).toLocaleDateString()}</span>
                      <span>{activity.hours} hours</span>
                    </div>
                    {activity.reviewComment && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Admin Comment:</p>
                        <p className="text-sm text-foreground">{activity.reviewComment}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {recentActivities.length > 5 && (
                <Button variant="outline" className="w-full" asChild data-testid="button-view-all">
                  <Link href="/my-activities">View All Activities</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
