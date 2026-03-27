export function SkeletonLoader({ width = 'w-full', height = 'h-4' }) {
  return (
    <div className={`${width} ${height} bg-slate-200 dark:bg-slate-800 rounded animate-pulse`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-200 dark:bg-slate-800" />
      <div className="p-4 space-y-3">
        <SkeletonLoader height="h-4 w-3/4" />
        <SkeletonLoader height="h-3 w-full" />
        <SkeletonLoader height="h-3 w-5/6" />
        <div className="flex gap-2 pt-2">
          <SkeletonLoader width="w-1/4" height="h-3" />
          <SkeletonLoader width="w-1/4" height="h-3" />
        </div>
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-lg mb-6" />
      <div className="space-y-4">
        <SkeletonLoader height="h-8 w-1/2" />
        <SkeletonLoader height="h-4 w-full" />
        <SkeletonLoader height="h-4 w-5/6" />
      </div>
    </div>
  );
}

export default SkeletonLoader;
