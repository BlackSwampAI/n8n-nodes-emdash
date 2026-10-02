# Releasing an n8n community node

Releases are user-authorized and publish only from `.github/workflows/publish.yml`. Never run `npm publish` locally for an n8n release.

## Finalize the generated repository

Complete the README initialization checklist. `npm run release:check` enters template mode only when the normalized git origin is exactly this template repository. Every generated repository uses normal mode and must have final identity, no placeholders/examples, and no `private: true`.

## Repository restoration recovery

The GitHub repository was deleted and restored with source and immutable tags preserved, but its
Actions run history and repository secrets were lost. The npm package was separately removed, so
the previously published `0.1.0`, `0.1.1`, and `0.1.2` versions are currently unusable from the
registry even though their source tags remain. Do not replay any existing tag or attempt to republish
an existing version.

Recover CI first: merge the reviewed workflow recovery change, confirm GitHub registers both workflow
paths, manually dispatch CI, and require both Node 22.22.0 and Node 24 lanes to pass their frozen
npm 11.19.0 install and all package gates. Source YAML and local validation alone do not prove GitHub
registered or ran the workflows. Lost Actions runs and npm registry objects are external state; their
loss does not imply that the restored source, tags, or release guards are missing.

No new release is authorized by this recovery. Before preparing one, verify npm's current package-name
availability, unpublish/republication waiting periods, and bootstrap rules against npm's live service
and [official unpublish policy](https://docs.npmjs.com/policies/unpublish/). The current policy blocks
new versions under the fully removed package name for 24 hours and permanently forbids reusing a
published name/version pair. Choose a new version; never reuse `0.1.0`, `0.1.1`, or `0.1.2`. Only
after explicit authorization for that new release may an administrator create a narrowly scoped
temporary granular npm token and add it as the `NPM_TOKEN` Actions secret for the first successful
publication. Never expose the token in source, commands, issues, or logs.

After that first publication succeeds and the separate verifier passes, configure npm Trusted
Publishing for owner `BlackSwampAI`, repository `n8n-nodes-emdash`, workflow `publish.yml`, and no
GitHub Environment, explicitly selecting **Allow npm publish** rather than stage-only permission.
Then remove the temporary `NPM_TOKEN` repository secret and revoke the token. `DISCORD_WEBHOOK` is
optional and may be entered by the user; never send a live test notification. Do not claim publish
readiness until repository settings, npm package state, authentication, the one-time publish job,
and the independent verifier have all been observed directly.

## Historical 0.1.2 release handoff

The package and changelog versions are `0.1.2`. This patch gives the grouped EmDash action and
trigger picker an accurate shared description and adopts the reviewed template 2.2.0 development
launcher and optional Discord release notification. It preserves the original node identifiers,
registrations, credentials, 103 action operations, five trigger event choices, webhook behavior,
implementation styles, dependencies, and runtime API behavior.

The user manually accepted the grouped picker wording on n8n 2.30.6 / `n8n-editor-ui` 2.30.4 with
package 0.1.1 and Node 24.18.0. The released 0.1.2 artifact retained the same node runtime
implementation and changed release/development tooling plus metadata wording. This acceptance does not cover icons,
dynamic dropdowns, an actual EmDash server, or end-to-end Webhook Notifier delivery.

Before the historical tag was created, the change was reviewed, merged to `main`, and the exact
resulting `main` commit passed CI on Node 22.22.0 and Node 24. The annotated `v0.1.2` tag was created
only on that reviewed commit after explicit user authorization. The release-tag guard continues to
reject a tag on an off-main branch. Pushing, tagging, publishing, and creating a release require
explicit user authorization.

The original 0.1.2 publication used npm Trusted Publishing. That trust relationship cannot be assumed
after the package was removed. The workflow still retains `id-token: write` only on the publish
job and preserves narrowly scoped token bootstrap support for a genuinely new registry package.

The historical authorization for 0.1.2 was completed and does not authorize another publication.
Public-droplet Webhook Notifier delivery, icon presentation, and dynamic dropdown browser checks
remain unverified. The inherited online dependency audit also remains open with 17 high and 7
moderate findings; passing package gates does not waive those findings. Resolve material dependency
changes only through a separate reviewed and authorized dependency update.

## Prepublication gate

Run on the exact release commit:

```sh
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run scan:source
npm run package:check
npm run smoke:load
npm run smoke:install
git diff --check
```

The publish workflow fetches complete branch and tag history, then runs
`scripts/verify-release-tag.mjs` before authentication or publication. The guard requires an
annotated `v<package.json version>` tag that resolves to the checked-out commit and requires that
commit to be present in the fetched `refs/remotes/origin/main` history. Missing refs, lightweight
tags, mismatched versions, detached tags from unreviewed commits, and mismatched checkouts fail
closed. The guard only inspects local Git state; it never creates, fetches, moves, or pushes tags.

Inspect the dry-run tarball and install it in a disposable n8n instance. Verify node/credential loading, representative operations, error handling, and triggers where present. CI must pass on Node 22.22.0 and Node 24. The pinned official scanner preflight checks both its source patterns and built JavaScript; inline ESLint disables do not replace compliance.

Every API credential should provide a harmless authenticated test request where the service supports one. Add a product-specific release invariant so the credential cannot remain registered but disconnected from every node.

## Trusted Publishing and restored-package bootstrap

npm requires a package to exist before Trusted Publisher configuration. Because this package is
currently absent from the registry, treat the next authorized new-version publication as a manual
bootstrap only after verifying npm's current package availability and waiting-period rules. Create a
narrowly scoped, temporary granular token with publish access only to the exact package and store it
only as the `NPM_TOKEN` Actions secret. After explicit user approval, tag the reviewed commit with an
annotated immutable new version tag and let GitHub Actions publish with provenance. The tagged commit
must already be contained in `origin/main`; a tag on an unmerged release branch is rejected.

Immediately after success, configure npm Trusted Publishing for `BlackSwampAI`,
`n8n-nodes-emdash`, `publish.yml`, and no environment, explicitly selecting **Allow npm publish**.
Delete the GitHub `NPM_TOKEN` secret and revoke the temporary token. Later releases use OIDC and must
not restore the token.

The workflow removes setup-node's literal empty `_authToken=${NODE_AUTH_TOKEN}` line before tokenless publishing. Do not remove this preparation: an empty auth placeholder can suppress OIDC.

After both publication and published-package verification succeed, the optional `notify-discord`
job posts one bounded release notification when the existing `DISCORD_WEBHOOK` Actions secret is
configured. It has read-only repository permission, receives no npm token or OIDC permission, and
uses `continue-on-error` so a notification failure cannot alter the immutable release result. Never
send a live test notification as part of repository validation; transport behavior is covered by
mocked Vitest contracts.

## Verify and preserve history

Verify the workflow, npm version and `latest` tag, SLSA provenance attestation, package contents/load smoke, and matching GitHub release. The post-publication scanner accepts only a published registry package and may exit zero while printing failed checks, so require the exact `Package <name>@<version> has passed all security checks` output. It runs in the separate dependent `verify-published` job. If publication succeeded but only verification failed, diagnose it and use GitHub Actions **Re-run failed jobs**; never rerun the successful publish job for an immutable npm version. Retry only bounded, recognized registry/provenance propagation failures; 403, rate limits, timeouts, policy/lint findings, and unrelated failures remain immediate. Never reuse an npm version or move/delete a published tag. User-visible npm README or metadata corrections require a new version; workflow-only corrections do not.

Submit only that exact published version to Creator Portal, then visually inspect and record its card version and logo. A valid npm tarball can still appear stale or generic in the portal.

Before adopting this baseline in an older repository, inspect `.npmrc` and `engines.node`. Do not keep `engine-strict=true` when the declared engine excludes a required Node 22.22.0 or Node 24 CI lane. Create the migration branch from the current post-squash `main`; rebasing an old pre-squash feature branch can replay already-merged work.
