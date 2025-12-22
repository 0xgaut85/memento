import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted/50",
        className
      )}
    />
  );
}

export function PoolRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border/50">
      {/* Project */}
      <div className="flex items-center gap-3 min-w-[180px]">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      
      {/* Chain */}
      <Skeleton className="h-5 w-20 rounded-lg" />
      
      {/* Symbol */}
      <Skeleton className="h-4 w-16" />
      
      {/* APY */}
      <div className="text-right">
        <Skeleton className="h-5 w-16 ml-auto" />
        <Skeleton className="h-3 w-20 mt-1 ml-auto" />
      </div>
      
      {/* TVL */}
      <Skeleton className="h-4 w-20" />
      
      {/* Prediction */}
      <Skeleton className="h-5 w-16 rounded-lg" />
      
      {/* Action */}
      <Skeleton className="h-8 w-16 rounded-lg" />
    </div>
  );
}

export function PoolCardSkeleton() {
  return (
    <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-lg" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Skeleton className="h-3 w-10 mb-1" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div>
          <Skeleton className="h-3 w-10 mb-1" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <Skeleton className="h-5 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border/50">
      {Array.from({ length: rows }).map((_, i) => (
        <PoolRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PoolCardSkeleton key={i} />
      ))}
    </div>
  );
}

