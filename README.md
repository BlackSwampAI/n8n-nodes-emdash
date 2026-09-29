# n8n-nodes-emdash

Consume and manage content, media, menus, taxonomies, search, URL redirects, comments, settings, sections, and widget areas from EmDash CMS in n8n workflows.

> This is an independent Black Swamp AI community integration. It is not affiliated with, endorsed by, sponsored by, or maintained by EmDash or Cloudflare Inc. Product names and marks belong to their respective owners and are used only to identify compatibility.

[Installation](#installation) · [Compatibility](#compatibility) · [Credentials](#credentials) · [Operations](#operations) · [Trigger](#trigger) · [Usage](#usage) · [Troubleshooting](#troubleshooting) · [Resources](#resources) · [Black Swamp AI](https://blackswampai.com/n8n-nodes/emdash/)

## Installation

On self-hosted n8n instances, install this community node through the n8n web interface:

1. Open **Settings → Community Nodes** in your n8n workspace.
2. Select **Install a community node**.
3. Enter `@blackswampai/n8n-nodes-emdash` in the **npm package name** field.
4. Agree to the risks of installing third-party code and select **Install**.

For additional guidance on managing community nodes, see the [n8n Community Nodes installation documentation](https://docs.n8n.io/integrations/community-nodes/installation-and-management/gui-installation/).

## Compatibility

| Surface             | Tested baseline    | Notes                                    |
| ------------------- | ------------------ | ---------------------------------------- |
| n8n                 | 1.82.0+            | Standard declarative routing and hooks   |
| EmDash CMS          | v1 (emdash@1.0.1+) | Cloudflare Workers REST API endpoint     |
| Node.js development | 22.22.0 and 24     | CI and package checks run on both lanes. |

## Credentials

To authenticate with your EmDash instance:

### EmDash API Credential

1. In n8n, create an **EmDash API** credential.
2. **Site URL**: Enter the root URL of your EmDash installation (for example, `https://cms.example.com`). The node automatically normalizes trailing slashes and routes requests through the `/_emdash/api` endpoint prefix.
3. **API Token**: Enter a Personal Access Token (PAT) generated in your EmDash administrative panel.

#### Personal Access Token Scopes and RBAC

EmDash 1.0.1 defines the following valid PAT scopes: `content:read`, `content:write`, `media:read`, `media:write`, `schema:read`, `schema:write`, `taxonomies:manage`, `menus:manage`, `settings:read`, `settings:manage`, `mcp:tools`, `transfer:export`, `transfer:analyze`, `transfer:execute`, and `admin`.

Effective authorization requires both the PAT scope and the user's underlying RBAC role. Scopes required by resource:

- **Content operations**: Read queries (`GET`) require `content:read`. Write and mutation operations (including creation, updates, publish, unpublish, schedule, unschedule, duplicate, restore, and permanent delete) require `content:write`. (EmDash does not use a separate `content:publish` scope).
- **Media operations**: Read queries (`GET`) require `media:read`. Mutations (binary uploads, metadata updates, folder creation, folder rename, and file/folder deletion) require `media:write`.
- **Menu operations**:
  - **PAT scopes**: Read queries (`GET`) require `content:read`. Write and mutation operations (`POST`, `PUT`, `DELETE`) require `menus:manage` (which is also implicitly granted by `content:write` or `admin`). EmDash does NOT define `menus:read`, `menu:read`, or `menu:write` as Personal Access Token scopes.
  - **RBAC permissions**: The authenticated user must separately possess the `menus:read` capability for reads, and `menus:manage` capability (Editor or Administrator role) for mutations.
- **Taxonomy operations**: Read queries (`GET`) require `content:read`. Bulk tagging requires `content:write`. Schema mutations and term management require `taxonomies:manage` (implicitly granted by `content:write` or `admin`). (EmDash does not define `taxonomy:read` or `taxonomy:write` scopes).
- **Search operations**: Queries and prefix suggestions require `content:read`. Administrative operations (rebuilding an index or enabling search on a collection) require `admin`. (EmDash does not define `search:read` or `search:admin` scopes).
- **Redirect operations**: Neither `redirects:read` nor `redirects:write` exists as a PAT scope. All redirect rules and 404 access log operations require `admin` due to fail-closed middleware scope enforcement.
- **Comment moderation operations**: EmDash does not define granular `comments:*` PAT scopes (such as `comments:read` or `comments:moderate`). All comment moderation endpoints live under `/_emdash/api/admin/comments` and strictly require a Personal Access Token with the `admin` scope in combination with administrative RBAC permissions.
- **Settings operations**:
  - **PAT scopes**: Read queries (`GET`) require `settings:read` (or `admin`). Update operations (`POST`) require `settings:manage` (or `admin`).
  - **RBAC permissions**: The authenticated user must separately possess the `settings:read` capability for reads, and `settings:manage` capability (Administrator role) for updates.
- **Section operations**:
  - **PAT scopes**: Read queries (`GET`) require `content:read`. Write and mutation operations (`POST`, `PUT`, `DELETE`) require `content:write` (or `admin`). EmDash does not define separate `sections:*` PAT scopes.
  - **RBAC permissions**: The authenticated user must separately possess the `sections:read` capability for reads, and `sections:manage` capability (Editor or Administrator role) for mutations.
- **Widget Area operations**:
  - **PAT scopes**: Read queries (`GET`) require `content:read`. Write and mutation operations (`POST`, `PUT`, `DELETE`) require `content:write` (or `admin`). EmDash does not define separate `widgets:*` PAT scopes.
  - **RBAC permissions**: The authenticated user must separately possess the `widgets:read` capability for reads, and `widgets:manage` capability (Editor or Administrator role) for mutations.

### EmDash Webhook Credential

For incoming event webhooks handled by the **EmDash Trigger** node:

1. In n8n, create an **EmDash Webhook** credential.
2. **Secret Token**: Enter a shared secret token configured in your EmDash instance's Webhook Notifier settings.

## Operations

The EmDash community node provides 81 operations across 10 core resources:

### Comment (6 operations)

- **Get Many** (`getAll`): Retrieve comments with cursor pagination and status, collection, and search filters.
- **Get Counts** (`getCounts`): Retrieve comment counts grouped by moderation status (`pending`, `approved`, `spam`, `trash`).
- **Get** (`get`): Retrieve a single comment by ID including author metadata, IP hash, and status.
- **Update Status** (`updateStatus`): Update the moderation status of a comment (`approved`, `pending`, `spam`, `trash`).
- **Bulk Action** (`bulkAction`): Apply moderation action (`approve`, `spam`, `trash`) or permanently delete up to 100 comments in a single request.
- **Delete** (`delete`): Permanently delete a comment by ID (irreversible).

### Content (16 operations)

- **Get Many** (`getAll`): Retrieve entries in a collection with cursor pagination, publication status filtering, and date ranges.
- **Get** (`get`): Retrieve a single content item by ID or URL slug.
- **Create** (`create`): Create a draft content entry with JSON data, SEO metadata, locale, and taxonomy terms.
- **Update** (`update`): Mutate existing content with optimistic concurrency control (`_rev`).
- **Delete** (`delete`): Soft delete an entry to trash.
- **Publish** (`publish`): Promote draft changes to live version.
- **Unpublish** (`unpublish`): Revert published live entry to draft.
- **Schedule** (`schedule`): Set a future publication timestamp.
- **Unschedule** (`unschedule`): Cancel scheduled publication.
- **Duplicate** (`duplicate`): Clone an existing entry into a new draft.
- **Restore** (`restore`): Restore a trashed entry.
- **Permanently Delete** (`permanentDelete`): Hard delete a trashed entry.
- **Compare Draft and Live** (`compare`): Diff draft changes against the live version.
- **Discard Draft** (`discardDraft`): Discard pending draft edits and revert to live version.
- **Get Content Terms** (`getContentTerms`): Retrieve taxonomy terms assigned to an entry.
- **Set Content Terms** (`setContentTerms`): Replace taxonomy term assignments on an entry.

### Media (11 operations)

- **Get Many** (`getAll`): List media files with cursor pagination and folder filtering.
- **Get** (`get`): Get metadata for a media file by ID.
- **Upload** (`upload`): Upload binary files directly via multipart form data.
- **Update Metadata** (`update`): Update media title, alt text, caption, focal points, dimensions, or folder.
- **Delete** (`delete`): Delete a media record and associated storage file.
- **Get Usage** (`getUsage`): Retrieve content entries referencing a media file.
- **Get Many Folders** (`getAllFolders`): List media folders.
- **Get Folder** (`getFolder`): Get single media folder metadata by ID.
- **Create Folder** (`createFolder`): Create a new folder to organize media assets.
- **Update Folder** (`updateFolder`): Update media folder name.
- **Delete Folder** (`deleteFolder`): Delete a media folder (unfiles referencing media items by setting `folder_id` to null; does not require the folder to be empty).

### Menu (9 operations)

- **Get Many** (`getAll`): Retrieve all navigation menus with optional locale filtering.
- **Get** (`get`): Retrieve a single menu and its navigation item hierarchy by menu name with optional locale filtering.
- **Create** (`create`): Create a new navigation menu with name and label; optionally configure target locale or translate an existing menu (`translationOf`).
- **Update** (`update`): Update a menu label with optional locale filtering.
- **Delete** (`delete`): Permanently delete a menu and all its navigation items for the targeted menu and locale (does not delete referenced content).
- **Create Item** (`createItem`): Add a navigation item to a menu (`custom`, `page`, `post`, `taxonomy`, or `collection`) with optional parent, ordering, target, and styling.
- **Update Item** (`updateItem`): Update navigation item label, URL, target, attributes, parent, or sort order (supports explicit null to move items to root).
- **Delete Item** (`deleteItem`): Remove a navigation item from a menu (does not delete referenced content).
- **Reorder Items** (`reorderItems`): Atomically update menu hierarchy and sibling ordering via an array of item IDs, parent references, and sort positions.

### Redirect (9 operations)

- **Get Many** (`getAllRedirects`): List URL redirect rules with cursor pagination and search, group, enabled, auto filters.
- **Get** (`getRedirect`): Retrieve redirect rule by ID.
- **Create** (`createRedirect`): Create a redirect rule (`301`, `302`, `307`, `308`, `410`, `451`).
- **Update** (`updateRedirect`): Update redirect rule source, destination, status code, enabled state, or group.
- **Delete** (`deleteRedirect`): Delete a redirect rule by ID.
- **Get 404 Entries** (`get404Entries`): Retrieve recorded 404 Not Found error entries with cursor pagination and search filter.
- **Get 404 Summary** (`get404Summary`): Retrieve aggregation summary of top 404 error paths.
- **Prune 404 Log** (`prune404Log`): Delete 404 error log entries older than an ISO 8601 datetime threshold.
- **Clear All 404 Entries** (`clear404Log`): Destructively delete all recorded 404 log entries.

### Search (5 operations)

- **Search** (`search`): Full-text search across indexed content with cursor pagination, collections filter, locale, status, and scope (`all` or `title`).
- **Suggest** (`suggest`): Autocompletion prefix suggestions with collection and locale filters.
- **Get Stats** (`getStats`): Retrieve search index statistics and document counts.
- **Rebuild Index** (`rebuildIndex`): Trigger a search index rebuild for a specific collection.
- **Enable / Configure Search** (`enableSearch`): Configure SQLite FTS5 search indexing for a collection, including tokenizer strategies (`porter unicode61`, `unicode61`, `trigram`) and column weight mapping.

### Section (5 operations)

- **Get Many** (`getAll`): Retrieve sections with cursor pagination and optional source (`theme`, `user`, `import`) or search filters.
- **Get** (`get`): Retrieve a single section by slug.
- **Create** (`create`): Create a new section with slug, title, structured JSON content, and optional description, keywords, preview media ID, source (`user` or `import`), or theme ID.
- **Update** (`update`): Update section slug, title, description, keywords, structured JSON content, or preview media ID (pass null or empty string to clear preview media).
- **Delete** (`delete`): Delete a custom or imported section (theme-defined sections are protected and cannot be deleted).

### Settings (2 operations)

- **Get** (`get`): Retrieve current site settings object directly from the CMS without static schema constraints.
- **Update** (`update`): Update site settings with a validated JSON object or expression via `POST /settings` (merges updates with existing settings; unspecified settings remain unchanged).

### Taxonomy (10 operations)

- **Get Many** (`getAllTaxonomies`): List all registered taxonomies.
- **Get** (`getTaxonomy`): Retrieve taxonomy schema and metadata.
- **Update** (`updateTaxonomy`): Update taxonomy schema (`label`, `labelSingular`, `hierarchical`, `collections`).
- **Delete** (`deleteTaxonomy`): Delete taxonomy definition and its terms.
- **Get Many Terms** (`getAllTerms`): List terms within a taxonomy.
- **Get Term** (`getTerm`): Retrieve single taxonomy term by slug.
- **Create Term** (`createTerm`): Create a new term with label, slug, description, parent, and locale.
- **Update Term** (`updateTerm`): Update an existing term by slug.
- **Delete Term** (`deleteTerm`): Delete a term from a taxonomy.
- **Reorder Terms** (`reorderTerms`): Update display ordering of taxonomy terms (`POST /taxonomies/{name}/reorder`).

### Widget Area (8 operations)

- **Get Many** (`getAll`): Retrieve all registered widget areas with their widgets.
- **Get** (`get`): Retrieve a widget area by name including its ordered widgets.
- **Create** (`create`): Register a new custom widget area with name, label, and optional description.
- **Delete** (`delete`): Delete a widget area (cascades deletion to all contained widgets).
- **Create Widget** (`createWidget`): Add a widget (`content` with structured content blocks, `menu` with menu name, or `component` with component ID and JSON properties) to a widget area.
- **Update Widget** (`updateWidget`): Update widget type, title, content blocks, menu name, component ID, or component properties.
- **Delete Widget** (`deleteWidget`): Remove a widget from a widget area (does not delete referenced content, menus, or components).
- **Reorder Widgets** (`reorderWidgets`): Update display ordering of widgets in an area using an ordered array of widget IDs.

## Trigger

The **EmDash Trigger** node (`emdashTrigger`) starts workflows automatically when content or media events occur in your EmDash CMS site.

### Supported Events

The trigger supports the 4 official events emitted by the EmDash Webhook Notifier plugin:

- **Content Created** (`content:create`): Fired when a draft content entry is created.
- **Content Updated** (`content:update`): Fired when an existing content entry is modified or saved.
- **Content Deleted** (`content:delete`): Fired when an entry is moved to Trash or permanently deleted; the current notifier does not distinguish between the two.
- **Media Uploaded** (`media:upload`): Fired when a media file is uploaded to the media library.

### Event Payload Structure

Webhooks deliver a JSON object envelope containing the following fields:

- `event` (string, required): One of `content:create`, `content:update`, `content:delete`, `media:upload`.
- `timestamp` (string, required): ISO 8601 UTC timestamp of event dispatch.
- `resourceId` (string, required): Unique identifier of the created, mutated, or deleted resource.
- `resourceType` (string, required): Resource category (`content` for content events, `media` for media events).
- `collection` (string, required for content events): Target collection slug (e.g. `posts`, `pages`).
- `data` (object, optional): Resource data payload. Inclusion is controlled by the EmDash notifier plugin setting `Include Content Data`. When enabled for content events, `data` contains the collection's custom content fields (`event.content.data`); system fields like `slug`, `status`, and `draftRevisionId` reside in `metadata`. When enabled for media upload events, `data` contains media metadata (`filename`, `mimeType`, `size`). When disabled, this field is omitted.
- `metadata` (object, optional): System metadata about the event. For content events, contains `{ slug, status, draftRevisionId }`.

Example content payload:

```json
{
	"event": "content:create",
	"timestamp": "2026-09-28T20:00:00.000Z",
	"resourceId": "post_clx00123abc",
	"resourceType": "content",
	"collection": "posts",
	"data": {
		"title": "Announcing Product Launch",
		"summary": "We are excited to share our latest release."
	},
	"metadata": {
		"slug": "announcing-product-launch",
		"status": "draft",
		"draftRevisionId": "rev_01jk45mno"
	}
}
```

Example media payload:

```json
{
	"event": "media:upload",
	"timestamp": "2026-09-28T20:01:00.000Z",
	"resourceId": "med_clx00456def",
	"resourceType": "media",
	"data": {
		"filename": "hero-banner.jpg",
		"mimeType": "image/jpeg",
		"size": 245120
	}
}
```

### Setup Guide

1. **Install Webhook Notifier plugin**: In your EmDash CMS installation, install and enable `@emdash-cms/plugin-webhook-notifier` (version 0.2.2 or higher).
2. **Create EmDash Webhook credential**: In n8n, create an **EmDash Webhook** credential and configure a strong **Secret Token**.
3. **Copy Webhook URL**: In n8n, open your EmDash Trigger node and copy the generated Webhook URL.
4. **Configure EmDash settings**: In your EmDash administrative panel under Webhook Notifier settings:
   - Paste the n8n Webhook URL into the **Webhook URL** field.
   - Paste the Secret Token into the **Secret Token** field. The notifier sends this in the `Authorization: Bearer <secretToken>` header with every dispatch.
   - Configure whether to include entry data payloads (`Include Content Data`).
5. **Configure filters in n8n**:
   - **Events**: Select **All Events** (`*`) or choose specific events (`content:create`, `content:update`, `content:delete`, `media:upload`).
   - **Collection Filter**: Optionally enter a comma-separated list of collection slugs (e.g. `posts, pages`) to restrict workflow execution to specific content types. Media upload events are not filtered by collection.

### Single-Webhook Limitation

The EmDash Webhook Notifier plugin currently stores a single destination webhook URL per site installation. If multiple distinct workflows or downstream systems need to react to different CMS events, point EmDash to one primary n8n trigger workflow and use n8n branching or routing nodes (such as the **Switch** node or **Router**) to dispatch to sub-workflows.

### Test URL vs Production URL

When building and testing workflows in the n8n canvas:

- Use the **Test URL** during workflow construction. EmDash webhooks will be routed to your open canvas execution session.
- When activating the workflow for continuous operation, copy the **Production URL** and update the Webhook Notifier settings in your EmDash instance. Workflows will only trigger in the background when active and configured with the Production URL.

## Usage

### Declarative architecture

This integration relies on declarative routing throughout the node definition. Binary uploads use `preSend` hooks to construct multipart form payloads directly in memory, and response envelopes use `postReceive` hooks to unwrap API payloads. Any irregular or nested API structures (such as generic "weird JSON" payloads) are addressed declaratively with JMESPath or parameter expressions rather than requiring programmatic execution.

### Dynamic collection discovery

Collection, folder, and taxonomy fields use n8n resource locators. You can select items interactively from a live EmDash instance or toggle to manual mode to provide dynamic expressions or IDs from upstream workflow nodes.

### Cursor pagination

List operations support EmDash opaque cursor pagination. Set **Return All** to `true` to fetch all available records automatically, or disable it and specify a custom **Limit**.

### Concurrency control

EmDash employs optimistic locking for draft updates and publication actions. Content operations return a revision token (`_rev`). When performing automated updates, pass the current `_rev` to avoid conflicting with concurrent editor changes.

### Comment moderation and privacy

Comment records returned by moderation endpoints contain commenter personal information, including author email (`authorEmail`) and cryptographic IP hash (`ipHash`). Workflows that process or forward comment outputs to notification channels, logs, or external systems should handle and redact these fields appropriately in accordance with organizational privacy standards.

### Automated comment moderation workflows

The `@emdash-cms/plugin-webhook-notifier` plugin does not currently emit webhook events for comment submission or status transitions. To automate comment moderation workflows (such as AI content analysis, automated spam detection, or alerts), configure an n8n workflow using the **Schedule Trigger** node to periodically poll **Comment → Get Many** filtered by `status: pending`.

### Menu management and hierarchy semantics

The Menu resource enables full lifecycle management of EmDash navigation structures, supporting multi-level hierarchies, localized menu variants, and referenced or custom navigation links:

- **Token scope and RBAC**: EmDash enforces two distinct authorization layers:
  - **Personal Access Token (PAT) Scopes**:
    - Menu reads (`GET`): requires `content:read`
    - Menu writes (`POST`, `PUT`, `DELETE`): requires `menus:manage` (or `content:write`, which implicitly grants `menus:manage`, or `admin`)
    - _Caution_: Do NOT configure invented PAT scopes such as `menus:read`, `menu:read`, or `menu:write` — they do not exist in EmDash's token system.
  - **Underlying User RBAC Permissions**:
    - Menu reads: user must have `menus:read` role capability
    - Menu writes: user must have `menus:manage` role capability (Editor or Administrator)
- **Menu translations**: When creating a translated menu variant, configure `translationOf` with the canonical menu ID and specify the target `locale` code. The menu `name` must match the canonical menu name. EmDash clones existing navigation items into the new menu and joins it to the canonical translation group.
- **Custom URL safety**: Navigation items configured with `type: custom` validate URLs through EmDash's upstream `safeHref` sanitizer. Permitted URL schemes include `http`, `https`, `mailto`, `tel`, relative web paths (`/about`), and fragment identifiers (`#contact`). Potentially unsafe protocols (such as `javascript:` or `data:`) are rejected.
- **Referenced content semantics**: Navigation items linking to CMS entries (`page`, `post`, `taxonomy`, or `collection`) require `referenceCollection` (the target collection slug) and `referenceId`. In EmDash, `referenceId` corresponds to the translation-group identifier of the referenced content rather than an individual revision ID, allowing navigation links to resolve to the appropriate language variant automatically.
- **Hierarchy and ordering**: The `reorderItems` operation accepts a JSON or native expression list of `{ id, parentId, sortOrder }` objects. Setting `parentId` to a sibling item ID creates nested sub-menus, while `null` positions items at the root level. `sortOrder` defines a zero-based integer display sequence among siblings. When updating single items via `updateItem`, passing an empty string or literal `"null"` moves an item back to the root level, whereas omitting `parentId` preserves existing hierarchy.
- **Menu webhooks**: The `@emdash-cms/plugin-webhook-notifier` plugin does not emit webhook events for menu updates or reordering. Workflows responding to navigation changes should be scheduled periodically or sequenced downstream of content publishing flows.

### Example: Automated campaign navigation update

A common content automation scenario involves publishing a promotional landing page and immediately integrating it into the site navigation menu:

1. **Trigger on Publish**: An **EmDash Trigger** or **Schedule Trigger** detects a newly published landing page in the `pages` collection (e.g. `translationGroupId: "grp_summer_sale"`).
2. **Add Navigation Item**: An **EmDash** node executes **Menu → Create Item**:
   - **Menu**: `main-navigation`
   - **Type**: `Page`
   - **Label**: `Summer Sale`
   - **Reference Collection**: `pages`
   - **Reference ID**: `={{ $json.translationGroupId }}`
   - **Additional Fields → Target**: `_self`
3. **Reorder Menu**: A subsequent **EmDash** node executes **Menu → Reorder Items** to place the new campaign link prominently at the front of the top-level navigation (`sortOrder: 0`).

### Settings Management

The Settings resource provides direct access to site-wide configuration stored in EmDash CMS:

- **Get Settings** (`get`): Fetches the full settings object. The response envelope is automatically unwrapped to return the raw settings data.
- **Update Settings** (`update`): Updates site settings by sending a validated JSON payload via `POST /settings`.
- **Merge semantics**: EmDash merges submitted settings with existing configuration; unspecified fields remain untouched, so workflows can submit partial settings objects containing only the targeted updates.
- **Dynamic JSON input and schema behavior**: The n8n node parameter accepts a flexible JSON object or expression for forward compatibility. Note that current upstream EmDash 1.0.1 parses update payloads with a finite Zod schema (`settingsUpdateBody`) that strips unknown properties; arbitrary custom keys are not persisted by EmDash 1.0.1, though future CMS releases may accept additional fields without requiring node UI changes.
- **Best practices**: While partial updates do not overwrite omitted settings, calling **Get Settings** first can be useful when reviewing current values or computing dynamic property updates. Backups or exporting settings prior to broad configuration changes are always recommended.
- **Authentication and permissions**:
  - **Personal Access Token (PAT) Scopes**: Reading settings via `Get` requires `settings:read` (or `admin`). Modifying settings via `Update` requires `settings:manage` (or `admin`).
  - **RBAC Capabilities**: The authenticated user account must possess the corresponding internal RBAC permission (`settings:read` capability for reads; `settings:manage` capability, typical of the Administrator role, for updates).

### Section Management

The Section resource provides full lifecycle management of reusable template and layout sections within EmDash CMS:

- **Structured Content Blocks**: Section content is structured JSON representing component and layout blocks (such as block definitions, settings, and nested layouts). The node validates content via `validateStructuredContent` before dispatch to ensure a valid JSON object or array structure.
- **Source Constraints and Protection**: Sections can be created with source `user` or `import`. EmDash strictly rejects creating sections with `source: "theme"` (HTTP 400 Bad Request), as theme sections are defined in codebase templates. Furthermore, theme-defined sections are protected and cannot be deleted via the API (EmDash returns HTTP 403 Forbidden).
- **Preview Media Semantics**: The optional `previewMediaId` links a media library asset to the section to provide visual thumbnails in page and layout builders. In **Update Section**, passing an explicit `null` (or empty value) clears the existing preview media association.
- **Authentication and Permissions**:
  - **PAT Scopes**: Section reads (`GET`) require `content:read`. Section mutations (`POST`, `PUT`, `DELETE`) require `content:write` (or `admin`). EmDash does not define separate `sections:*` PAT scopes.
  - **RBAC Capabilities**: The authenticated user must separately possess the `sections:read` role capability for reads, and `sections:manage` capability (Editor or Administrator) for mutations.
- **Webhooks**: The `@emdash-cms/plugin-webhook-notifier` plugin does not emit webhook events for section modifications. Workflows managing sections should be scheduled or triggered downstream of content workflows.

### Widget Area and Widget Configuration

The Widget Area resource manages theme-registered and custom widget zones and the widgets placed inside them:

- **Widget Types**: Widgets support three distinct types:
  - `content`: Renders structured content blocks configured via the `content` JSON array.
  - `menu`: Renders an existing navigation menu specified by `menuName`.
  - `component`: Renders a site or theme component specified by `componentId`, with customizable options in `componentProps` JSON object.
- **Cascade Deletion**: Deleting a widget area (`DELETE /widget-areas/{name}`) permanently cascades deletion to all contained widgets in the database.
- **Widget Deletion Scope**: Deleting an individual widget (`DELETE /widget-areas/{name}/widgets/{id}`) removes the widget from the area without deleting the parent widget area, and without deleting referenced menus, components, or content items.
- **Widget Reordering**: The `reorderWidgets` operation accepts an ordered array of widget IDs (`widgetIds`), updating the display sequence of widgets within the area.
- **Timestamp Conventions**: Upstream EmDash `widgetAreaSchema` returns snake_case timestamps (`created_at` and `updated_at`), differing from the camelCase conventions used by content and comments.
- **Update Safety**: Upstream EmDash requires at least one field to update on `PUT /widget-areas/{name}/widgets/{id}`; omitting all update fields returns HTTP 400 ("No fields to update"). The node validates this preSend to avoid unnecessary network roundtrips.
- **Pagination**: The `GET /widget-areas` endpoint returns all registered widget areas in `{ items: [...] }` without cursor pagination.
- **Authentication and Permissions**:
  - **PAT Scopes**: Widget area reads (`GET`) require `content:read`. Widget area and widget mutations (`POST`, `PUT`, `DELETE`) require `content:write` (or `admin`). EmDash does not define separate `widgets:*` PAT scopes.
  - **RBAC Capabilities**: The authenticated user must separately possess the `widgets:read` role capability for reads, and `widgets:manage` capability (Editor or Administrator) for mutations.

## Troubleshooting

- **Token permissions**: Ensure your Personal Access Token includes the required scopes for the operations invoked. Operations that modify system settings (such as index rebuilds, search enablement, or redirect/404 management) require the `admin` scope.
- **Base URL and routing**: Enter the bare root URL of your EmDash installation (for example, `https://cms.example.com`). The node automatically normalizes trailing slashes and prefixes paths with `/_emdash/api`.
- **Concurrent edits**: If an update fails with an `ENTRY_LOCKED` or revision mismatch error, fetch the latest content item revision using **Get** to obtain the current `_rev` token before retrying.
- **Report defects**: File reproducible bug reports on [GitHub Issues](https://github.com/BlackSwampAI/n8n-nodes-emdash/issues) without including credentials or sensitive tokens.

## Resources

- [Black Swamp AI package page](https://blackswampai.com/n8n-nodes/emdash/)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [EmDash Documentation](https://github.com/emdash-cms/emdash#readme)
- [Changelog](CHANGELOG.md)
- [API Matrix](docs/api-matrix.md)
- [Testing Documentation](docs/testing.md)
- [Branding Guide](docs/branding.md)

## License

[MIT](LICENSE.md)
