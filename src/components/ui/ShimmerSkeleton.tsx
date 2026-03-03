import { cn } from '@/lib/utils';

interface ShimmerSkeletonProps {
  className?: string;
}

export function ShimmerSkeleton({ className }: ShimmerSkeletonProps) {
  return <div className={cn('shimmer', className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="w-full min-w-[260px] max-w-[320px] flex-shrink-0 border border-border">
      <ShimmerSkeleton className="aspect-square" />
      <div className="p-4 space-y-3">
        <ShimmerSkeleton className="h-3 w-20" />
        <ShimmerSkeleton className="h-4 w-full" />
        <ShimmerSkeleton className="h-4 w-3/4" />
        <ShimmerSkeleton className="h-5 w-24" />
        <div className="flex gap-1.5">
          <ShimmerSkeleton className="w-5 h-5" />
          <ShimmerSkeleton className="w-5 h-5" />
          <ShimmerSkeleton className="w-5 h-5" />
        </div>
        <ShimmerSkeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
