# 0.1.3 release preparation handoff

## Authorized scope

The user authorized preparation of `0.1.3` and asked to return on 2026-10-03 for tagging and
publication.
This batch changes only the root package version, the corresponding root lockfile versions, and
release documentation. It does not change dependencies, lockfile resolution, scripts, node behavior,
public APIs, template state, or workflow behavior.

The release must remain in the existing pull request through final human review. Merge it before
tagging, require hosted CI on the exact resulting `main` commit, and create a new immutable annotated
`v0.1.3` tag only on that reviewed commit. Do not replay the preserved `v0.1.0`, `v0.1.1`, or
`v0.1.2` tags.

## Registry bootstrap state

The whole npm package is currently absent after user-confirmed unpublication. npm's current policy
requires a 24-hour wait before the same package name can be published again and permanently forbids
reusing an already published version. At about 10:24 UTC on 2026-10-02, the user reported that the
unpublish occurred roughly eight hours earlier. The exact time is unknown, so publication remains
blocked until the live policy and registry state establish eligibility; do not treat the estimate as
a release clock.

The `NPM_TOKEN` and optional `DISCORD_WEBHOOK` Actions secrets were observed present on 2026-10-02 at
09:44 UTC and 09:45 UTC respectively. Their values were not read, and presence alone does not prove
validity, scope, delivery, or npm acceptance. The tag-only workflow remains the only publication path. Once
the new package exists and its independent verifier passes, configure npm Trusted Publishing for
`BlackSwampAI/n8n-nodes-emdash`, workflow `publish.yml`, no environment, with **Allow npm publish**;
then delete the temporary GitHub secret and revoke the token at npm. Do not live-test the optional
Discord notification.

## Candidate contents and evidence

Version 0.1.3 contains the compatibility and recovery work: filename-matching constructor
exports without redundant aliases, dependency-free multipart `Buffer` encoding, removal of 32 empty
operation property modules, and CI recovery support. The original published 0.1.2 package and a
0.1.2-versioned packed review candidate containing the new multipart implementation both passed the
local real-n8n parser fixture. The fresh 0.1.3 runtime smoke remains pending for 2026-10-03, and the
earlier comparison is not evidence that the old implementation was broken or that all `FormData`
use is incompatible.

Local builder validation used Node 24.18.0 and pinned npm 11.19.0 on the existing dependency tree.
Formatting, lint, strict typecheck, build, official source and built scanner preflights, release
audit, package validation, and compiled loading passed. The package boundary is 301 files, 98,091
packed bytes, and 692,201 unpacked bytes; two nodes and two wired credential types loaded. Vitest
passed 338 tests in the sandbox, while seven release-tag tests hit its `spawnSync git EPERM`
restriction.

The primary completed a fresh pinned npm 11.19.0 install of 744 packages without changing the
lockfile, all 345 tests across 12 files outside the sandbox, and an isolated packed 0.1.3
installation that loaded two nodes and two wired credential types. The fresh representative real-n8n
0.1.3 candidate smoke, exact merged-main CI, tag, registry publication, and authentication
verification remain 2026-10-03 gates. Pull-request CI will run on the final prepared commit.

GitHub's public repository, `main` branch, Actions enablement, and read-token settings were observed
healthy on 2026-10-02. Do not infer browser behavior, live EmDash-host behavior, npm authentication,
publication readiness, or review approval from local and pull-request gates.

The development and host-provided dependency tree has 24 known audit findings: 17 high and 7
moderate. The published manifest has no bundled runtime dependencies, and this release does not
change dependency versions.
