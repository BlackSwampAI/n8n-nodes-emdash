# Changelog

## 0.1.3

### Changed

- Retained only the filename-matching `Emdash` and `EmdashTrigger` constructor exports used by n8n's
  directory loader, removing redundant constructor aliases without changing node identifiers or
  package registration paths.
- Replaced native runtime `FormData` and `Blob` construction in upload hooks with a dependency-free
  multipart `Buffer` and explicit boundary. This is a compatibility cleanup: the original 0.1.2
  upload and replacement paths also worked in the tested n8n runtime fixture.
- Removed 32 empty operation property modules and their no-op index spreads. The declarative
  operations, editor controls, routing, hooks, shared parameters, and API behavior remain assembled
  in the resource indexes and shared descriptions.
- Restored CI workflow registration support with a safe manual CI dispatch and documented the
  one-time npm bootstrap sequence needed after repository and package restoration. Publication
  remains tag-only with reviewed-main and immutable annotated-tag guards.

## 0.1.2

### Changed

- Adopted the reviewed n8n community-node template 2.2.0 development launcher and optional,
  read-only post-release Discord notification job without changing dependencies or runtime node
  behavior.
- Set the EmDash action and trigger metadata to the shared description **Work with EmDash content,
  media, and events**. This keeps n8n's built-in paired-node grouping while making its grouped-card
  description accurate for both roles. Both original node types retain their identifiers, canvas
  names, operations, events, visibility, and behavior.

## 0.1.1

### Changed

- Updated the EmDash action and trigger codex categories to the supported **Marketing & Content**
  category required by the current n8n community-package scanner.
- Updated the pinned official n8n community-package scanner to 0.38.0.

## 0.1.0

### Added

- Complete community node integration for EmDash CMS with 103 action operations across 11 core resources:
  - **Comment** (6 operations): Get Many, Get Counts, Get, Update Status, Bulk Action, Delete.
  - **Content** (22 operations): Get Many, Get, Create, Update, Delete (soft), Permanent Delete, Restore, Get Trashed, Publish, Unpublish, Schedule, Unschedule, Duplicate, Compare, Discard Draft, Get Translations, Get Authors, Get Lock, Acquire Lock, Release Lock, Get Content Terms, Set Content Terms.
  - **Media** (15 operations): Get Many, Get, Upload (binary), Update, Delete, Get Usage, Replace Image, Get Upload Target (staged), Upload Pending, Confirm Upload, Get All Folders, Get Folder, Create Folder, Update Folder, Delete Folder.
  - **Menu** (9 operations): Get Many, Get, Create, Update, Delete, Create Item, Update Item, Delete Item, Reorder Items.
  - **Redirect** (9 operations): Get All Redirects, Get Redirect, Create Redirect, Update Redirect, Delete Redirect, Get 404 Entries, Get 404 Summary, Prune 404 Log, Clear 404 Log.
  - **Schema** (12 operations): Get Collections, Get Collection, Create Collection, Update Collection, Delete Collection, Reorder Collections, Get Fields, Get Field, Create Field, Update Field, Delete Field, Reorder Fields.
  - **Search** (5 operations): Search, Suggest, Get Stats, Enable Search, Rebuild Index.
  - **Section** (5 operations): Get Many, Get, Create, Update, Delete.
  - **Settings** (2 operations): Get, Update.
  - **Taxonomy** (10 operations): Get All Taxonomies, Get Taxonomy, Update Taxonomy, Delete Taxonomy, Get All Terms, Get Term, Create Term, Update Term, Delete Term, Reorder Terms.
  - **Widget Area** (8 operations): Get Many, Get, Create, Delete, Create Widget, Update Widget, Delete Widget, Reorder Widgets.
- Standalone **EmDash Trigger** node supporting real-time webhook events (`content:create`, `content:update`, `content:delete`, `media:upload`) with Bearer token authentication.
- Comprehensive credential support for **EmDash API** (Personal Access Token) and **EmDash Webhook** (shared secret).
- Declarative routing with `preSend` validation hooks, `postReceive` envelope unwrapping, cursor pagination, and optimistic concurrency (`_rev`) support.
- Interactive dynamic resource locators (`listSearch`) with manual fallback (`By Slug` / `By ID`) for write-only token environments.

### Changed

- Differentiated the EmDash action and trigger registrations and aligned their scoped n8n metadata.
- Exposed comment status as a direct operation control and grouped applicable content locale controls
  under options for a clearer editor experience.
- Added a fail-closed publish guard requiring the annotated version tag to resolve to the checked-out
  commit and remain in reviewed `origin/main` history.
