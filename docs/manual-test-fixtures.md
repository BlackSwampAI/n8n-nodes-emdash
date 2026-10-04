# EmDash Manual Test Lab Fixtures Inventory

> **Historical:** This document describes package versions that included the now-removed EmDash webhook trigger. It is retained as an audit record only. Version 0.1.4 supports 103 EmDash REST actions; migrate existing trigger workflows to Schedule Trigger + EmDash actions or another independently supported event source.

This document details all pre-seeded entities, credentials, and test assets created in the persistent local manual test lab located at `/home/chris/Projects/emdash-n8n-manual-lab`.

> [!NOTE]
> **Observed on 2026-09-30:** a fresh packed package in isolated n8n 2.30.6 registered one scoped
> **EmDash** action node and one scoped **EmDash Trigger**, plus n8n's generated **EmDash Tool**. No
> `N8N_CUSTOM_EXTENSIONS` duplicates appeared. Both icon HTTP routes returned 200 with official asset
> bytes. Browser automation was unavailable, so node-picker/icon appearance and dynamic dropdowns
> still require human visual checks.

The same run completed successful reads across all 11 resources and exercised direct trigger
authentication, payload validation, filters, wildcard events, restart, activation, and deactivation.
It did not run all 103 actions. Full Webhook Notifier delivery is also pending: local EmDash core SSRF
protection rejects its loopback destination despite the notifier development flag. On the public
droplet, use n8n's generated HTTPS production URL, attach the workflow's **EmDash Webhook** credential,
and set the same shared token in that credential and the notifier. See `docs/testing.md` for the exact
observed cases and limitations.

---

## 1. Test Lab Service Architecture & Endpoints

| Service             | Local URL                                                                    | Port / Broker                  | Description                                                  |
| :------------------ | :--------------------------------------------------------------------------- | :----------------------------- | :----------------------------------------------------------- |
| **EmDash CMS**      | `http://127.0.0.1:4321`                                                      | HTTP: `4321`                   | Upstream Astro + SQLite runtime with Webhook Notifier plugin |
| **EmDash Admin**    | `http://127.0.0.1:4321/_emdash/admin`                                        | HTTP: `4321`                   | Visual admin dashboard                                       |
| **Dev Bypass**      | `http://127.0.0.1:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin` | HTTP: `4321`                   | One-click auto-login link (bypasses WebAuthn/passkey prompt) |
| **Isolated n8n**    | `http://127.0.0.1:5680`                                                      | HTTP: `5680`<br>Broker: `5681` | Clean n8n v2.30.6 with packed local node `.tgz` installed    |
| **Trigger Webhook** | `http://127.0.0.1:5680/webhook/emdash-manual-trigger/webhook`                | HTTP: `5680`                   | Production URL for the seeded trigger workflow               |

> [!NOTE]
> The user's primary n8n instance on ports `5678` and `5679` is completely untouched. Port `5678` is guarded with hard assertions in `start.sh` so it can never be targeted or disrupted.

---

## 2. Authentication & Secrets

Local development secrets are saved exclusively in the lab's ignored configuration file:
`/home/chris/Projects/emdash-n8n-manual-lab/.manual-test.env`

| Property            | Value                               | Notes                                                                                                        |
| :------------------ | :---------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| **User Email**      | `dev@emdash.local`                  | Role `50` (Administrator)                                                                                    |
| **User ID**         | `usr_dev_admin_001`                 | Pre-created in SQLite `users` table                                                                          |
| **Admin PAT Token** | `ec_pat_manual_test_lab_master_key` | Scopes: `content:read`, `content:write`, `media:read`, `media:write`, `schema:read`, `schema:write`, `admin` |
| **Webhook Secret**  | `emdash-manual-test-secret-2026`    | Configured in Webhook Notifier plugin settings                                                               |

### Creating n8n Credentials

In the n8n UI (`http://127.0.0.1:5680`):

1. Navigate to **Credentials** -> **New Credential** -> Select **EmDash API**.
2. **Site URL**: `http://127.0.0.1:4321`
3. **API Token**: `ec_pat_manual_test_lab_master_key`
4. Click **Save**.

Create a separate **EmDash Webhook** credential named `EmDash Local Lab Webhook`, set **Secret
Token** to `emdash-manual-test-secret-2026`, and attach it to the **EmDash Trigger** node in workflow
`01 - EmDash Trigger Verification`. The workflow fixture intentionally contains no credential ID or
inline secret because credential records belong to each n8n installation.

Open the trigger node and copy the URL generated by n8n for the mode being tested. Use the generated
**Test URL** while **Listen for test event** is active, then switch the EmDash Webhook Notifier to the
generated **Production URL** after publishing and activating the workflow. EmDash stores one webhook
destination per site, so switching the notifier URL is necessary when moving between test and
production lifecycle checks. With this fixture's stable `webhookId`, the expected production URL is
`http://127.0.0.1:5680/webhook/emdash-manual-trigger/webhook`.

### Confirming Single Package Discovery

The isolated n8n service discovers `@blackswampai/n8n-nodes-emdash` from its installed Community
Nodes package only. In the node picker, verify there is one **EmDash** action node and one distinct
**EmDash Trigger** node. Duplicate action or trigger entries indicate a stale process or an unexpected
extension environment and must be resolved before recording editor smoke evidence.

---

## 3. Pre-Seeded Schema Collections & Fields

The site theme is **Great Lakes Field Journal** (maritime history, shipwrecks, lighthouses, ecology, field research).

### Collections

| Collection Slug              | Label                         | Supports                       | Description / Test Role                                |
| :--------------------------- | :---------------------------- | :----------------------------- | :----------------------------------------------------- |
| `posts`                      | Posts                         | drafts, revisions, search, seo | Primary content collection; comments enabled           |
| `destinations`               | Destinations                  | drafts, search                 | Geographic exploration points and coastal habitats     |
| `events`                     | Events                        | drafts, scheduling             | Field surveys, expeditions, and academic workshops     |
| `authors`                    | Authors                       | search                         | Research scientists and maritime historians            |
| `pages`                      | Pages                         | drafts, revisions, search      | Standard static site pages                             |
| `manual_delete_empty`        | Disposable Empty Collection   | —                              | Dedicated target for `schema.deleteCollection`         |
| `manual_delete_with_content` | Doomed Collection (Populated) | —                              | Contains 2 doomed content items to test cascade safety |
| `manual_reference_parent`    | Reference Parent              | —                              | Parent end of relation `parent_child_manual`           |
| `manual_reference_child`     | Reference Child               | —                              | Child end of relation `parent_child_manual`            |
| `manual_field_delete`        | Field Delete Target           | —                              | Contains fields `delete_me_field` and `keep_me_field`  |

### Relations

| Relation Slug         | Parent Collection         | Child Collection         | Max Children | Role                                       |
| :-------------------- | :------------------------ | :----------------------- | :----------- | :----------------------------------------- |
| `post_authors`        | `posts`                   | `authors`                | 2            | Links posts to author profiles             |
| `parent_child_manual` | `manual_reference_parent` | `manual_reference_child` | Unlimited    | Relation tests and reference field binding |

---

## 4. Content Entries Inventory

Over 55 content records pre-populated across various publication states.

### `posts` Collection

| Content ID / Slug                              | Title                                                           | Status    | Special Test Attributes                                                                                    |
| :--------------------------------------------- | :-------------------------------------------------------------- | :-------- | :--------------------------------------------------------------------------------------------------------- |
| `marblehead-light`                             | Marblehead Light: Guarding Lake Erie Since 1821                 | Published | Has attached media `lighthouse-erie.jpg` and `_emdash_media_usage` records                                 |
| `wreck-of-the-edmund-fitzgerald`               | The Wreck of the Edmund Fitzgerald: Echoes in Whitefish Bay     | Published | Rich Portable Text blocks, tags, category references                                                       |
| `western-basin-wetland-restoration`            | Western Basin Wetland Restoration Progress Report               | Published | Ecology taxonomy terms assigned                                                                            |
| `winter-gales-of-november`                     | Winter Gales of November: Understanding Lake Superstorms        | Published | Searchable weather keywords                                                                                |
| `lake-trout-spawning-reefs`                    | Lake Trout Spawning Reefs in Lake Huron                         | Published | Fisheries taxonomy assigned                                                                                |
| `split-rock-lighthouse`                        | Split Rock Lighthouse: Beacon of the North Shore                | Published | Lighthouses category                                                                                       |
| `old-woman-creek-estuary`                      | Old Woman Creek Estuary: Seasonal Hydrology Notes               | Published | Wetlands category                                                                                          |
| `ghost-ships-of-mackinac`                      | Ghost Ships of the Straits of Mackinac                          | Published | Shipwrecks category                                                                                        |
| `st-clair-river-delta`                         | St. Clair River Delta: North America's Largest Freshwater Delta | Published | Ecology category                                                                                           |
| `presque-isle-peninsula`                       | Presque Isle Peninsula: A Moving Sand Spit                      | Published | Coastal geology                                                                                            |
| `point-pelee-bird-migration`                   | Point Pelee Bird Migration and Coastal Marsh Ecology            | Published | Seasonal migration notes                                                                                   |
| `apostle-islands-sea-caves`                    | Apostle Islands Sea Caves: Winter Ice Formations                | Published | Winter landscape photography                                                                               |
| `sleeping-bear-dunes-geology`                  | Sleeping Bear Dunes: Glacial Geology and Perched Dunes          | Published | Glacial geology notes                                                                                      |
| `isle-royale-wolf-moose-study`                 | Isle Royale Wolf-Moose Ecological Study Notes                   | Published | Wildlife biology data                                                                                      |
| `niagara-escarpment-reefs`                     | Niagara Escarpment: Ancient Silurian Reef Remnants              | Published | Ancient reef fossils                                                                                       |
| `long-point-biosphere-reserve`                 | Long Point World Biosphere Reserve Ecology                      | Published | Biosphere reserve notes                                                                                    |
| `draft-deepwater-coregonid-surveys`            | Draft: Deepwater Coregonid Surveys in Lake Michigan             | Draft     | Non-published draft test target                                                                            |
| `draft-lake-superior-ice-trends`               | Draft: Lake Superior Ice Cover Trends 1973-2025                 | Draft     | Non-published draft test target                                                                            |
| `scheduled-spring-2027-survey`                 | Scheduled: 2027 Spring Great Lakes BioBlitz                     | Scheduled | `scheduled_at: 2027-04-15 10:00:00`                                                                        |
| `scheduled-summer-2027-cruises`                | Scheduled: Summer 2027 Research Vessel Cruises                  | Scheduled | `scheduled_at: 2027-06-01 09:00:00`                                                                        |
| `trashed-outdated-navigation-buoy-coordinates` | Trashed: Outdated Navigation Buoy Coordinates                   | Trashed   | `deleted_at: 2026-09-01 12:00:00`                                                                          |
| **`manual-update-target`**                     | Manual Update Target Post                                       | Published | **Has 3 historical revisions** in `revisions` table (`rev_update_001`, `rev_update_002`, `rev_update_003`) |
| **`great-lakes-overview-en`**                  | Great Lakes Field Overview (English)                            | Published | `locale: en`, `translation_group: tg-gl-overview`                                                          |
| **`great-lakes-overview-es`**                  | Panorama de los Grandes Lagos (Español)                         | Published | `locale: es`, `translation_group: tg-gl-overview`                                                          |
| **`manual-delete-me-draft`**                   | Manual Delete Me Draft Post                                     | Draft     | **Target for `content.delete` (permanent)**                                                                |
| **`manual-delete-me-published`**               | Manual Delete Me Published Post                                 | Published | **Target for `content.delete` / unpublish tests**                                                          |
| **`manual-trash-me`**                          | Manual Trash Me Post                                            | Published | **Target for `content.trash`**                                                                             |
| **`manual-restore-me`**                        | Manual Restore Me Post (Trashed)                                | Trashed   | **Target for `content.restore`**                                                                           |
| **`manual-unpublish-me`**                      | Manual Unpublish Me Post                                        | Published | **Target for `content.unpublish`**                                                                         |
| **`manual-archive-me`**                        | Manual Archive Me Post                                          | Published | **Target for `content.archive`**                                                                           |

### Other Collections

- `destinations`: 11 entries (Marblehead Point, Whitefish Point, Old Woman Creek, Mackinac Island, Isle Royale, Sleeping Bear Dunes, Point Pelee, Presque Isle, Apostle Islands, Put-in-Bay, Lake St. Clair Flats).
- `events`: 6 entries (Annual Shipwreck Symposium 2027, Spring Wetland BioBlitz, Lake Superior Kayak Survey, Maritime Archaeology Workshop, Winter Ice Ecology Field Seminar, Coastal Migratory Bird Count).
- `authors`: 4 entries (Dr. Helena Vance, Capt. Robert MacIntyre, Dr. Sarah Lindqvist, Marcus Chen).
- `manual_delete_with_content`: 2 entries (`doomed-entry-1`, `doomed-entry-2`).
- `manual_reference_parent` / `manual_reference_child`: `test-parent-1` linking `test-child-1`.
- `manual_field_delete`: `field-test-entry-1`.

---

## 5. Taxonomies & Terms

| Taxonomy Name        | Label               | Type         | Collections             | Terms (Hierarchy / Slugs)                                                                                                     |
| :------------------- | :------------------ | :----------- | :---------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `categories`         | Categories          | Hierarchical | `posts`, `destinations` | `maritime-history`<br> ├ `shipwrecks`<br> │ └ `lake-erie`<br> └ `lighthouses`<br>`ecology`<br> ├ `wetlands`<br> └ `fisheries` |
| `tags`               | Tags                | Flat         | `posts`                 | `freshwater`, `ecology`, `winter`, `research`, `conservation`, `archaeology`, `weather`, `navigation`                         |
| **`disposable-tax`** | Disposable Taxonomy | Flat         | `posts`                 | `disposable-term-1`, **`manual-delete-term`** (target for term delete)                                                        |

---

## 6. Media & Storage

### Storage Directory

`/home/chris/Projects/emdash-n8n-manual-lab/emdash/demos/simple/uploads/`

### Folders in `media_folders`

| Folder ID          | Name         | Role                                            |
| :----------------- | :----------- | :---------------------------------------------- |
| `fld_editorial`    | Editorial    | Primary editorial articles and header images    |
| `fld_destinations` | Destinations | Field maps, geographic charts, site photos      |
| `fld_events`       | Events       | Event flyers and expedition photos              |
| `fld_authors`      | Authors      | Staff and researcher avatar portraits           |
| `fld_scratch`      | Scratch      | Temporary workspace and disposable test targets |

### Pre-Seeded Media Records

| Media ID                      | Filename                  | MIME Type         | Folder             | Description / Test Role                     |
| :---------------------------- | :------------------------ | :---------------- | :----------------- | :------------------------------------------ |
| `med_lighthouse_erie`         | `lighthouse-erie.jpg`     | `image/jpeg`      | `fld_editorial`    | Linked in `posts` and `_emdash_media_usage` |
| `med_wetlands_survey`         | `wetlands-survey.pdf`     | `application/pdf` | `fld_destinations` | Document attachment                         |
| `med_field_notes`             | `field-notes.txt`         | `text/plain`      | `fld_editorial`    | Plain text field log                        |
| `med_lake_map`                | `lake-map.svg`            | `image/svg+xml`   | `fld_destinations` | Vector bathymetric chart                    |
| `med_researcher_avatar`       | `researcher-avatar.jpg`   | `image/jpeg`      | `fld_authors`      | Author profile avatar                       |
| **`med_manual_delete_image`** | `manual-delete-image.jpg` | `image/jpeg`      | `fld_scratch`      | **Target for `media.delete` (unattached)**  |

### Binary Upload Test Assets

Stored in `/home/chris/Projects/emdash-n8n-manual-lab/manual-test-assets/` for testing `media.upload`:

- `sample-upload.jpg`
- `sample-upload.png`
- `sample-doc.pdf`
- `sample-notes.txt`
- `sample-vector.svg`

---

## 7. Comments

Pre-seeded in `_emdash_comments` attached to `posts`:

| Comment ID                  | Status     | Author                  | Parent ID          | Description / Role                       |
| :-------------------------- | :--------- | :---------------------- | :----------------- | :--------------------------------------- |
| `cmt_approved_001`          | `approved` | Capt. Donald Bell       | null               | Validated technical dive observation     |
| `cmt_reply_001`             | `approved` | Field Researcher Marcus | `cmt_approved_001` | **Threaded reply** to `cmt_approved_001` |
| `cmt_pending_001`           | `pending`  | Guest Researcher        | null               | Moderation review target                 |
| `cmt_spam_001`              | `spam`     | Marine Parts Bot        | null               | Spam moderation target                   |
| `cmt_trash_001`             | `trash`    | Anonymous               | null               | Trashed comment target                   |
| **`manual-delete-comment`** | `approved` | Test User               | null               | **Target for `comment.delete`**          |

---

## 8. Menus & Items

| Menu ID / Name        | Label           | Items                                                                                     |
| :-------------------- | :-------------- | :---------------------------------------------------------------------------------------- |
| `main-navigation`     | Main Navigation | Home, Field Notes (children: Maritime History, Ecology), Destinations, Expeditions, About |
| `footer`              | Footer Menu     | Privacy Policy, Research Methodology, Field Station Contact, Data Archive                 |
| **`disposable-menu`** | Disposable Menu | Menu Item 1, **`manual-delete-menu-item`** (target for item delete)                       |

---

## 9. Redirects & 404 Access Logs

### Redirects

| ID                   | Source                 | Destination        | Type | Group          | Role                                     |
| :------------------- | :--------------------- | :----------------- | :--- | :------------- | :--------------------------------------- |
| `red_001`            | `/old-journal-archive` | `/posts`           | 301  | —              | Permanent legacy path migration          |
| `red_002`            | `/expedition-signup`   | `/events`          | 302  | —              | Temporary campaign redirect              |
| **`red_disposable`** | `/old-manual-path`     | `/new-manual-path` | 301  | `manual-tests` | **Target for `redirect.deleteRedirect`** |

### 404 Access Log Entries (`_emdash_404_log`)

- `/legacy-reports/1998-erie.pdf` (42 hits, referrer: `https://search.marine-history.org`)
- `/old-weather-buoy-feed.json` (18 hits, referrer: `https://weather-collector.local`)
- `/wp-login.php` (156 hits, probe traffic)
- `/field-photos/2012/survey-map.png` (7 hits, referrer: `https://inlandseas.org`)

---

## 10. Reusable Sections

| Section Slug                | Title                                                        | Source  | Role                            |
| :-------------------------- | :----------------------------------------------------------- | :------ | :------------------------------ |
| `hero-banner`               | Great Lakes Field Journal: Observations from the Inland Seas | `user`  | Header hero unit                |
| `newsletter-cta`            | Subscribe to the Freshwater Dispatch                         | `user`  | Email signup pattern            |
| `author-spotlight`          | Field Researcher Profile                                     | `user`  | Contributor highlight block     |
| `theme-header-block`        | Site Header Navigation Banner                                | `theme` | Theme-provided reusable pattern |
| **`manual-delete-section`** | Disposable Section For Manual Deletion                       | `user`  | **Target for `section.delete`** |

---

## 11. Widget Areas & Widgets

| Area ID / Name               | Label                  | Widgets                                                                                                                     |
| :--------------------------- | :--------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `sidebar`                    | Main Sidebar           | 1. Content: "Field Station Notice"<br>2. Menu: "Explore Topics" (`main-navigation`)<br>3. Component: `weather-station-card` |
| `footer`                     | Site Footer Area       | 1. Content: "About the Great Lakes Journal"<br>2. Menu: "Footer Navigation" (`footer`)                                      |
| `homepage`                   | Homepage Main Area     | 1. Content: "Welcome Banner"                                                                                                |
| **`disposable-widget-area`** | Disposable Widget Area | 1. **`manual-delete-widget`** (target for widget delete)                                                                    |

---

## 12. Lab Management CLI Commands

Run these directly inside `/home/chris/Projects/emdash-n8n-manual-lab`:

```bash
# Check status of both services and HTTP reachability
./status.sh

# Start both EmDash (port 4321) and n8n (port 5680) in background
./start.sh

# Stop both services cleanly and release ports
./stop.sh

# Tail recent logs from both services
./logs.sh

# Re-run full seed and restart both services cleanly
./reset.sh

# Run automated smoke verification across all 11 resources
./smoke-verify.mjs
```
