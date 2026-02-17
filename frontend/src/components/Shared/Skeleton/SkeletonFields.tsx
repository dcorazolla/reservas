/**
 * Pure-CSS skeleton for form fields inside modals.
 * Uses .skeleton / .skeleton-field classes from forms.css.
 */
export default function SkeletonFields({ rows = 4 }: { rows?: number }) {
  return (
    <div className="skeleton-list" data-testid="skeleton-fields">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton skeleton-field" />
      ))}
    </div>
  )
}
