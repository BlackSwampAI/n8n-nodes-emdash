# Releasing an n8n community node

Releases are user-authorized and publish only from `.github/workflows/publish.yml`. Never run `npm publish` locally for an n8n release.

## Finalize the generated repository

Complete the README initialization checklist. `npm run release:check` enters template mode only when the normalized git origin is exactly this template repository. Every generated repository uses normal mode and must have final identity, no placeholders/examples, and no `private: true`.

## 0.1.1 candidate handoff

The package and changelog versions are `0.1.1`. This patch updates both codex manifests to the
supported **Marketing & Content** category and pins the official community-package scanner at 0.38.0.
It does not change the API, node runtime, implementation style, or dependencies shipped at runtime.

Before tagging, review this candidate, merge it to `main`, and require the exact resulting `main`
commit to pass CI on Node 22.22.0 and Node 24. Create the annotated `v0.1.1` tag only on that reviewed
commit after explicit user authorization. The release-tag guard rejects a tag on an off-main candidate
branch. Pushing, tagging, publishing, and creating a release require explicit user authorization.

This existing package publishes through npm Trusted Publishing. The GitHub publish job must retain
`id-token: write`, and the npm Trusted Publisher must match the exact GitHub owner, repository,
`publish.yml` workflow, and declared environment (none). The repository must not contain or require an
`NPM_TOKEN` secret for this release. The authentication helper still preserves narrowly scoped token
bootstrap support for repositories that genuinely require a first publication.

Open limitations remain part of the release decision: public-droplet Webhook Notifier delivery and
human browser smoke for node-picker/icon presentation and dynamic dropdowns are pending. The online
dependency audit also remains open with 17 high and 7 moderate findings; passing package gates does
not waive those findings. Resolve material dependency changes only through a separate reviewed and
authorized dependency update.

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

## Trusted Publishing and first-publication fallback

npm requires a package to exist before Trusted Publisher configuration. Existing packages such as this one use OIDC with no `NPM_TOKEN`. For a genuinely new package only, create a narrowly scoped, temporary granular token with publish access only to that package and store it only as the `NPM_TOKEN` Actions secret. After explicit user approval, tag the reviewed commit with an annotated immutable version tag and let GitHub Actions publish with provenance. The tagged commit must already be contained in `origin/main`; a tag on an unmerged release branch is rejected.

Immediately after success, configure npm Trusted Publishing for the exact GitHub owner, repository, `publish.yml`, and no environment unless the workflow declares one. Delete the GitHub secret and revoke the token. Existing packages skip token bootstrap and use OIDC from the first release.

The workflow removes setup-node's literal empty `_authToken=${NODE_AUTH_TOKEN}` line before tokenless publishing. Do not remove this preparation: an empty auth placeholder can suppress OIDC.

## Verify and preserve history

Verify the workflow, npm version and `latest` tag, SLSA provenance attestation, package contents/load smoke, and matching GitHub release. The post-publication scanner accepts only a published registry package and may exit zero while printing failed checks, so require the exact `Package <name>@<version> has passed all security checks` output. It runs in the separate dependent `verify-published` job. If publication succeeded but only verification failed, diagnose it and use GitHub Actions **Re-run failed jobs**; never rerun the successful publish job for an immutable npm version. Retry only bounded, recognized registry/provenance propagation failures; 403, rate limits, timeouts, policy/lint findings, and unrelated failures remain immediate. Never reuse an npm version or move/delete a published tag. User-visible npm README or metadata corrections require a new version; workflow-only corrections do not.

Submit only that exact published version to Creator Portal, then visually inspect and record its card version and logo. A valid npm tarball can still appear stale or generic in the portal.

Before adopting this baseline in an older repository, inspect `.npmrc` and `engines.node`. Do not keep `engine-strict=true` when the declared engine excludes a required Node 22.22.0 or Node 24 CI lane. Create the migration branch from the current post-squash `main`; rebasing an old pre-squash feature branch can replay already-merged work.
