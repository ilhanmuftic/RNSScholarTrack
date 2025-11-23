import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ProgressBar } from "@/components/progress-bar";

interface MonthlyReport {
  scholarId: string;
  scholarName: string;
  scholarLevel: string;
  requiredHours: number;
  completedHours: number;
  pendingHours: number;
  approvedActivities: number;
  pendingActivities: number;
  rejectedActivities: number;
  isCompliant: boolean;
}

export default function Reports() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: report, isLoading, error } = useQuery<MonthlyReport[]>({
    queryKey: ["/api/admin/reports/monthly", selectedMonth],
    queryFn: async () => {
      const res = await fetch(`/api/admin/reports/monthly?month=${selectedMonth}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }
      return res.json();
    },
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

  const currentDate = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    return {
      value: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  });

  const compliantCount = report?.filter(r => r.isCompliant).length || 0;
  const totalScholars = report?.length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">Monthly compliance and activity reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Scholars</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-card-foreground">{totalScholars}</div>
            <p className="text-xs text-muted-foreground mt-1">In current report</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Compliant</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-card-foreground">{compliantCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Met requirements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Non-Compliant</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-card-foreground">{totalScholars - compliantCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Below requirements</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-serif">Monthly Report</CardTitle>
            <CardDescription className="mt-1">Scholar compliance for selected month</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48" data-testid="select-month">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading report...</p>
            </div>
          ) : !report || report.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No data for selected month</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scholar</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Approved</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.map((scholar) => (
                  <TableRow key={scholar.scholarId} data-testid={`row-scholar-${scholar.scholarId}`}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{scholar.scholarName}</p>
                        <p className="text-xs text-muted-foreground">{scholar.scholarId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{scholar.scholarLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[200px]">
                        <ProgressBar
                          current={scholar.completedHours}
                          required={scholar.requiredHours}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-medium text-foreground">{scholar.approvedActivities}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-medium text-foreground">{scholar.pendingActivities}</span>
                    </TableCell>
                    <TableCell>
                      {scholar.isCompliant ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Compliant
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Non-Compliant
                        </Badge>
                      )}
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
