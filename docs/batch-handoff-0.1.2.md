# 0.1.2 release handoff

## Release scope

Version 0.1.2 contains the user-accepted EmDash picker wording and the reviewed
n8n-community-node-template 2.2.0 migration. The action and trigger descriptions both read **Work
with EmDash content, media, and events**, preserving n8n's built-in grouped action/trigger picker
convention. The template migration adds the port-5690 development launcher and an optional,
read-only Discord notification after successful publication and published-package verification.

The package retains the original visible node identifiers `emdash` and `emdashTrigger`, default
canvas names **EmDash** and **EmDash Trigger**, all 103 declarative action operations, all five
programmatic trigger event choices, both credential types, and the existing webhook lifecycle,
authentication, payload validation, and filtering behavior. There are no dependency, registration,
runtime API, operation, event, credential, or implementation-style changes.

## Version and compatibility evidence

- Package, root lockfile entry, and changelog version: 0.1.2.
- n8n picker/source baseline: n8n 2.30.6 with `n8n-editor-ui` 2.30.4.
- User picker acceptance: package 0.1.1 on Node 24.18.0 with the same node runtime implementation and
  final shared description used by 0.1.2.
- Template baseline: 2.2.0 at reviewed source commit
  `737e421d09c1f541880a32fe34fe2eb4b9e953bc`.
- Official community-package scanner: 0.38.0.

The manual picker acceptance establishes the grouped wording and selection presentation. It does not
establish icon rendering, dynamic dropdown behavior, an actual EmDash service integration, or full
Webhook Notifier-to-n8n delivery. CI, GitHub release, npm provenance/package verification, and
published scanner verification are owned by the primary orchestrator.

## Packed runtime evidence

A freshly packed 0.1.2 candidate passed a disposable runtime smoke on Node 24.18.0 with n8n 2.30.6
and `n8n-editor-ui` 2.30.4. The original `emdash` node executed `schema.getCollections`; a local API
fixture observed authentication and n8n returned normalized output. A workflow using the unchanged
original `emdashTrigger` identifier imported and published successfully. Its webhook returned 401
without authorization, returned 200 without an execution when excluded by the collection filter,
and returned 200 with one successful downstream execution for a valid matching event.

The packed candidate contains 394 files, is 100,916 bytes, and has SHA-1
`d5bbba5203ef5420b214570582caf40dd153ad9d`. All run-owned services stopped after verification. This
is disposable n8n runtime evidence against a local HTTP fixture. It does not establish behavior
against an actual EmDash server, full Webhook Notifier delivery, or new browser acceptance; the
separate human picker acceptance remains the result recorded above.

The packed 0.1.2 `Emdash.node.js` and `EmdashTrigger.node.js` registration files are byte-identical
to the package 0.1.1 files used in that manual picker acceptance. Their respective SHA-256 hashes are
`5941559a694ecc89cc0947394fe5436dd9dddbd7687dd640ece4ad84320930df` and
`dbad5cb90a8a702bcb020c5039ed0dcf189fd25bd3801b8b3172effc5c5d840c`.

## Release controls

The user explicitly authorized the 0.1.2 release through completion. The primary orchestrator owns
commit, reviewed-main integration, the annotated `v0.1.2` tag, push, publication, release monitoring,
and external verification. The publish workflow retains the full-history checkout, annotated-tag and
reviewed-main ancestry guard, OIDC publication separation, and first-publication bootstrap support.

The optional `DISCORD_WEBHOOK` secret name exists and `NPM_TOKEN` is absent; no secret value was
inspected or changed. The primary orchestrator will monitor the optional read-only notification job.
No live test message is part of release preparation.

## Validation and limits

The exact candidate passed a frozen `npm ci --ignore-scripts --no-audit --no-fund` with pinned npm
11.19.0; the installed repository compiler reported TypeScript 5.9.3. Formatting, lint, strict
typecheck, all 340 Vitest tests, build, official source and built-output scanner checks,
release/package checks, compiled registration load, and isolated package install/load passed. The
package boundary contains 394 files and loads the original two nodes and two credential types. The
lockfile diff changes only its two root version fields.

The first frozen install attempt encountered sandbox DNS failure for one uncached scanner package;
the approved network-enabled rerun passed. Sandbox restrictions also blocked temporary Git fixture
subprocesses in Vitest and nested npm subprocesses in the install smoke; their approved escalated
reruns passed. `git diff --check` and the final authorized-file review complete this builder handoff.

The inherited audit findings remain outside this release's dependency-free scope. Version 0.1.2 was
absent from npm when preparation began; npm `latest` was 0.1.1 and remote `main` was `d632086`.
