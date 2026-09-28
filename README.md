# n8n-nodes-emdash

Consume and manage content, media, taxonomies, search, and URL redirects from EmDash CMS in n8n workflows.

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
- **Taxonomy operations**: Read queries (`GET`) require `content:read`. Bulk tagging requires `content:write`. Schema mutations and term management require `taxonomies:manage` (implicitly granted by `content:write` or `admin`). (EmDash does not define `taxonomy:read` or `taxonomy:write` scopes).
- **Search operations**: Queries and prefix suggestions require `content:read`. Administrative operations (rebuilding an index or enabling search on a collection) require `admin`. (EmDash does not define `search:read` or `search:admin` scopes).
- **Redirect operations**: Neither `redirects:read` nor `redirects:write` exists as a PAT scope. All redirect rules and 404 access log operations require `admin` due to fail-closed middleware scope enforcement.

### EmDash Webhook Credential

For incoming event webhooks handled by the **EmDash Trigger** node:

1. In n8n, create an **EmDash Webhook** credential.
2. **Secret Token**: Enter a shared secret token configured in your EmDash instance's Webhook Notifier settings.

## Operations

The EmDash community node provides 51 operations across 5 core resources:

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

### Search (5 operations)

- **Search** (`search`): Full-text search across indexed content with cursor pagination, collections filter, locale, status, and scope (`all` or `title`).
- **Suggest** (`suggest`): Autocompletion prefix suggestions with collection and locale filters.
- **Get Stats** (`getStats`): Retrieve search index statistics and document counts.
- **Rebuild Index** (`rebuildIndex`): Trigger a search index rebuild for a specific collection.
- **Enable / Configure Search** (`enableSearch`): Configure SQLite FTS5 search indexing for a collection, including tokenizer strategies (`porter unicode61`, `unicode61`, `trigram`) and column weight mapping.

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

## Trigger

The **EmDash Trigger** node (`emdashTrigger`) starts workflows automatically when content or media events occur in your EmDash CMS site.

### Supported Events

The trigger supports the 4 official events emitted by the EmDash Webhook Notifier plugin:

- **Content Created** (`content:create`): Fired when a draft content entry is created.
- **Content Updated** (`content:update`): Fired when an existing content entry is modified or saved.
- **Content Deleted** (`content:delete`): Fired when a content entry is soft-deleted to trash.
- **Media Uploaded** (`media:upload`): Fired when a media file is uploaded to the media library.

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
