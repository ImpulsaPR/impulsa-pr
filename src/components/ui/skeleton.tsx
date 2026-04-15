export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl animate-shimmer ${className}`}
    />
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-10 w-32 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  )
}
