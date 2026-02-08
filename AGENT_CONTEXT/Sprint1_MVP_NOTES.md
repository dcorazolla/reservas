Sprint 1 MVP additions (updated 2026-02-08)

- Frontend: calendar grid is navigable by month and date-range (CalendarPage + CalendarGrid). Supports selecting start date and number of days, and previous/next month navigation.
- Frontend: reservations listing page added (`/reservas/list`) to query reservations for a given date range.
- Frontend: reservation form keeps the existing "Gerar fatura" action and the `invoices.create_from_reservation` feature flag is enabled by default for the Sprint 1 MVP so the invoice flow is available out-of-the-box.
- Frontend: partner form extended with billing configuration fields (`billing_rule`, `partner_discount_percent`) to support partner billing rules and percentage discounts; UI changes added to `PartnerForm`.
- Tests: vitest/a11y protections improved (a11y job skip when no tests) and local tests validated.

Notes: these additions require backend endpoints to fully operate in production (e.g. `/reservations` list, partner billing handling on invoice generation). If backend lacks these, implement corresponding endpoints and update API docs. Track any backend work as issues assigned to Sprint 1.
