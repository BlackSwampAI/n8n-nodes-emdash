# Airtable-aligned picker convention handoff

## Scope and decision

The EmDash action and trigger retain their original visible registrations, identifiers, and default
canvas names:

- `emdash`: **EmDash**
- `emdashTrigger`: **EmDash Trigger**

The only runtime metadata changes are the two description strings. Both now read **Work with EmDash
content, media, and events**, without role prefixes or suffixes. No registration, category,
credential, webhook, operation, event, dependency, version, or implementation-style behavior changed.

This follows the official paired-node naming convention demonstrated by
[`Airtable.node.ts`](https://github.com/n8n-io/n8n/blob/n8n%402.30.6/packages/nodes-base/nodes/Airtable/Airtable.node.ts)
and
[`AirtableTrigger.node.ts`](https://github.com/n8n-io/n8n/blob/n8n%402.30.6/packages/nodes-base/nodes/Airtable/AirtableTrigger.node.ts).
EmDash retains its programmatic incoming-webhook implementation; Airtable's polling behavior is not
applicable and was not copied.

## n8n grouping contract

The pinned n8n 2.30.6 / `n8n-editor-ui` 2.30.4
[`useActionsGeneration.ts`](https://github.com/n8n-io/n8n/blob/n8n%402.30.6/packages/frontend/editor-ui/src/features/shared/nodeCreator/composables/useActionsGeneration.ts)
normalizes a trigger with `trigger.name.replace('Trigger', '')`. When it finds a matching action app,
it combines action and trigger selections and assigns the trigger description to the grouped service.
Selection targets and default node names remain specific to the originating node type.

The focused regression model verifies one grouped EmDash service with 108 selections:

- 103 **Actions** selections target `emdash` and retain resource/operation node values.
- 5 **Triggers** selections target `emdashTrigger` and retain event-array node values.

The actual visible node types remain separate from this service grouping. Their node-specific names
remain **EmDash** and **EmDash Trigger**. The grouped service description intentionally uses the
trigger description because that is current upstream behavior. Giving both descriptions the same
broad integration wording makes the fallback accurate for the combined service. The focused model
tests upstream grouping and description fallback; it does not visually verify the rendered card and
does not claim the wording is an exact copy of Airtable metadata.

## Implementation style and compatibility

The 103 action operations remain declarative through routing, expressions, pagination, `preSend`,
and `postReceive` hooks. The trigger remains a documented programmatic exception because incoming
webhook lifecycle, bearer authentication, payload validation, and server-side filtering cannot be
implemented as declarative outbound REST routing.

Credentials, webhook lifecycle, filtering, both workflow identifiers, all operations, and all five
event choices are unchanged. The previously tested manual lab package was 0.1.0; the current
repository baseline is 0.1.1. This work does not publish or bump a package version.

## Package validation

Formatting, lint, strict typecheck, all 333 Vitest tests, build, official source and built-package
scanner preflight, package checks, compiled registration loading, and isolated packed-package
installation/loading passed. The package boundary contains the expected 394 files; the compiled and
isolated loaders each reported the original two nodes and two credential types. Stale generated files
from the rejected separation approach were removed before rebuilding and were absent from the final
package. The install smoke's first sandboxed attempt could not spawn npm; its approved escalated rerun
passed.

## Packed runtime evidence

The packed 0.1.1 candidate passed an independent loopback runtime smoke on Node 24.18.0 with n8n
2.30.6, `n8n-editor-ui` 2.30.4, and official scanner 0.38.0. The original identifiers remained in use:

- `emdash` executed `schema.getCollections`; the local API fixture observed authentication and n8n
  returned normalized output.
- An `emdashTrigger` workflow imported and published inside the disposable instance. Missing
  authorization returned 401, a collection-filtered request returned 200 without execution, and a
  valid request returned 200 with one successful downstream execution.

All run-owned services stopped after verification. The full pinned upstream generator executed
against the packed metadata and returned one EmDash group with 108 selections retaining the original
action and trigger targets. The same generator executed against installed official Airtable metadata
and returned one Airtable group with 9 selections retaining its original action and trigger targets;
it also confirmed the trigger-description fallback.

The existing port 5690 manual-lab profile was backed up and preserved, then refreshed from the same
candidate tarball (SHA-256
`70141c341cfdd20fa4a2df30c35185760a9aad5232f551609efa6381f2177782`). Its settings endpoint and
editor root returned 200. Installed metadata showed the two original visible node types, the exact
shared description, and default names **EmDash** and **EmDash Trigger**. The lab uses loopback ports
5690 and 5691; disposable smoke ports 5692 and 5693 were stopped, and the existing default-port n8n
process was untouched. The user then manually confirmed the grouped picker wording on this n8n
2.30.6 / `n8n-editor-ui` 2.30.4 / package 0.1.1 / Node 24.18.0 lab. Screenshots were unavailable,
and the check did not cover dynamic options, icons, or service API behavior. The port 5690 lab was
stopped afterward at the user's request while its profile remained preserved; the default-port
process remained untouched.

## Acceptance boundary

The generator results establish source behavior, and the disposable runtime establishes local HTTP
fixture behavior. They do not test an actual EmDash server or Webhook Notifier and do not establish
rendered UI behavior. The computer inventory returned no connected apps or browsers, so screenshots
were unavailable. The subsequent human check establishes acceptance of the grouped picker wording;
no before/after screenshots or broader UI claims are made.
