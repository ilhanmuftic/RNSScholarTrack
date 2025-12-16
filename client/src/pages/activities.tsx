import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActivityStatusBadge } from "@/components/activity-status-badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/authUtils";
import { Search, Filter, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ActivityWithDetails } from "@shared/schema";

export default function Activities() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithDetails | null>(null);
  const [reviewComment, setReviewComment] = useState("");

  const { data: activities, isLoading, error } = useQuery<ActivityWithDetails[]>({
    queryKey: ["/api/admin/activities"],
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

  const approveMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      await apiRequest("POST", `/api/admin/activities/${id}/approve`, { comment });
    },
    onSuccess: () => {
      toast({
        title: "Activity Approved",
        description: "The activity has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedActivity(null);
      setReviewComment("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      await apiRequest("POST", `/api/admin/activities/${id}/reject/`, { comment });
    },
    onSuccess: () => {
      toast({
        title: "Activity Rejected",
        description: "The activity has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/activities/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats/"] });
      setSelectedActivity(null);
      setReviewComment("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredActivities = activities?.filter((activity) => {
    const scholarName = `${activity.scholar?.user?.firstName} ${activity.scholar?.user?.lastName}`.toLowerCase();
    const title = activity.title.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = scholarName.includes(query) || title.includes(query);
    const matchesStatus = statusFilter === "all" || activity.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-foreground">Activities</h1>
        <p className="text-muted-foreground mt-1">Review and approve volunteer activities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif">Filter Activities</CardTitle>
          <CardDescription>Search and filter volunteer activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by scholar name or activity title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="pl-10" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading activities...</p>
            </div>
          ) : !filteredActivities || filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No activities found</p>
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
                {filteredActivities.map((activity) => (
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedActivity(activity);
                          setReviewComment(activity.reviewComment || "");
                        }}
                        data-testid={`button-review-${activity.id}`}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedActivity && (
        <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
          <DialogContent className="max-w-2xl" data-testid="dialog-review-activity">
            <DialogHeader>
              <DialogTitle className="text-xl font-serif">Review Activity</DialogTitle>
              <DialogDescription>
                Review and approve or reject this volunteer activity
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedActivity.scholar?.user?.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {getInitials(selectedActivity.scholar?.user?.firstName, selectedActivity.scholar?.user?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    {selectedActivity.scholar?.user?.firstName} {selectedActivity.scholar?.user?.lastName}
                  </h4>
                  <p className="text-sm text-muted-foreground">{selectedActivity.scholar?.scholarId}</p>
                  <p className="text-sm text-muted-foreground">{selectedActivity.scholar?.level}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">{selectedActivity.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedActivity.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <p className="text-sm font-medium text-foreground">{selectedActivity.category?.name || 'General'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(selectedActivity.activityDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Hours</Label>
                  <p className="text-sm font-medium text-foreground">{selectedActivity.hours}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Add a comment for the scholar..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="min-h-24 resize-none"
                  data-testid="input-review-comment"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedActivity(null)}
                data-testid="button-cancel-review"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => rejectMutation.mutate({ id: selectedActivity.id, comment: reviewComment })}
                disabled={rejectMutation.isPending || selectedActivity.status !== 'pending'}
                data-testid="button-reject"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => approveMutation.mutate({ id: selectedActivity.id, comment: reviewComment })}
                disabled={approveMutation.isPending || selectedActivity.status !== 'pending'}
                data-testid="button-approve"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
