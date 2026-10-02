# Comment placeholder cleanup handoff

## Scope and behavior

This batch removes the empty `get.ts`, `delete.ts`, and `getCounts.ts` comment property modules and
their imports and empty spreads from the comment resource index. Each deleted module exported only an
empty `INodeProperties[]` and supplied no controls, routing, validation, or output behavior.

The Get, Delete, and Get Counts operations remain declarative in `comment/index.ts`, including their
existing names, values, HTTP methods, URLs, and response unwrapping. The shared
`commentIdProperty` remains in the description and continues to provide the required comment ID
control and operation visibility for Get, Delete, and Update Status. No public operation, parameter,
credential, dependency, API route, or release behavior changes.

## Verification

Validation used Node 24.18.0 and the existing repository installation:

- `npm test -- --run tests/emdash.test.ts tests/operation-contract.test.ts` passed 267 tests in two
  files, including comment operation routing, output unwrapping, required IDs, and control visibility.
- `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm run build` passed.
- The clean build produced only `bulkAction`, `getAll`, `index`, and `updateStatus` artifacts in the
  compiled comment directory; no stale Get, Delete, or Get Counts placeholder artifacts remained.
- `npm run scan:source` passed the pinned official scanner against source and built JavaScript.
- `npm run package:check` passed with 388 files, 102,324 packed bytes, and 710,680 unpacked bytes.
  Compared with the preceding 397-file package, the expected nine compiled placeholder artifacts
  were removed.
- `npm run smoke:load` loaded two compiled nodes and two wired credential types.

This is source, contract, build, scanner, package-boundary, and registration evidence. It does not add
new runtime or live EmDash evidence because request construction and public behavior are unchanged.
