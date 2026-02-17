/**
 * Pure-CSS skeleton loading list — replaces Chakra Skeleton in list pages.
 * Uses .skeleton-list / .skeleton-row / .skeleton classes from forms.css.
 */
export default function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton-list" data-testid="skeleton-list">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      ))}
    </div>
  )
}
