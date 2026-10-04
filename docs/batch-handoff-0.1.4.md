# 0.1.4 batch handoff

## Change

Removed `emdashTrigger` and the dedicated EmDash Webhook credential because the upstream notifier plugin is broken and event delivery cannot be verified. After upgrading, workflows containing `emdashTrigger` have a missing node and must be migrated before they can run. Replace it with Schedule Trigger + EmDash actions or another independently supported event source.

The package preserves its 103 declarative REST actions, EmDash API credential, dependency versions, and release infrastructure. Current registrations are action-only: one node and one wired credential.

## Validation

On Node 24.18.0, frozen `npm ci` with npm 11.19.0, format check, lint, strict typecheck, all 312 Vitest tests, build, official source and built-package scanner preflights, package checks, compiled registration loading, packed install, and `git diff --check` passed. The frozen install used task-owned workspace scratch and left shared `node_modules` untouched.

The packed candidate contains 294 files (92,660 packed bytes; 668,617 unpacked bytes), one compiled EmDash action node, one EmDash API credential, and no Trigger or Webhook artifacts. SHA-256: `edbcff30562d80462159627c6e7379b28c892af415771fbbab73d7ad2ac364fb`.

A fresh packed install in n8n 2.30.6 loaded through the scoped Community Nodes directory. Discovery returned `@blackswampai/n8n-nodes-emdash.emdash` and n8n's generated EmDash Tool entry, with no trigger. A saved workflow executed `schema.getCollections` against a loopback EmDash API fixture and returned normalized `{ "slug": "posts", "name": "Posts" }`. With a deliberately invalid API token, the fixture returned 401, the workflow status was `error`, and n8n reported `Authorization failed - please check your credentials` without exposing the token. The isolated runtime used task broker port 5799 because 5679 was occupied; its fixture and profile were stopped/removed after evidence capture. No persistent n8n service was started.

The first sandbox attempts for frozen install, Git-spawning Vitest tests, packed install, and loopback execution hit DNS or process/network restrictions. Bounded retries succeeded with elevated execution. Frozen install reported 27 audit findings (7 moderate, 20 high); no dependency versions changed. Hosted CI and the orchestrator's final review remain outstanding.
