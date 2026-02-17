/**
 * Shared form validation helpers.
 *
 * Each validator returns an error key (i18n) or `null` if valid.
 * Usage example:
 *   const errs = runValidation({
 *     name: [requiredString(name)],
 *     beds: [requiredPositiveNumber(beds)],
 *   }, t)
 */

type TranslateFn = (key: string) => string

/** Returns error message if value is empty/whitespace-only, null otherwise. */
export function requiredString(
  value: string | null | undefined,
  t: TranslateFn,
): string | null {
  if (!value || !value.trim()) return t('common.status.error_required')
  return null
}

/** Returns error message if value is not a positive number (> 0), null otherwise. */
export function requiredPositiveNumber(
  value: string | number | null | undefined,
  t: TranslateFn,
): string | null {
  if (value === '' || value == null) return t('common.status.error_required')
  const n = Number(value)
  if (Number.isNaN(n) || n < 1) return t('common.status.error_required')
  return null
}

/** Returns error message if value is empty, null otherwise. Non-empty numbers are also ok. */
export function requiredNumeric(
  value: string | number | null | undefined,
  t: TranslateFn,
): string | null {
  if (value === '' || value == null) return t('common.status.error_required')
  const n = Number(value)
  if (Number.isNaN(n)) return t('common.status.error_required')
  return null
}

/**
 * Run a set of validations and return the error map.
 *
 * @param rules — object where each key maps to an array of possible error strings (null = pass).
 *                The first non-null error per key wins.
 * @returns Record<string, string> — empty if all pass.
 */
export function runValidation(
  rules: Record<string, (string | null)[]>,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const [field, checks] of Object.entries(rules)) {
    for (const err of checks) {
      if (err) {
        errors[field] = err
        break
      }
    }
  }
  return errors
}

/**
 * Convert a string value to number or null.
 * Useful for optional numeric form fields.
 */
export function toNumberOrNull(v: string | null | undefined): number | null {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}
