# 1. Use UUIDs for Primary Keys

Date: 2026-02-01

Status: Proposed

Context
-------
The application must model domain entities (partners, invoices, payments) that may be referenced outside of the database (APIs, audit logs, external systems). Numeric autoincrement IDs leak implementation details and complicate merging data across environments.

Decision
--------
Use UUIDv4 (RFC 4122) formatted strings as primary keys for domain tables where stable, globally unique identifiers are required (partners, invoices, invoice_lines, payments, invoice_line_payments, financial_audit_logs).

Consequences
------------
- Pros: better merging across systems, easier to expose ids to APIs safely, avoids enumeration.
- Cons: larger indexes and storage overhead; queries using joins may be marginally slower than integer keys.

Implementation Notes
--------------------
- Migrations will set `id` as string PK with `uuid()` defaults where possible and `public function getRouteKeyName()` will continue to use `id`.
- Eloquent models should set `$incrementing = false` and `$keyType = 'string'`.
