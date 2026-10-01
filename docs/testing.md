# Testing strategy for EmDash integration

## 0.1.1 scanner compatibility — 2026-09-30

The 0.1.1 release changes both codex manifests from the unsupported **Developer Tools** category to the
supported **Marketing & Content** category and pins the official scanner at 0.38.0. The action node
remains declarative, using routing, expressions, pagination, `preSend`, and `postReceive`; the trigger
remains programmatic because it implements incoming webhook lifecycle and filtering behavior.

Release validation covers a frozen install, formatting, lint, strict typecheck, Vitest, build, the
official scanner against source and built JavaScript, dry-run package checks, compiled registration
loading, and isolated packed-package installation. All passed locally: 327 Vitest tests passed; the
package boundary contained 394 files (100,619 packed bytes and 705,944 unpacked bytes); and both
compiled nodes with both wired credential types loaded from the package registrations and from an
isolated tarball consumer.

A fresh packed 0.1.1 package in isolated n8n 2.30.6 executed `schema.getCollections` against a local
HTTP API fixture. The fixture observed the authenticated request, and n8n returned the normalized
collection output. Discovery showed exactly one scoped action and trigger registration. The trigger
rejected missing authorization with 401, accepted a valid event with 200, and produced exactly one
successful downstream execution. All run-owned services stopped afterward. This is real-n8n runtime
evidence with a fixture API; it does not establish new browser or hosted EmDash behavior.

## Observed release-hardening evidence — 2026-09-30

The follow-up release-hardening run produced the following direct evidence:

- Vitest passed all 327 tests on local Node 24 and Node 22.23.2. The Node 22 run does not prove the
  exact declared CI minimum of 22.22.0; CI remains responsible for that lane.
- Lint, strict typecheck, build, official source and built-package scanner preflight, package checks,
  compiled registration load, and disposable packed-tarball installation/load all passed.
- A fresh packed package loaded in isolated n8n 2.30.6 with one scoped **EmDash** registration and
  one scoped **EmDash Trigger** registration. n8n also generated its expected **EmDash Tool** entry.
  No duplicate registrations from `N8N_CUSTOM_EXTENSIONS` were present.
- Both n8n icon HTTP routes returned status 200 and the bytes of the official EmDash assets. This is
  HTTP and asset-byte evidence, not a visual editor check.
- Real n8n executions succeeded for one read operation in every resource: `comment.getCounts`,
  `content.getAll`, `media.getAll`, `menu.getAll`, `redirect.getAllRedirects`,
  `schema.getCollections`, `search.search`, `section.getAll`, `settings.get`,
  `taxonomy.getAllTaxonomies`, and `widgetArea.getAll`.
- Trigger HTTP/runtime checks observed: missing and wrong authorization returned 401; malformed input
  returned 400; selected-event and collection-filter exclusions returned 200 without an execution;
  a valid request returned 200 with a successful downstream execution; restart preserved activation;
  deactivation returned 404; wildcard selection delivered all four supported event types; and a
  content-only collection filter did not filter media events.
- Duplicate `Authorization` headers were normalized by n8n/Node to the first value. An invalid first
  value returned 401 without execution; a valid first value returned 200 with successful execution.
  This does not demonstrate rejection of raw duplicate headers.

### Open dependency audit item

An online `npm audit --json` run on 2026-09-30 reported 24 findings: 17 high, 7 moderate, and 0
critical. These findings span development/release tooling and the locally installed `n8n-workflow`
tree, including `axios`. Passing lint, tests, build, the official community-package scanner, and
package-boundary checks does not mean this dependency audit passed. npm's proposed remedies include
major-version changes or downgrades to `@n8n/node-cli` and the scanner, plus a `release-it` upgrade;
they require a separate dependency review and authorization before material dependency changes.

The published package manifest declares no bundled runtime dependencies, and `n8n-workflow` remains
a host-provided peer. No dependency versions changed during this release-hardening work. Do not apply
`npm audit fix --force` as an unreviewed release fix.

The original disposable lab was then repaired and restarted from the tested tarball. Live discovery
again showed exactly the scoped **EmDash**, **EmDash Trigger**, and generated **EmDash Tool** entries,
with no custom-extension duplicates; both icon routes returned 200 with bytes matching the official
assets. Before repair, the SQLite database and `.manual-test.env` were backed up. Only the existing
notifier URL fields and environment URL were corrected to include the final `/webhook` segment. Both
saved copies of `01 - EmDash Trigger Verification` were repaired through the n8n CLI with events
`['*']`, blank `collectionFilter`, stable `webhookId`, and the **EmDash Local Lab Webhook** credential
attached; both remain inactive. All other saved workflows and the original execution count were
preserved. The lab was observed running on ports 4321, 5680, and 5681, with the primary n8n ports
untouched.

At candidate handoff, the task's manual lab and disposable test services were stopped and ports 4321,
5680, and 5681 were verified closed. The user's primary n8n service and ports were preserved.

The full EmDash Webhook Notifier-to-n8n path remains untested locally. EmDash core outbound SSRF
protection blocks the loopback destination despite the notifier development flag. Test this on the
public droplet by attaching the EmDash Webhook credential to the active workflow, copying n8n's
generated HTTPS production URL into the notifier, and configuring the same shared token in both.

Browser automation was unavailable. Visual node-picker differentiation, rendered icons, and dynamic
dropdown behavior remain pending human checks; server metadata and icon HTTP responses do not satisfy
those checks. This follow-up did not execute all 103 action operations. It also performed no npm
publication, published-package verification, GitHub release, or Creator Portal verification.

## Unit and contract tests

- Use strict TypeScript `*.test.ts` files under Vitest.
- Assert resource/operation visibility and every required control's display conditions.
- Test manual strings, expression values, and list-mode resource-locator objects.
- Execute blank/default state for list/history operations and invalid required state; prove validation occurs before transport.
- Mock observed API wrappers and identifier variants, not idealized shapes only.
- Cover destructive confirmations, redaction, and full-update preservation.

### Declarative routing contracts

- Assert `requestDefaults` and operation routing produce the expected method, URL, headers, query, and body for each visible parameter combination.
- Exercise expressions, pagination boundaries, `preSend`, and `postReceive`, including observed wrappers, empty pages, limits, and response normalization.
- Prove one request/output sequence per input item and verify automatic item lineage remains intact.

### Programmatic execution responsibilities

- For every documented programmatic exception, test the behavior that declarative routing cannot safely express.
- Prove execution does not mutate input items, preserves paired-item lineage, and handles multiple input items deterministically.
- Cover request-helper usage, pagination boundaries, `continueOnFail`, and conversion of transport or implementation failures into useful n8n errors without exposing credentials.

## Disposable service tests

- Pin the service version or image digest and document how it is refreshed.
- Fail closed unless the base URL and organization/account identify the disposable target.
- Use run-scoped, exact-owned names. Clean exact identifiers in dependency order and assert absence; never sweep prefixes or delete persistent volumes.
- Separate generated-contract claims from observed service behavior and keep suites independently runnable.

## Actual n8n and package smoke

- Build, run the official source/built scanner, inspect the dry-run tarball, load every compiled registration, and install that tarball in an isolated consumer.
- In disposable n8n, inspect credentials, node discovery, representative operation fields, dynamic selectors, hidden-field request behavior, execution, and trigger activation where present.
- Distinguish browser/network evidence from metadata inference. Bound unsupported UI automation attempts and report limitations.
- Never use production credentials or mutate hosted data without explicit authorization.
- Submit only the exact published package version, then visually record the Creator Portal card version and logo. This manual check is independent of tarball validation and catches stale portal state.

## Publication verification

- Keep `npm run release` in a single immutable `publish` job with OIDC permission.
- Run `npm run scan:published` only in a fresh, read-only `verify-published` job that depends on `publish` and performs its own checkout, Node setup, and `npm ci`.
- If only the verifier fails after npm publication, inspect npm first and rerun only failed jobs. Never rerun a successful publish job for an existing version.
- Treat only the exact documented metadata, analysis-404, and provenance source-repository 404 propagation messages as retryable. A generic HTTP status match is too broad.
