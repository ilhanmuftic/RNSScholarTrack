import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface ActivityStatusBadgeProps {
  status: string;
}

export function ActivityStatusBadge({ status }: ActivityStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      variant: 'secondary' as const,
      icon: Clock,
    },
    approved: {
      label: 'Approved',
      variant: 'default' as const,
      icon: CheckCircle,
    },
    rejected: {
      label: 'Rejected',
      variant: 'destructive' as const,
      icon: XCircle,
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1" data-testid={`badge-status-${status}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
