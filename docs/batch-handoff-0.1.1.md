# 0.1.1 scanner compatibility handoff

## Scope

- Goal: Restore compatibility with the current official n8n community-package scanner for release
  0.1.1.
- Allowed changes: EmDash codex categories, package and lockfile version, scanner pin and its existing
  assertions, release documentation, changelog, and this handoff.
- Non-goals: API or runtime behavior, node architecture, runtime dependencies, template migration,
  publishing, tagging, pushing, pull requests, or merging.
- Implementation style: The action node remains declarative; the trigger remains programmatic.
- Style evidence: The action node continues to use declarative routing, expressions, pagination,
  `preSend`, and `postReceive`. The trigger's incoming webhook lifecycle and filtering remain the
  documented concrete requirement for programmatic implementation.

## Evidence and tests

- Both codex manifests use the supported **Marketing & Content** category.
- The package, source scanner, published scanner, release invariant, and tests pin official scanner
  0.38.0.
- The scanner's internal `@typescript/old` package remains nested under its aliased TypeScript 6
  dependency in the lockfile. This prevents npm from replacing the project's TypeScript 5.9 `tsc`
  executable while leaving the scanner's dependency isolated and intact.
- Required validation: frozen install, format check, lint, strict typecheck, Vitest, build, source and
  built-artifact scan, dry-run package check, compiled registration load, isolated packed install,
  `git diff --check`, and allowed-file review.
- Fresh packed 0.1.1 real-n8n action, discovery, and trigger smoke passed in n8n 2.30.6 against a local
  API fixture; details are recorded in `docs/testing.md`. Browser and hosted EmDash checks remain
  separate limitations.

## Handoff

- Contract/runtime discrepancies: None introduced; the scanner category vocabulary changed while the
  EmDash runtime contract remains unchanged.
- Package evidence: `npm ci`, formatting, lint, strict typecheck, all 327 Vitest tests, build, scanner
  0.38.0 source and built-package checks, package boundary, compiled registration load, and isolated
  packed install/load passed. The tarball boundary contained 394 files, 100,619 packed bytes, and
  705,944 unpacked bytes; both compiled nodes and both wired credential types loaded.
- Cleanup status: The builder created no services; the orchestrator stopped all run-owned disposable
  n8n and fixture services after successful smoke.
- Limitations: CI on exact Node 22.22.0 and Node 24, published
  package verification, npm provenance, and GitHub release verification remain release-orchestrator
  gates.
- Authorization: The user authorized the full merge, tag, push, npm publication, published-package
  verification, and GitHub release flow for 0.1.1; no additional user approval is required.
- Orchestrator review: The diff is limited to the allowed files, and the release audit passed with no
  warnings. No runtime or API changes were introduced.
- Remaining gates: Exact-commit CI and the
  published package, provenance, scanner, and GitHub release checks.
