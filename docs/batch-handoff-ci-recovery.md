# CI/CD restoration recovery handoff

## Scope

This batch makes ordinary CI manually dispatchable so the restored GitHub repository can register
and prove the workflow without creating a release. It retains pull-request and `main` push triggers,
the Node 22.22.0 and Node 24 matrix, npm 11.19.0 frozen install, and every existing validation gate.

The publish workflow remains tag-only. Recovery comments make clear that existing tags must not be
replayed and that a future release needs a new reviewed version plus explicit user authorization.
The full-history annotated-tag and reviewed-`main` guard, isolated OIDC publish job, read-only
post-publication verifier, and optional Discord notification job are unchanged.

## Observed loss and preserved source

The restored public GitHub repository retained source and the `v0.1.0`, `v0.1.1`, and `v0.1.2`
tags. GitHub reported Actions enabled with allowed actions set to all and default workflow token
permission set to read, but its workflows and runs APIs returned empty lists. Repository secrets were
empty, including no `NPM_TOKEN` or `DISCORD_WEBHOOK`. No branch protection or rulesets were observed,
and this batch introduces none.

The npm registry returned 404 for the package after the user unpublished it. npm trust inspection
returned 401 because no npm administrator session was available, so the prior trust configuration is
unverified rather than proven lost. The lost external run and secret state and removed registry
package do not erase the preserved workflow source or release tags.

## Safe recovery sequence

1. Merge the reviewed recovery change without creating or replaying a tag.
2. Confirm GitHub registers `.github/workflows/ci.yml` and `.github/workflows/publish.yml`.
3. Dispatch CI and require both matrix lanes to pass. YAML inspection alone is not remote execution
   evidence.
4. Keep publication blocked until the user explicitly authorizes a new version and npm's current
   package availability, unpublish waiting periods, and bootstrap requirements have been verified.
   npm's current policy blocks a fully unpublished name for 24 hours and permanently forbids reuse
   of an old name/version pair; verify the live state again before release.
5. For the first authorized new publication only, add a narrowly scoped temporary `NPM_TOKEN`, use a
   new annotated tag on reviewed `main`, and let the tag-only workflow publish once with provenance.
6. After publication and the independent verifier succeed, configure npm Trusted Publishing for
   `BlackSwampAI/n8n-nodes-emdash`, workflow `publish.yml`, and no environment. Remove the GitHub
   `NPM_TOKEN` secret and revoke the temporary token. Explicitly select **Allow npm publish** when
   creating the trust relationship; stage-only permission is insufficient.
7. Restore `DISCORD_WEBHOOK` only if the user wants notifications. Never send a live test message.

Previously published versions remain unusable while absent from npm. Existing tags and versions are
immutable and must not be reused. This recovery does not authorize publication, prove npm readiness,
or claim that GitHub registered the workflows merely because their YAML exists.

## Verification

Local validation used Node 24.18.0 and the repository installation:

- `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm run build` passed.
- `npm test -- --exclude tests/release-tag.test.ts` passed 337 tests in 11 files. The focused
  release-hardening and template tests passed. The release-tag file's eight tests could not start
  their temporary Git repositories inside the sandbox because `spawnSync git` returned `EPERM`;
  the orchestrator reran that file outside the sandbox and all eight passed.
- `npm run scan:source` passed the pinned 0.38.0 scanner against source and built JavaScript.
- `npm run package:check` passed with 397 files, 102,632 packed bytes, and 712,483 unpacked bytes.
- `npm run smoke:load` loaded two compiled nodes and two wired credential types.
- The release audit passed with only the expected warning that local tag `v0.1.2` already exists.

The full frozen Node 22.22.0/Node 24 CI run remains an external orchestrator gate. No reinstall was
performed because dependencies and the lockfile are unchanged. No remote settings, secrets, npm
trust, tags, releases, publications, or notification endpoints were mutated or live-tested.
