# EmDash Integration Manual Release Test Plan

> **Historical:** This document describes package versions that included the now-removed EmDash webhook trigger. It is retained as an audit record only. Version 0.1.4 supports 103 EmDash REST actions; migrate existing trigger workflows to Schedule Trigger + EmDash actions or another independently supported event source.

This test plan provides a comprehensive quality-assurance checklist for testing **all 103 action operations** and the **EmDash Trigger** node against the local test lab before authorizing npm publication of `@blackswampai/n8n-nodes-emdash@0.1.0`.

> [!IMPORTANT]
> **Follow-up status on 2026-09-30:** automated package gates passed with 327 Vitest tests, and real
> isolated n8n 2.30.6 execution passed for one read operation across all 11 resources plus the trigger
> runtime cases summarized in `docs/testing.md`. This follow-up did **not** execute every operation in
> the 103-operation checklist. Browser-based picker, icon, and dynamic-dropdown checks remain pending,
> and no publication or Creator Portal verification occurred.

### Observed runtime subset

- Package discovery showed the scoped **EmDash** and **EmDash Trigger** registrations once each, plus
  n8n's generated **EmDash Tool**, with no custom-extension duplicates. Both icon routes returned 200
  with official asset bytes; visual rendering remains unchecked.
- Successful reads covered `comment.getCounts`, `content.getAll`, `media.getAll`, `menu.getAll`,
  `redirect.getAllRedirects`, `schema.getCollections`, `search.search`, `section.getAll`,
  `settings.get`, `taxonomy.getAllTaxonomies`, and `widgetArea.getAll`.
- Direct trigger requests covered 401 authentication rejection, 400 malformed payload rejection,
  event and collection filters ignored with 200 and no execution, valid delivery with downstream
  execution, restart persistence, deactivation with 404, all four wildcard event types, and media
  delivery unaffected by a content-only collection filter.
- n8n/Node used the first value when duplicate `Authorization` headers were sent. Invalid-first
  returned 401 without execution; valid-first returned 200 with execution. Raw duplicate headers were
  not rejected as duplicates.

### Pending release checks

- Complete the remaining action-operation checklist and record actual results; do not infer full
  103-operation runtime coverage from the representative reads.
- Perform the visual picker/icon and dynamic-dropdown checks in a browser.
- On the public droplet, attach the **EmDash Webhook** credential to the workflow, activate it, copy
  n8n's generated **HTTPS Production URL** into EmDash Webhook Notifier, and configure the same shared
  token in the credential and notifier. The full notifier-to-n8n delivery could not run locally because
  EmDash core SSRF protection blocks loopback even with the notifier development flag.
- Publication, published-package provenance/scanner checks, the GitHub release, and Creator Portal
  version/logo review remain pending explicit release authorization.

---

## 1. Test Environment Setup & Prerequisites

1. **Verify Services Running**:
   In terminal:

   ```bash
   /home/chris/Projects/emdash-n8n-manual-lab/status.sh
   ```

   Confirm both EmDash (`http://127.0.0.1:4321`) and n8n (`http://127.0.0.1:5680`) are **RUNNING (HTTP 200)**.
   If not running, start with `/home/chris/Projects/emdash-n8n-manual-lab/start.sh`.

2. **Open n8n Editor**:
   Navigate to [http://127.0.0.1:5680](http://127.0.0.1:5680) in your browser.

3. **Configure EmDash Credential**:
   - Go to **Credentials** -> **Add Credential** -> Search **EmDash API**.
   - **Credential Name**: `EmDash Local Lab`
   - **Site URL**: `http://127.0.0.1:4321`
   - **API Token**: `ec_pat_manual_test_lab_master_key`
   - Click **Save**.

   Create a separate **EmDash Webhook** credential named `EmDash Local Lab Webhook`, set its **Secret
   Token** to `emdash-manual-test-secret-2026`, and attach it to the **EmDash Trigger** node. The
   imported workflow does not embed a credential ID or secret.

4. **Review Pre-Imported Test Workflows**:
   In n8n, 4 sample workflows are already imported:
   - `01 - EmDash Trigger Verification`
   - `02 - EmDash Core Read Operations Smoke`
   - `03 - EmDash All 11 Resources Explorer`
   - `04 - EmDash Destructive Operations (MANUAL STEP-BY-STEP ONLY)`

   Before testing, search the node picker and verify exactly one **EmDash** action node and one
   differentiated **EmDash Trigger** node. The lab loads the installed Community Nodes package; a
   duplicate listing is a discovery failure and invalidates editor smoke evidence.

5. **Lab Reset / Fixture Restoration**:
   If any destructive operation removes an entity you wish to restore, simply run:
   ```bash
   /home/chris/Projects/emdash-n8n-manual-lab/reset.sh
   ```

---

## 2. Resource 1: Comment (6 Operations)

> [!NOTE]
> EmDash organizes comments into status-based moderation queues (`pending`, `approved`, `spam`, `trash`). In `comment.getAll`, `Status` is a top-level parameter immediately following `Limit` and defaults to `Pending`. To list approved comments, set `Status`: `Approved`.

|   #   | Operation              | Target Fixture / Parameters                               | Expected n8n Result                                                          | Safety / Notes                          |
| :---: | :--------------------- | :-------------------------------------------------------- | :--------------------------------------------------------------------------- | :-------------------------------------- |
| **1** | `comment.getAll`       | `Status`: `Approved` (defaults to `Pending`), `Limit`: 10 | Returns list of approved comments (e.g. `cmt_approved_001`, `cmt_reply_001`) | Read-only                               |
| **2** | `comment.get`          | `Comment ID`: `cmt_approved_001`                          | Returns single comment object with author, body, creation timestamp          | Read-only                               |
| **3** | `comment.getCounts`    | (None required)                                           | Returns counts per status (`approved`, `pending`, `spam`, `trash`)           | Read-only                               |
| **4** | `comment.updateStatus` | `Comment ID`: `cmt_pending_001`, `Status`: `approved`     | Comment status transitions to approved; returns updated comment              | Non-destructive update                  |
| **5** | `comment.bulkAction`   | `Action`: `spam`, `Comment IDs`: `["cmt_pending_001"]`    | Batch moderation status applied; returns success count                       | Non-destructive update                  |
| **6** | `comment.delete`       | `Comment ID`: `manual-delete-comment`                     | Permanently deletes comment; returns success payload                         | **Destructive** (use dedicated fixture) |

---

## 3. Resource 2: Content (22 Operations)

> [!NOTE]
> Localization parameters (`Locale`) across `content.get`, `content.acquireLock`, `content.getLock`, `content.releaseLock`, and `content.getTrashed` are organized inside the collapsible `Options` collection (`Options` -> `Locale`), keeping standard workflows clean while remaining fully available for multilingual sites.

|   #    | Operation                 | Target Fixture / Parameters                                                                                                                         | Expected n8n Result                                                    | Safety / Notes                          |
| :----: | :------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- | :-------------------------------------- |
| **7**  | `content.getAll`          | `Collection`: `posts`, `Return All`: `false`, `Limit`: 5                                                                                            | Returns 5 posts with field values, status, and metadata                | Read-only                               |
| **8**  | `content.get`             | `Collection`: `posts`, `Content ID`: `marblehead-light`                                                                                             | Returns detailed post record for Marblehead Light                      | Read-only                               |
| **9**  | `content.create`          | `Collection`: `posts`, `Data (JSON)`: `{"title": "Manual Test Post New", "excerpt": "Created via n8n"}`                                             | New post created with assigned ULID/ID; returns created record         | Creation test                           |
| **10** | `content.update`          | `Collection`: `posts`, `Content ID`: `manual-update-target`, `Data (JSON)`: `{"title": "Updated Manual Post Title"}`                                | Post updated; creates new revision; returns updated data               | Update test                             |
| **11** | `content.duplicate`       | `Collection`: `posts`, `Content ID`: `marblehead-light`                                                                                             | Clones post into draft copy with `(Copy)` suffix                       | Creation test                           |
| **12** | `content.compare`         | `Collection`: `posts`, `Content ID`: `manual-update-target`, `Revision A`: `rev_update_001`, `Revision B`: `rev_update_002`                         | Returns field-level diff between revisions                             | Read-only                               |
| **13** | `content.publish`         | `Collection`: `posts`, `Content ID`: `manual-unpublish-me`                                                                                          | Transitions draft to published status; sets `published_at`             | State transition                        |
| **14** | `content.unpublish`       | `Collection`: `posts`, `Content ID`: `manual-unpublish-me`                                                                                          | Transitions published entry back to draft; unsets `published_at`       | State transition                        |
| **15** | `content.schedule`        | `Collection`: `posts`, `Content ID`: `draft-deepwater-coregonid-surveys`, `Scheduled Date`: `2027-05-01T12:00:00Z`                                  | Schedules draft for future publication; sets `scheduled_at`            | State transition                        |
| **16** | `content.unschedule`      | `Collection`: `posts`, `Content ID`: `scheduled-spring-2027-survey`                                                                                 | Cancels scheduled publication; reverts to standard draft               | State transition                        |
| **17** | `content.trash`           | `Collection`: `posts`, `Content ID`: `manual-trash-me`                                                                                              | Moves post to trash; sets `deleted_at`; item hidden from normal list   | Soft-delete                             |
| **18** | `content.restore`         | `Collection`: `posts`, `Content ID`: `manual-restore-me`                                                                                            | Restores trashed item; clears `deleted_at`; returns restored post      | Restoration                             |
| **19** | `content.getTrashed`      | `Collection`: `posts`                                                                                                                               | Returns items with `deleted_at` set (e.g. `manual-restore-me`)         | Read-only                               |
| **20** | `content.discardDraft`    | `Collection`: `posts`, `Content ID`: `manual-update-target`                                                                                         | Discards uncommitted draft changes; reverts to live revision           | State revert                            |
| **21** | `content.acquireLock`     | `Collection`: `posts`, `Content ID`: `marblehead-light`                                                                                             | Takes collaborative editing lock on the post; returns lock token       | Lock test                               |
| **22** | `content.getLock`         | `Collection`: `posts`, `Content ID`: `marblehead-light`                                                                                             | Returns active lock information (user ID, expiration)                  | Read-only                               |
| **23** | `content.releaseLock`     | `Collection`: `posts`, `Content ID`: `marblehead-light`                                                                                             | Releases active editing lock; returns confirmation                     | Lock release                            |
| **24** | `content.getAuthors`      | `Collection`: `posts`, `Content ID`: `marblehead-light`                                                                                             | Returns authors/bylines associated with the post                       | Read-only                               |
| **25** | `content.getContentTerms` | `Collection`: `posts`, `Content ID`: `wreck-of-the-edmund-fitzgerald`, `Taxonomy`: `categories`                                                     | Returns taxonomy terms assigned to post                                | Read-only                               |
| **26** | `content.setContentTerms` | `Collection`: `posts`, `Content ID`: `wreck-of-the-edmund-fitzgerald`, `Taxonomy`: `categories`, `Term Slugs`: `["maritime-history", "shipwrecks"]` | Assigns terms; returns updated relationship set                        | Relationship update                     |
| **27** | `content.getTranslations` | `Collection`: `posts`, `Content ID`: `great-lakes-overview-en`                                                                                      | Returns translation variants in the group (includes Spanish `es` post) | Read-only                               |
| **28** | `content.delete`          | `Collection`: `posts`, `Content ID`: `manual-delete-me-draft`                                                                                       | Permanently deletes entry from `ec_posts` (permanent delete)           | **Destructive** (use dedicated fixture) |

---

## 4. Resource 3: Media (15 Operations)

|   #    | Operation               | Target Fixture / Parameters                                                                                        | Expected n8n Result                                                                   | Safety / Notes                             |
| :----: | :---------------------- | :----------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ | :----------------------------------------- |
| **29** | `media.getAll`          | `Return All`: `false`, `Limit`: 10                                                                                 | Returns list of media items with sizes, MIME types, folders                           | Read-only                                  |
| **30** | `media.get`             | `Media ID`: `med_lighthouse_erie`                                                                                  | Returns detailed media record for `lighthouse-erie.jpg`                               | Read-only                                  |
| **31** | `media.getAllFolders`   | (None required)                                                                                                    | Returns list of folders (`Editorial`, `Destinations`, `Events`, `Authors`, `Scratch`) | Read-only                                  |
| **32** | `media.getFolder`       | `Folder ID`: `fld_editorial`                                                                                       | Returns folder metadata for `Editorial`                                               | Read-only                                  |
| **33** | `media.createFolder`    | `Name`: `Manual Test Folder`                                                                                       | Creates new media folder; returns created folder record                               | Folder creation                            |
| **34** | `media.updateFolder`    | `Folder ID`: (ID from previous create), `Name`: `Renamed Test Folder`                                              | Renames folder; returns updated record                                                | Folder update                              |
| **35** | `media.deleteFolder`    | `Folder ID`: (ID from previous create)                                                                             | Deletes folder; returns confirmation                                                  | **Destructive** (use newly created folder) |
| **36** | `media.getUsage`        | `Media ID`: `med_lighthouse_erie`                                                                                  | Returns usage references in `posts` (`marblehead-light`)                              | Read-only                                  |
| **37** | `media.getUploadTarget` | `Filename`: `test-upload.jpg`, `MIME Type`: `image/jpeg`                                                           | Returns upload target storage URL or signed slot                                      | Read-only                                  |
| **38** | `media.upload`          | `Binary Property`: `data`, using `/home/chris/Projects/emdash-n8n-manual-lab/manual-test-assets/sample-upload.jpg` | Uploads file to EmDash storage; creates media record                                  | Media creation                             |
| **39** | `media.uploadPending`   | `Media ID`: `med_field_notes`                                                                                      | Inspects upload attempt status for pending uploads                                    | Read-only                                  |
| **40** | `media.confirmUpload`   | `Media ID`: (ID from upload)                                                                                       | Confirms upload completion and triggers metadata extraction                           | Media state                                |
| **41** | `media.update`          | `Media ID`: `med_lighthouse_erie`, `Alt Text`: `Updated Marblehead Light Alt`                                      | Updates alt text, caption, or focal point; returns updated media                      | Media update                               |
| **42** | `media.replaceImage`    | `Media ID`: `med_lake_map`, `Binary Property`: `data` (using `sample-vector.svg`)                                  | Replaces file asset while preserving media ID and usage links                         | Asset replacement                          |
| **43** | `media.delete`          | `Media ID`: `med_manual_delete_image`                                                                              | Permanently deletes unattached image and storage file                                 | **Destructive** (use dedicated fixture)    |

---

## 5. Resource 4: Menu (9 Operations)

> [!NOTE]
> Localization parameters (`Locale`) across menu operations (`menu.getAll`, `menu.get`, `menu.delete`, `menu.deleteItem`, `menu.update`, `menu.reorderItems`) are organized under `Options` -> `Locale`. For `menu.updateItem`, `Locale` is configured under `Update Fields` -> `Locale`, and for `menu.createItem`, under `Additional Fields` -> `Locale`.

|   #    | Operation           | Target Fixture / Parameters                                                                                           | Expected n8n Result                                                    | Safety / Notes                          |
| :----: | :------------------ | :-------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- | :-------------------------------------- |
| **44** | `menu.getAll`       | (None required)                                                                                                       | Returns list of menus (`main-navigation`, `footer`, `disposable-menu`) | Read-only                               |
| **45** | `menu.get`          | `Menu ID`: `main-navigation`                                                                                          | Returns full menu hierarchy with nested items                          | Read-only                               |
| **46** | `menu.create`       | `Name`: `manual-test-menu`, `Label`: `Manual Test Menu`                                                               | Creates new navigation menu                                            | Creation test                           |
| **47** | `menu.update`       | `Menu ID`: `manual-test-menu`, `Label`: `Updated Test Menu Label`                                                     | Updates menu label                                                     | Update test                             |
| **48** | `menu.createItem`   | `Menu ID`: `main-navigation`, `Type`: `custom`, `Label`: `Research Data Portal`, `URL`: `https://data.inlandseas.org` | Adds new item to menu; returns created item with ID                    | Item creation                           |
| **49** | `menu.updateItem`   | `Menu ID`: `main-navigation`, `Item ID`: (ID from createItem), `Label`: `Archived Data Portal`                        | Updates item label or URL                                              | Item update                             |
| **50** | `menu.reorderItems` | `Menu ID`: `main-navigation`, `Item Order`: array of item IDs                                                         | Updates `sort_order` for menu items                                    | Structural update                       |
| **51** | `menu.deleteItem`   | `Menu ID`: `disposable-menu`, `Item ID`: `manual-delete-menu-item`                                                    | Removes item from menu                                                 | **Destructive** (use dedicated fixture) |
| **52** | `menu.delete`       | `Menu ID`: `disposable-menu`                                                                                          | Deletes entire menu                                                    | **Destructive** (use dedicated fixture) |

---

## 6. Resource 5: Redirect (9 Operations)

|   #    | Operation                  | Target Fixture / Parameters                                                   | Expected n8n Result                                                 | Safety / Notes                          |
| :----: | :------------------------- | :---------------------------------------------------------------------------- | :------------------------------------------------------------------ | :-------------------------------------- |
| **53** | `redirect.getAllRedirects` | `Return All`: `true`                                                          | Returns all 3 redirect rules                                        | Read-only                               |
| **54** | `redirect.getRedirect`     | `Redirect ID`: `red_001`                                                      | Returns single redirect record (`/old-journal-archive` -> `/posts`) | Read-only                               |
| **55** | `redirect.createRedirect`  | `Source`: `/weather-briefing`, `Destination`: `/events`, `Status Code`: `302` | Creates new redirect rule; returns created entity                   | Creation test                           |
| **56** | `redirect.updateRedirect`  | `Redirect ID`: `red_002`, `Destination`: `/posts`                             | Updates destination URL; returns updated redirect                   | Update test                             |
| **57** | `redirect.get404Entries`   | `Limit`: 10                                                                   | Returns recorded 404 entries (e.g. `/legacy-reports/1998-erie.pdf`) | Read-only                               |
| **58** | `redirect.get404Summary`   | (None required)                                                               | Returns aggregated top 404 paths with hit counts                    | Read-only                               |
| **59** | `redirect.prune404Log`     | `Older Than`: `2020-01-01T00:00:00Z`                                          | Prunes old entries matching threshold; returns pruned count         | Log maintenance                         |
| **60** | `redirect.clear404Log`     | (None required)                                                               | Clears all 404 access log entries                                   | **Destructive** (log reset)             |
| **61** | `redirect.deleteRedirect`  | `Redirect ID`: `red_disposable`                                               | Deletes `/old-manual-path` redirect                                 | **Destructive** (use dedicated fixture) |

---

## 7. Resource 6: Schema (12 Operations)

|   #    | Operation                   | Target Fixture / Parameters                                                                                       | Expected n8n Result                                                        | Safety / Notes                          |
| :----: | :-------------------------- | :---------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :-------------------------------------- |
| **62** | `schema.getCollections`     | (None required)                                                                                                   | Returns all 10 collection schemas with configuration and supports          | Read-only                               |
| **63** | `schema.getCollection`      | `Collection Slug`: `posts`                                                                                        | Returns detailed schema for `posts` collection                             | Read-only                               |
| **64** | `schema.createCollection`   | `Slug`: `manual_temp_collection`, `Label`: `Temporary Collection`, `Supports`: `["drafts"]`                       | Creates new collection and underlying table `ec_manual_temp_collection`    | Schema creation                         |
| **65** | `schema.updateCollection`   | `Collection Slug`: `manual_temp_collection`, `Label`: `Updated Temp Collection`                                   | Updates collection label and configuration                                 | Schema update                           |
| **66** | `schema.reorderCollections` | `Collection Order`: array of collection slugs                                                                     | Reorders admin navigation display order                                    | Schema layout                           |
| **67** | `schema.getFields`          | `Collection Slug`: `posts`                                                                                        | Returns all field definitions on `posts` (`title`, `featured_image`, etc.) | Read-only                               |
| **68** | `schema.getField`           | `Collection Slug`: `posts`, `Field Slug`: `title`                                                                 | Returns field properties (type: `string`, required: `true`)                | Read-only                               |
| **69** | `schema.createField`        | `Collection Slug`: `manual_field_delete`, `Field Slug`: `new_test_field`, `Type`: `string`, `Label`: `Test Field` | Adds new column to collection table                                        | Schema modification                     |
| **70** | `schema.updateField`        | `Collection Slug`: `manual_field_delete`, `Field Slug`: `new_test_field`, `Label`: `Renamed Test Field`           | Updates field label                                                        | Schema modification                     |
| **71** | `schema.reorderFields`      | `Collection Slug`: `manual_field_delete`, `Field Order`: array of field slugs                                     | Reorders field display order in editor                                     | Schema layout                           |
| **72** | `schema.deleteField`        | `Collection Slug`: `manual_field_delete`, `Field Slug`: `delete_me_field`                                         | Drops column from collection                                               | **Destructive** (use dedicated fixture) |
| **73** | `schema.deleteCollection`   | `Collection Slug`: `manual_delete_empty`                                                                          | Drops empty collection and its table                                       | **Destructive** (use dedicated fixture) |

---

## 8. Resource 7: Search (5 Operations)

|   #    | Operation             | Target Fixture / Parameters | Expected n8n Result                                             | Safety / Notes      |
| :----: | :-------------------- | :-------------------------- | :-------------------------------------------------------------- | :------------------ |
| **74** | `search.search`       | `Query`: `Erie`             | Returns matching posts and destinations (e.g. Marblehead Light) | Read-only           |
| **75** | `search.suggest`      | `Query`: `Marb`             | Returns autocomplete suggestions (`Marblehead Light`, etc.)     | Read-only           |
| **76** | `search.getStats`     | (None required)             | Returns index stats (document count, index size, status)        | Read-only           |
| **77** | `search.enableSearch` | `Collection Slug`: `events` | Enables full-text search indexing on `events` collection        | Index configuration |
| **78** | `search.rebuildIndex` | `Collection Slug`: `posts`  | Rebuilds SQLite FTS5 index for collection; returns status       | Index maintenance   |

---

## 9. Resource 8: Section (5 Operations)

|   #    | Operation        | Target Fixture / Parameters                                                                                                                                                      | Expected n8n Result                                            | Safety / Notes                          |
| :----: | :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------- | :-------------------------------------- |
| **79** | `section.getAll` | (None required)                                                                                                                                                                  | Returns all 7 sections (`hero-banner`, `newsletter-cta`, etc.) | Read-only                               |
| **80** | `section.get`    | `Section ID / Slug`: `hero-banner`                                                                                                                                               | Returns section content blocks and metadata                    | Read-only                               |
| **81** | `section.create` | `Slug`: `manual-new-section`, `Title`: `New Field Observation Alert`, `Content (JSON)`: `[{"_type": "block", "children": [{"_type": "span", "text": "Storm warning active."}]}]` | Creates reusable section pattern                               | Section creation                        |
| **82** | `section.update` | `Section ID / Slug`: `manual-new-section`, `Title`: `Updated Field Observation Alert`                                                                                            | Updates section title and content                              | Section update                          |
| **83** | `section.delete` | `Section ID / Slug`: `manual-delete-section`                                                                                                                                     | Permanently deletes reusable section                           | **Destructive** (use dedicated fixture) |

---

## 10. Resource 9: Settings (2 Operations)

|   #    | Operation         | Target Fixture / Parameters                                 | Expected n8n Result                                                     | Safety / Notes         |
| :----: | :---------------- | :---------------------------------------------------------- | :---------------------------------------------------------------------- | :--------------------- |
| **84** | `settings.get`    | (None required)                                             | Returns site configuration (`site:title`, `site:tagline`, locale, etc.) | Read-only              |
| **85** | `settings.update` | `Tagline`: `Updated Field Notes from the Great Lakes Basin` | Updates site tagline; returns updated settings object                   | Non-destructive update |

---

## 11. Resource 10: Taxonomy (10 Operations)

|   #    | Operation                   | Target Fixture / Parameters                                                                                | Expected n8n Result                                                 | Safety / Notes                          |
| :----: | :-------------------------- | :--------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------ | :-------------------------------------- |
| **86** | `taxonomy.getAllTaxonomies` | (None required)                                                                                            | Returns list of taxonomies (`categories`, `tags`, `disposable-tax`) | Read-only                               |
| **87** | `taxonomy.getTaxonomy`      | `Taxonomy Name`: `categories`                                                                              | Returns taxonomy definition and collection bindings                 | Read-only                               |
| **88** | `taxonomy.updateTaxonomy`   | `Taxonomy Name`: `tags`, `Label`: `Content Tags`                                                           | Updates taxonomy label                                              | Taxonomy update                         |
| **89** | `taxonomy.getAllTerms`      | `Taxonomy Name`: `categories`                                                                              | Returns complete tree of category terms                             | Read-only                               |
| **90** | `taxonomy.getTerm`          | `Taxonomy Name`: `categories`, `Term ID / Slug`: `shipwrecks`                                              | Returns term details and parent reference                           | Read-only                               |
| **91** | `taxonomy.createTerm`       | `Taxonomy Name`: `categories`, `Slug`: `coastal-erosion`, `Label`: `Coastal Erosion`, `Parent`: `ecology`  | Inserts new nested category term                                    | Term creation                           |
| **92** | `taxonomy.updateTerm`       | `Taxonomy Name`: `categories`, `Term ID / Slug`: `coastal-erosion`, `Label`: `Shoreline & Coastal Erosion` | Updates term label                                                  | Term update                             |
| **93** | `taxonomy.reorderTerms`     | `Taxonomy Name`: `tags`, `Term Slugs Order`: `["weather", "winter", "freshwater"]`                         | Updates term sorting order                                          | Hierarchy update                        |
| **94** | `taxonomy.deleteTerm`       | `Taxonomy Name`: `disposable-tax`, `Term ID / Slug`: `manual-delete-term`                                  | Deletes term from taxonomy                                          | **Destructive** (use dedicated fixture) |
| **95** | `taxonomy.deleteTaxonomy`   | `Taxonomy Name`: `disposable-tax`                                                                          | Deletes entire taxonomy definition                                  | **Destructive** (use dedicated fixture) |

---

## 12. Resource 11: Widget Area (8 Operations)

|    #    | Operation                   | Target Fixture / Parameters                                                                                                                                                                               | Expected n8n Result                                                                      | Safety / Notes                          |
| :-----: | :-------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- | :-------------------------------------- |
| **96**  | `widgetArea.getAll`         | (None required)                                                                                                                                                                                           | Returns list of widget areas (`sidebar`, `footer`, `homepage`, `disposable-widget-area`) | Read-only                               |
| **97**  | `widgetArea.get`            | `Widget Area ID / Name`: `sidebar`                                                                                                                                                                        | Returns area definition and all child widgets                                            | Read-only                               |
| **98**  | `widgetArea.create`         | `Name`: `manual-temp-widget-area`, `Label`: `Header Banner Area`                                                                                                                                          | Creates new widget area                                                                  | Area creation                           |
| **99**  | `widgetArea.createWidget`   | `Widget Area ID / Name`: `sidebar`, `Type`: `content`, `Title`: `Field Station Hours`, `Content (JSON)`: `[{"_type": "block", "children": [{"_type": "span", "text": "Open daily 08:00 - 18:00 EST."}]}]` | Adds widget to area; returns created widget                                              | Widget creation                         |
| **100** | `widgetArea.updateWidget`   | `Widget Area ID / Name`: `sidebar`, `Widget ID`: (ID from createWidget), `Title`: `Summer Field Station Hours`                                                                                            | Updates widget title or content                                                          | Widget update                           |
| **101** | `widgetArea.reorderWidgets` | `Widget Area ID / Name`: `sidebar`, `Widget IDs Order`: array of widget IDs                                                                                                                               | Updates display order of widgets in the area                                             | Widget sorting                          |
| **102** | `widgetArea.deleteWidget`   | `Widget Area ID / Name`: `disposable-widget-area`, `Widget ID`: `manual-delete-widget`                                                                                                                    | Removes widget from area                                                                 | **Destructive** (use dedicated fixture) |
| **103** | `widgetArea.delete`         | `Widget Area ID / Name`: `disposable-widget-area`                                                                                                                                                         | Deletes entire widget area                                                               | **Destructive** (use dedicated fixture) |

---

## 13. Standalone Node: EmDash Trigger (1 Capability)

|    #    | Capability       | Target Fixture / Configuration                                                                                | Expected n8n Result                                                                                                                                                                                       | Safety / Notes      |
| :-----: | :--------------- | :------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------ |
| **104** | `EmDash Trigger` | EmDash Webhook credential: `EmDash Local Lab Webhook`<br>Events: `*` (All Events)<br>Collection Filter: blank | Uses the URL generated by n8n. For the seeded stable webhook ID, the production URL is `http://127.0.0.1:5680/webhook/emdash-manual-trigger/webhook`. A saved post produces a `content:update` execution. | Active trigger test |

### Trigger Verification Steps:

1. Open workflow `01 - EmDash Trigger Verification`, attach the separate **EmDash Webhook**
   credential, and confirm **Events** is **All Events** (`*`) with a blank **Collection Filter**.
2. Click **Listen for test event**, copy the generated **Test URL**, and set the EmDash Webhook
   Notifier URL to that exact value. Keep the notifier secret equal to the credential secret; its
   plugin event setting remains `all`.
3. In a separate tab, open EmDash Admin ([http://127.0.0.1:4321/\_emdash/api/setup/dev-bypass?redirect=/\_emdash/admin](http://127.0.0.1:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin)).
4. Edit a disposable or safely reversible post field and click **Save**. Verify one execution arrives
   with event `content:update`, resource type `content`, the expected collection, resource ID, and
   timestamp.
5. Verify rejection behavior with a missing or incorrect bearer secret (`401`) and malformed or
   unsupported payload (`400`). Confirm these requests do not execute the downstream node.
6. Set a collection filter that excludes the edited collection and verify the valid request is
   acknowledged but ignored; restore the blank filter and verify delivery resumes.
7. Publish and activate the workflow, copy its generated **Production URL** into the notifier, and
   repeat the `content:update` check without **Listen for test event**. For this fixture, expect
   `http://127.0.0.1:5680/webhook/emdash-manual-trigger/webhook`.
8. Deactivate the workflow and verify the production endpoint no longer triggers an execution. When
   returning to canvas testing, switch the notifier back to the newly generated Test URL.

---

## 14. Destructive Testing Safety & Reset Procedure

- All destructive tests use pre-isolated fixtures prefixed with `manual-delete-*`, `disposable-*`, or `manual-trash-*`.
- **Never** perform destructive operations on core fixtures (`posts`, `marblehead-light`, `fld_editorial`, etc.).
- When testing is complete or if fixtures need to be restored to their original state:
  ```bash
  /home/chris/Projects/emdash-n8n-manual-lab/reset.sh
  ```
  The reset script will cleanly stop the services, re-seed all database tables, re-link media and comments, re-import workflows, and restart the services within 10 seconds.
