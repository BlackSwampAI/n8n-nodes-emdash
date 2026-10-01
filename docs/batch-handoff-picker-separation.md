# Picker separation batch handoff

## Scope and observed cause

This batch separates the EmDash action and webhook trigger in the n8n picker while preserving saved
workflow compatibility. In n8n 2.30.6 (`n8n-editor-ui` 2.30.4), the picker removes `Trigger` from a
trigger's internal name and merges it into an action node with the resulting name. Consequently,
`emdashTrigger` normalized to `emdash` and collapsed into the action entry. A source-level execution
of the upstream generator against the prior package produced one EmDash entry with 108 selections:
103 actions and 5 event selections. This reproduction is not visual browser evidence.

Official pinned sources are
[`useActionsGeneration.ts`](https://github.com/n8n-io/n8n/blob/n8n%402.30.6/packages/frontend/editor-ui/src/features/shared/nodeCreator/composables/useActionsGeneration.ts)
and
[`NodeItem.vue`](https://github.com/n8n-io/n8n/blob/n8n%402.30.6/packages/frontend/editor-ui/src/features/shared/nodeCreator/components/ItemTypes/NodeItem.vue).
Both byte-match the installed source-map extracts. Their SHA-256 hashes are respectively
`18ffdc287067f63298070ba1d2558c5ae6afeab3f77e57f191ada9accd035d83` and
`55de3c7c7719ce7f4c4e164aa57c6d0071bdc8ec1e57b1beac52c2e751dd7eb9`.

## Implementation

- The action node stays `emdash`; all 103 operations remain declarative through routing,
  expressions, pagination, `preSend`, and `postReceive` hooks.
- The legacy `emdashTrigger` registration remains packaged with `hidden: true`, preserving existing
  workflow identifiers, credentials, webhook URLs/lifecycle, event filtering, and version 1 behavior.
- The visible `emdashWebhookTrigger` extends the legacy trigger implementation. It changes only the
  type identity and picker metadata: display name **EmDash Webhook Trigger**, picker-equivalent label
  **EmDash Webhook**, and default canvas name **EmDash Trigger**.
- The trigger remains a documented programmatic exception because incoming webhook lifecycle,
  bearer verification, payload validation, and server-side event filtering cannot be expressed as
  declarative outbound REST routing. No webhook logic is duplicated.
- All three codex manifests (action, legacy trigger, and visible trigger) use fully qualified package
  identifiers and **Marketing & Content**.

## Acceptance and verification

The regression contract covers n8n's internal-name normalization, hidden-node discovery filtering,
multi-action `Trigger` label removal, 103 action operations, four concrete event actions plus the
All Events selection, both node identifiers, and both default canvas names. It also executes the
focused upstream merge model: historical metadata yields one entry, 108 selections, and the trigger
description overwrite; fixed metadata yields separate entries whose selections target `emdash` and
`emdashWebhookTrigger` with event-array values. Runtime contract tests
compare credentials, webhook declarations, properties, lifecycle methods, and the inherited webhook
method across legacy and visible registrations.

Required package checks: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`,
`npm run build`, `npm run scan:source`, `npm run package:check`, `npm run smoke:load`,
`npm run smoke:install`, and `git diff --check`.

The orchestrator completed a frozen `npm ci --ignore-scripts --no-audit --no-fund` on Node 24.18.0
and npm 11.16.0, followed by all required checks. All 335 Vitest tests passed, and the official source
and built-package scanner used pinned version 0.38.0. The package, compiled-load, and isolated-install
checks passed. Sandbox restrictions blocked Git fixture subprocesses in the release-tag Vitest tests
and npm subprocesses in the install smoke; escalated reruns passed. The before-fix manual lab had
package 0.1.0 installed. The fresh candidate tarball came from the unreleased repository 0.1.1 tree
and had shasum `a3865d213c5e724adf70ea8dad6ec760fd39413f`. This work did not bump or publish the
version.

Running the full upstream generator against that tarball produced two separate entries:

- **EmDash** retained the action description and 103 selections targeting `emdash`.
- **EmDash Webhook** retained the trigger description and 5 event selections targeting
  `emdashWebhookTrigger`.

The resulting default canvas names were **EmDash** and **EmDash Trigger**.

The same tarball was installed in disposable n8n 2.30.6 with `n8n-editor-ui` 2.30.4 and host
`n8n-workflow` 2.30.2. Server node types showed the hidden legacy trigger, visible new trigger,
visible action, and preserved generated **EmDash Tool**. The action's `schema.getCollections`
operation sent an authenticated fixture request and returned normalized output. Unchanged legacy
`emdashTrigger` and new `emdashWebhookTrigger` workflows were imported and published only inside the
disposable instance. Both returned 401 without authorization, returned 200 without execution when
excluded by the collection filter, and returned 200 for valid requests. The two valid requests
produced exactly two successful downstream executions, one through each trigger identifier. All
run-owned services were stopped after verification.

## Limitations and follow-up

No browser was connected and the in-app browser was unavailable. There are no before/after
screenshots, and visual picker search, node details, icons, and canvas naming remain pending human
acceptance. Full EmDash Webhook Notifier-to-n8n delivery also remains pending because the completed
runtime smoke used direct fixture HTTP requests. The exact Node 22 lane remains a CI gate, and the
previous dependency-audit findings are unchanged.

The orchestrator reviewed the scope, metadata, compatibility behavior, runtime behavior, and diff.
The planned pull request will remain a draft pending UI acceptance; this handoff does not claim that
the pull request has been created. No dependencies, versions, publication state, or external systems
changed.
