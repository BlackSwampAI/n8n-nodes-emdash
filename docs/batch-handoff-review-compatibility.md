# Review compatibility batch handoff

## Scope and implementation style

This batch removes redundant node-constructor aliases and replaces native runtime `FormData`/`Blob`
construction for direct media upload and image replacement with a dependency-free multipart Buffer
encoder. The registered paths, filename-matching `Emdash` and `EmdashTrigger` constructors, stable
node identifiers, public fields, authentication, and API routes remain unchanged.

Both media operations remain declarative. Their existing `preSend` hooks are the concrete routing
mechanism required to read n8n binary data and serialize multipart requests; no programmatic node or
runtime dependency was introduced. The trigger remains the previously documented programmatic
exception for incoming webhook lifecycle and validation.

## Transport evidence and limits

The encoder writes exact binary bytes to a Buffer, selects a boundary absent from every part payload,
sets the matching `Content-Type`, emits a quoted UTF-8 filename, replaces CR/LF with underscores,
percent-encodes quote/backslash characters in quoted header values, and falls back to
`application/octet-stream` for unsafe MIME metadata. Unit tests parse the actual bytes independently
with the test runtime's native multipart parser.

Official n8n helper documentation supports `FormData` generally; this change addresses the review
concern for these hooks and does not claim that all `FormData` use is invalid. Previous real-n8n
smokes exercised read operations and triggers, not upload or replacement. During this batch, the
orchestrator ran the original packed 0.1.2 package in n8n 2.30.6 against a local multipart fixture;
upload and replacement both passed with exact bytes, UTF-8 filename, thumbnail, authentication,
boolean and text fields, and normalized output. That comparison shows this is compatibility cleanup
for the review concern rather than a reproduced runtime defect. The new packed candidate passed the
same n8n 2.30.6 smoke, including exact bytes, UTF-8 filename and MIME metadata, thumbnail,
authentication, false/true booleans, optional fields, replacement path/method/dimensions, and
normalized output. Both runs used a local multipart HTTP parser fixture; neither is a real EmDash
host test or a claim of human review approval.

## Verification

Run with Node 24.18.0 and repository npm 11.16.0 (the cached npm 11.19.0 CLI was also identified):

- `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm run build` passed.
- Focused multipart/action/trigger tests passed 299/299. The in-sandbox full suite passed 338 tests;
  its seven release-tag tests could not spawn sandboxed `git` and failed with `EPERM`, before the
  existing assertions ran. The orchestrator reran the full suite outside that restriction and all
  345 tests in 12 files passed.
- `npm run scan:source` passed the pinned official scanner 0.38.0 for source and built output.
- `npm run package:check` passed with 397 files, 102,632 packed bytes, and 712,483 unpacked bytes.
- `npm run smoke:load` loaded two nodes and two wired credential types.
- `npm run smoke:install` could not spawn sandboxed `npm` and stopped with `EPERM`; the
  orchestrator's approved outside-sandbox rerun passed, loading two compiled nodes and two wired
  credential types in an isolated consumer.
- The fresh candidate tarball used for the n8n 2.30.6 multipart smoke had SHA-1
  `6367cceb7bb059442e406ce95fa2bf8bbc5f60be` and the package boundary above.
- `git diff --check` passed, and the changed-file review found only the assigned allowlist plus the
  two alias-dependent contract tests explicitly added by the orchestrator.

The packed n8n smoke discovered existing services on ports 5690/5691 and left them untouched. Its
run-owned CLI broker used port 5695, and all run-owned fixture and CLI processes were stopped after
the checks. The orchestrator reviewed the source diff and compiled exports; only `Emdash` and
`EmdashTrigger` remain as node constructor exports.

No dependency, public UI, release, package version, or external state change is included.
