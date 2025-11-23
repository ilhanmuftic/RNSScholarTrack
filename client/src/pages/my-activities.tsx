import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityStatusBadge } from "@/components/activity-status-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity as ActivityIcon } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Activity } from "@shared/schema";

export default function MyActivities() {
  const { toast } = useToast();

  const { data: activities, isLoading, error } = useQuery<Activity[]>({
    queryKey: ["/api/scholar/activities"],
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild data-testid="button-back">
          <Link href="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground">My Activities</h1>
          <p className="text-muted-foreground mt-1">View all your volunteer activities</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif">Activity History</CardTitle>
          <CardDescription>All your submitted volunteer activities</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading activities...</p>
            </div>
          ) : !activities || activities.length === 0 ? (
            <div className="text-center py-12">
              <ActivityIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No activities yet</p>
              <Button asChild variant="outline" data-testid="button-add-first-activity">
                <Link href="/submit-activity">Submit Your First Activity</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
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
                      {activity.reviewedAt && (
                        <span>Reviewed on {new Date(activity.reviewedAt).toLocaleDateString()}</span>
                      )}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
