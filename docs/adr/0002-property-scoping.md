# 2. Property scoping via JWT claim `property_id`

Date: 2026-02-01

Status: Proposed

Context
-------
The system supports multiple properties (tenants) within a single deployment. Controllers and queries must enforce property-level isolation so users only see and modify resources belonging to their current property.

Decision
--------
Use a single `property_id` context derived from (in order): request attribute, authenticated user's `property_id` JWT claim, `X-Property-Id` header, query param `property_id`. In `local` and `testing` environments a fallback will query the first existing `Property` record.

Consequences
------------
- Enforces consistent scoping across controllers.
- Tests should set up a `Property` and ensure requests operate within that context, or rely on the testing fallback.

Implementation Notes
--------------------
- Implement `Controller::getPropertyId(Request $request)` to centralize the logic.
- Implement (later) scoped route-model binding to apply `property_id` automatically when route parameters refer to property-scoped models.
