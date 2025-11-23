import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  current: number;
  required: number;
  label?: string;
}

export function ProgressBar({ current, required, label }: ProgressBarProps) {
  const percentage = Math.min((current / required) * 100, 100);
  const isComplete = current >= required;
  const isWarning = percentage >= 50 && percentage < 100;
  
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-sm font-medium text-foreground" data-testid="text-progress-hours">
            {current}/{required} hours
          </span>
        </div>
      )}
      <Progress 
        value={percentage} 
        className="h-2"
        data-testid="progress-hours"
      />
      <div className="text-xs text-muted-foreground">
        {isComplete ? (
          <span className="text-primary font-medium">Monthly requirement met!</span>
        ) : isWarning ? (
          <span>{Math.ceil(required - current)} hours remaining</span>
        ) : (
          <span>{Math.ceil(required - current)} hours needed</span>
        )}
      </div>
    </div>
  );
}
