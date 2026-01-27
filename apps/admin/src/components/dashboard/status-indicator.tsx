import { cn } from "@/lib/utils";

export type Status = "healthy" | "degraded" | "down" | "active" | "inactive" | "suspended";

interface StatusIndicatorProps {
  status: Status;
  label?: string;
  showLabel?: boolean;
}

const statusConfig: Record<
  Status,
  { color: string; bgColor: string; label: string }
> = {
  healthy: {
    color: "text-green-500",
    bgColor: "bg-green-500",
    label: "Healthy",
  },
  degraded: {
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
    label: "Degraded",
  },
  down: {
    color: "text-red-500",
    bgColor: "bg-red-500",
    label: "Down",
  },
  active: {
    color: "text-green-500",
    bgColor: "bg-green-500",
    label: "Active",
  },
  inactive: {
    color: "text-gray-500",
    bgColor: "bg-gray-500",
    label: "Inactive",
  },
  suspended: {
    color: "text-red-500",
    bgColor: "bg-red-500",
    label: "Suspended",
  },
};

export function StatusIndicator({
  status,
  label,
  showLabel = true,
}: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            config.bgColor
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-2.5 w-2.5 rounded-full",
            config.bgColor
          )}
        />
      </span>
      {showLabel && (
        <span className={cn("text-sm font-medium", config.color)}>
          {label || config.label}
        </span>
      )}
    </div>
  );
}
