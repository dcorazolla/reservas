# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

- Refactor: centralize UUID primary key generation into `app/Models/Traits/HasUuidPrimary.php` and apply across models that use non-incrementing string primary keys.
- Fix: make database migrations SQLite-friendly for test runs while preserving PostgreSQL defaults in production.
- CI: add GitHub Actions workflow, `docker-compose.ci.yml`, `Makefile` and align `backend/docker/php/Dockerfile` to ensure local parity with CI.

### Notes
- PHPUnit reported 13 deprecations during the verification run; these will be addressed in a follow-up PR.

## [Unreleased]

- Feature: add `partner_id` to `reservations` table and allow associating a `Partner` when creating or updating reservations. Back-end: migration, controller/service/resource changes. Front-end: reservation modal now exposes a partner select and sends `partner_id`.

