import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "purple" | "pink" | "chain";
  size?: "sm" | "md";
  className?: string;
}

const variantStyles = {
  default: "bg-muted text-muted-foreground",
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  danger: "bg-red-100 text-red-700 border-red-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  chain: "bg-blue-50 text-blue-600 border-blue-100",
};

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-lg border transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Specialized chain badge with icon
export function ChainBadge({ chain }: { chain: string }) {
  const chainColors: Record<string, string> = {
    Ethereum: "bg-blue-50 text-blue-600 border-blue-100",
    Solana: "bg-purple-50 text-purple-600 border-purple-100",
    Arbitrum: "bg-sky-50 text-sky-600 border-sky-100",
    Polygon: "bg-violet-50 text-violet-600 border-violet-100",
    BSC: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Avalanche: "bg-red-50 text-red-600 border-red-100",
    Optimism: "bg-rose-50 text-rose-600 border-rose-100",
    Base: "bg-blue-50 text-blue-600 border-blue-100",
  };

  return (
    <Badge
      variant="chain"
      size="sm"
      className={chainColors[chain] || variantStyles.chain}
    >
      {chain}
    </Badge>
  );
}

// Prediction badge for pool predictions
export function PredictionBadge({ prediction }: { prediction: string | null | undefined }) {
  if (!prediction) {
    return (
      <Badge variant="default" size="sm">
        N/A
      </Badge>
    );
  }
  
  const predictionVariant = prediction.toLowerCase().includes("up")
    ? "success"
    : prediction.toLowerCase().includes("down")
    ? "danger"
    : "warning";

  return (
    <Badge variant={predictionVariant} size="sm">
      {prediction}
    </Badge>
  );
}

