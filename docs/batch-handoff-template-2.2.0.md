# Template 2.2.0 migration handoff

## Scope

This generated repository adopts the applicable n8n community-node template 2.1.1 and 2.2.0
migrations from source commit `737e421d09c1f541880a32fe34fe2eb4b9e953bc`. The migration adds a
port-pinned development launcher, its TypeScript Vitest contract, an optional read-only Discord
release notification and transport contract, workflow invariants, and current migration guidance.
It changes no dependency, lockfile, package version, node registration, credential, operation,
event, webhook lifecycle, or runtime API behavior.

The operational `scripts/dev.mjs` and release-only `scripts/notify-discord.mjs` files are intentional
direct-execution `.mjs` exceptions. Repository tests remain TypeScript `*.test.ts` files run by
Vitest. No live Discord message was sent and no repository secret or external configuration was
created, changed, or inspected.

## Adopted migration evidence

The previously implemented 2.1.1 components were reviewed before advancing the marker:

- `@n8n/scan-community-package` remains pinned at 0.38.0, and the source/published scanner wrappers
  match the reviewed template.
- The repository-local TypeScript binary resolves to `node_modules/typescript/bin/tsc` and reports
  5.9.3, avoiding the aliased nested TypeScript 6 path covered by the migration.
- Both EmDash codex manifests retain the supported **Marketing & Content** category.
- No dependency or lockfile change was required.

The generated repository deliberately retains stronger product-specific controls: complete Git
history checkout, the annotated tag and reviewed-main ancestry gate before setup/auth/publication,
real EmDash branding fallback, final package identity, and original n8n registrations. It retains
the completed lowercase product documents and the generated-mode audit that rejects raw
`API_MATRIX_TEMPLATE.md`, `BRANDING_TEMPLATE.md`, and `TESTING_TEMPLATE.md` source documents.

## Release workflow

The optional `notify-discord` job depends on both immutable publication and fresh published-package
verification. It has only `contents: read`, receives neither npm credentials nor OIDC permission,
uses an optional `DISCORD_WEBHOOK` secret reference, and cannot fail the completed release.
The notifier makes one bounded POST with `wait=true`, disables mentions, preserves a configured
Discord thread query, sanitizes failures, and does not retry blindly. Tests mock transport; no live
webhook request is part of validation.

The existing publish job still checks out full history and runs `verify-release-tag.mjs` before Node
setup, npm authentication, or release. Trusted Publishing separation and first-publication token
bootstrap support remain intact.

## Development launcher and manual acceptance

`npm run dev -- --custom-user-folder /tmp/n8n-node-run` forces port 5690 while forwarding arguments
and preserving the environment. Open `http://localhost:5690` manually because the pinned CLI browser
shortcut can open 5678. If 5690 is occupied, use
`N8N_PORT=5692 npm exec -- n8n-node dev --custom-user-folder /tmp/n8n-node-run`. An existing service
on 5678 must remain untouched.

Before this migration, the user manually accepted the grouped EmDash picker wording in the port
5690 lab using n8n 2.30.6, `n8n-editor-ui` 2.30.4, package 0.1.1, and Node 24.18.0. Screenshots were
unavailable, and the check did not cover dynamic options, icons, or service API behavior. The test
server on 5690 was stopped afterward at the user's request; its profile remains preserved and the
default 5678 service was untouched.

The actual launcher smoke used a unique temporary user folder and inherited `N8N_PORT=5678`; the
wrapper forced 5690 and the broker used 5691. The offline cached run used Node 24.18.0,
`@n8n/node-cli` 0.46.4, and n8n 2.41.5, reached **Editor is now accessible**, and returned HTTP 200
from `/healthz` plus JSON HTTP 200 from `/rest/settings` on `127.0.0.1:5690`. No package download or
upgrade occurred. A run-owned process-group `SIGINT` stopped the wrapper, CLI, and n8n cleanly; ports
5690 and 5691 were free afterward, while the existing service on 5678 retained the same process ID.
This establishes launcher behavior and cleanup only. It does not establish EmDash discovery, picker
behavior, API execution, or general n8n 2.41.5 support; the human picker acceptance above remains
specific to n8n 2.30.6.

## Acceptance boundary

The focused launcher/notifier suite passed 7 tests before the marker advanced. Formatting, lint,
strict typecheck, all 340 Vitest tests, build, official scanner checks over source and built output,
release/package audit, compiled registration load, and isolated packed install/load then passed. The
package boundary contains 394 files and loads the original two nodes and two credential types. The
first full-test and install-smoke attempts were blocked by sandbox restrictions on temporary Git and
nested npm subprocesses; the approved escalated reruns passed. A frozen install was not repeated
because dependencies and the lockfile did not change.

The marker now records 2.2.0 after component review and these gates. The bounded actual launcher
smoke and cleanup passed as recorded above. Publication, tagging, pushing, pull-request creation,
live Discord delivery, and external configuration are outside this batch.
