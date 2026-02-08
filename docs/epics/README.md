Epic notes — MVP

This folder contains notes and epics related to the Minimum Viable Product.

- Financial audit logs
  - Migration: `backend/src/database/migrations/2026_02_08_010000_create_financial_audit_logs.php`
  - Model: `backend/src/app/Models/FinancialAuditLog.php`
  - Tests: `backend/src/tests/Feature/InvoicePaymentAuditTest.php`

- Frontend calendar / reservation UX
  - Calendar header: day/month, month above day (smaller font)
  - Do not auto-select partner in reservation modal
  - Remove UUID from reservation grid cell display; show partner badge

Use this doc to track epic-level status and link PRs and notes.

Reservations & Payments (new)

- Manual reservation creation/editing in the reservations screen (pick start/end dates, occupants, choose available room, choose partner, override price). Edits must recalculate totals and update invoices/reports.
- Payments: support full and partial payments for reservations and stays; allow combining or separating minibar charges.
- Minibar: product catalog + manual charge entries linked to a reservation; charges can be billed to guest or partner according to partner rules.
- Check-in / Check-out: quick actions available wherever reservations appear; updates status and triggers post-checkout flows.
- UI changes: rename list to `Reservas`, add attention indicators for check-ins in the calendar grid, fix search edge-cases for same-day ranges.
