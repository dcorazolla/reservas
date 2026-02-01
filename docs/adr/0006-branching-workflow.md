# 6. Trunk-based workflow and PR policy

Date: 2026-02-01

Status: Proposed

Context
-------
The team desires a trunk-based workflow with short-lived feature branches and automated checks.

Decision
--------
- Adopt trunk-based development: merge small feature branches into `main`/`trunk` after passing CI.
- Enforce code reviews and automated tests on PRs. Use protected branches and require status checks.

Consequences
------------
- Faster integration with early detection of integration issues.
- Requires reliable CI and test suites.
