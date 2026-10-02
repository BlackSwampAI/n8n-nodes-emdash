# Testing strategy for EmDash integration

## Paired action/trigger picker convention — unreleased

n8n 2.30.6 bundles `n8n-editor-ui` 2.30.4. Its action generator removes `Trigger` from a trigger's
internal name, groups a matching action and trigger under one service entry, combines their choices,
and uses the trigger description for the grouped service. The selection records retain the original
node identifiers and defaults. This is the same naming relationship used by the official built-in
`airtable` and `airtableTrigger` nodes; the EmDash description wording is integration-specific and is
not claimed as an exact copy of Airtable metadata.

The focused fixture in `tests/fixtures/n8n-picker-2.30.6.ts` models the relevant behavior from the
[pinned picker source](https://github.com/n8n-io/n8n/blob/n8n%402.30.6/packages/frontend/editor-ui/src/features/shared/nodeCreator/composables/useActionsGeneration.ts).
It also records the official
[Airtable action](https://github.com/n8n-io/n8n/blob/n8n%402.30.6/packages/nodes-base/nodes/Airtable/Airtable.node.ts)
and
[Airtable trigger](https://github.com/n8n-io/n8n/blob/n8n%402.30.6/packages/nodes-base/nodes/Airtable/AirtableTrigger.node.ts)
as naming references without importing or copying their polling implementation.

The regression contract expects one grouped EmDash service with 108 choices: 103 **Actions**
selections targeting `emdash` with resource/operation values and 5 **Triggers** selections targeting
`emdashTrigger` with event arrays. The underlying visible node types remain separate, with default
canvas names **EmDash** and **EmDash Trigger**. The grouped description intentionally comes from the
trigger because that is current upstream behavior. Both EmDash node descriptions use **Work with
EmDash content, media, and events**, which makes that fallback broad enough for the combined service.
The fixture models upstream grouping and description fallback; it is source-level evidence, not
visual verification. The user subsequently confirmed the grouped picker wording manually in the
port 5690 lab on n8n 2.30.6 / `n8n-editor-ui` 2.30.4 with package 0.1.1 and Node 24.18.0. No
screenshots were available, and that acceptance does not cover dynamic options, icons, or service API
behavior.

Local validation passed formatting, lint, strict typecheck, all 333 Vitest tests, build, official
source and built-package scanner preflight, package checks, compiled registration loading, and an
isolated packed-package install/load. The package boundary returned to the expected 394 files, with
only the original two nodes and two credential types loaded. The install smoke's sandboxed attempt
could not spawn npm; its approved escalated rerun passed.

The packed 0.1.1 candidate also passed an independent loopback runtime smoke on Node 24.18.0 with
n8n 2.30.6, `n8n-editor-ui` 2.30.4, and official scanner 0.38.0. The original `emdash` action sent an
authenticated `schema.getCollections` request to a local API fixture and returned normalized output.
The original `emdashTrigger` workflow imported and published in the disposable instance; missing
authorization returned 401, a collection-filtered request returned 200 without execution, and a
valid request returned 200 with one successful downstream execution. All run-owned services stopped
afterward.

The full pinned upstream generator produced one EmDash group with 108 selections retaining the two
original EmDash targets. Running the same generator against installed official Airtable metadata
produced one Airtable group with 9 selections retaining its action and trigger targets, and confirmed
the trigger-description fallback. These are source-level and local-fixture runtime results. They do
not establish behavior against an actual EmDash server or notifier, or visual editor acceptance. The
computer inventory contained no connected apps or browsers, so screenshots remain unavailable. The
later human picker check supplies the visual acceptance for this wording change.

The existing manual profile was backed up and preserved while its port 5690 lab was refreshed from
the candidate tarball (SHA-256
`70141c341cfdd20fa4a2df30c35185760a9aad5232f551609efa6381f2177782`). The settings endpoint and
editor root both returned 200. Installed metadata reported the two original visible types, the exact
shared description, and default names **EmDash** and **EmDash Trigger**. At that stage, the lab used
only loopback ports 5690 and 5691; disposable smoke ports 5692 and 5693 were stopped, and the existing
default-port n8n process was untouched. After the user's manual picker check, the port 5690 lab was
stopped at the user's request; its profile remains preserved. The HTTP and metadata checks are not
the source of visual acceptance.

## Template-managed development launcher

`npm run dev -- --custom-user-folder /tmp/n8n-node-run` starts the pinned node CLI through the
cross-platform operational script `scripts/dev.mjs`, forces `N8N_PORT=5690`, preserves the process
environment, and forwards additional arguments. Open `http://localhost:5690` manually because the
pinned CLI shortcut can open 5678. If 5690 is occupied, bypass the wrapper explicitly with
`N8N_PORT=5692 npm exec -- n8n-node dev --custom-user-folder /tmp/n8n-node-run` and open port 5692.
Do not stop or restart an existing service on 5678. The `.mjs` launcher and Discord notifier are
direct-execution operational/release tools; automated repository tests remain TypeScript Vitest
files.

The actual launcher smoke ran `npm run dev` with a unique temporary user folder and an inherited
`N8N_PORT=5678`. The wrapper forced port 5690 and n8n's broker used 5691. With Node 24.18.0,
`@n8n/node-cli` 0.46.4, and cached n8n 2.41.5, the offline run reached **Editor is now accessible**;
`/healthz` returned 200 and `/rest/settings` returned JSON with status 200 on `127.0.0.1:5690`. No
download or upgrade occurred. A run-owned process-group `SIGINT` stopped the wrapper, CLI, and n8n
cleanly, ports 5690 and 5691 were free afterward, and the existing service on 5678 retained the same
process ID. This verifies launcher port enforcement and cleanup only; it does not establish EmDash
node discovery, picker behavior, API execution, or general support for n8n 2.41.5. The separate human
picker acceptance remains the n8n 2.30.6 result recorded above.

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

Direct upload and image replacement keep declarative routing and their existing `preSend` hooks. The
hooks now hand n8n an `IHttpRequestOptions` body as a `Buffer` with an explicit multipart boundary,
without a runtime multipart dependency or native `FormData`/`Blob`. Tests decode the emitted bytes
with the test runtime's independent `Request.formData()` parser and verify exact binary content,
text fields, required replacement dimensions, optional thumbnails, non-ASCII filenames, quote and
CR/LF header safety, MIME fallback, and boundary-collision handling. This verifies serialization;
it does not claim an upload against a live EmDash service. Existing real-n8n smokes covered reads and
triggers only.

For this compatibility batch, the orchestrator also ran packed-package upload and replacement
workflows in n8n 2.30.6 against a local multipart HTTP parser fixture. The original 0.1.2 package and
the new candidate both preserved exact binary bytes, UTF-8 filename and MIME metadata, thumbnail,
authentication, boolean and optional text fields, replacement path/method/dimensions, and normalized
workflow output. This fixture evidence verifies the n8n request path and serializer compatibility;
it is not a real EmDash-host test or human review approval.

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
